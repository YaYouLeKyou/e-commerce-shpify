// ============================================================
// Shopify Webhook — On-Demand Revalidation
// ============================================================
// Listens to Shopify webhook events (e.g. product updates) and
// invalidates the Next.js cache via revalidateTag().
//
// Secured with a shared secret (REVALIDATE_SECRET) passed in the
// "X-Shopify-Hmac-Sha256" header for HMAC verification.
// ============================================================

import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// ============================================================
// Configuration
// ============================================================

const SHOPIFY_CACHE_TAGS = {
  products: "shopify-products",
  product: (handle: string) => `shopify-product-${handle}`,
  collections: "shopify-collections",
  collection: (handle: string) => `shopify-collection-${handle}`,
}

// ============================================================
// HMAC Verification
// ============================================================

/**
 * Verify the Shopify webhook HMAC signature.
 * Shopify sends the HMAC in the "X-Shopify-Hmac-Sha256" header,
 * computed from the raw request body using the shared secret.
 */
function verifyShopifyHmac(
  body: string,
  hmacHeader: string | null,
  secret: string
): boolean {
  if (!hmacHeader || !secret) return false

  try {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("base64")

    return crypto.timingSafeEqual(
      Buffer.from(digest, "base64"),
      Buffer.from(hmacHeader, "base64")
    )
  } catch {
    return false
  }
}

// ============================================================
// POST Handler
// ============================================================

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET

  // --- Verify the shared secret ---
  if (!secret) {
    console.error("[Shopify Webhook] REVALIDATE_SECRET is not set")
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    )
  }

  // --- Read the raw body for HMAC verification ---
  const body = await request.text()
  const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256")

  if (!verifyShopifyHmac(body, hmacHeader, secret)) {
    console.warn("[Shopify Webhook] Invalid HMAC signature")
    return NextResponse.json(
      { message: "Unauthorized — invalid signature" },
      { status: 401 }
    )
  }

  // --- Parse the webhook payload ---
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(body)
  } catch {
    console.error("[Shopify Webhook] Invalid JSON payload")
    return NextResponse.json(
      { message: "Invalid JSON" },
      { status: 400 }
    )
  }

  // --- Determine the event type ---
  const topic = request.headers.get("X-Shopify-Topic")
  const resource = payload.resource as string | undefined

  console.log(`[Shopify Webhook] Received event: ${topic}`)

  // --- Revalidate based on event type ---
  const tagsToRevalidate: string[] = []

  switch (topic) {
    // Product events — invalidate product-specific and global product cache
    case "PRODUCTS_CREATE":
    case "PRODUCTS_UPDATE":
    case "PRODUCTS_DELETE":
      tagsToRevalidate.push(SHOPIFY_CACHE_TAGS.products)
      if (resource) {
        // The handle may be in the payload
        const handle = payload.handle as string | undefined
        if (handle) {
          tagsToRevalidate.push(SHOPIFY_CACHE_TAGS.product(handle))
        }
      }
      break

    // Collection events — invalidate collection cache
    case "COLLECTIONS_CREATE":
    case "COLLECTIONS_UPDATE":
    case "COLLECTIONS_DELETE":
      tagsToRevalidate.push(SHOPIFY_CACHE_TAGS.collections)
      break

    // Order events — could invalidate order-related pages
    case "ORDERS_CREATE":
    case "ORDERS_UPDATED":
      // No specific cache tag for orders yet, but log for future use
      console.log("[Shopify Webhook] Order event received — no cache to revalidate")
      break

    default:
      console.log(`[Shopify Webhook] Unhandled event type: ${topic}`)
      break
  }

  // --- Revalidate the cache tags ---
  for (const tag of tagsToRevalidate) {
    try {
      // Use { expire: 0 } for immediate expiration (webhook use case)
      revalidateTag(tag, { expire: 0 })
      console.log(`[Shopify Webhook] Revalidated cache tag: ${tag}`)
    } catch (error) {
      console.error(
        `[Shopify Webhook] Failed to revalidate tag "${tag}":`,
        error
      )
    }
  }

  return NextResponse.json(
    {
      message: "Revalidation triggered",
      revalidated: tagsToRevalidate,
      event: topic,
    },
    { status: 200 }
  )
}

// ============================================================
// GET Handler — Health check
// ============================================================

export async function GET() {
  return NextResponse.json(
    { message: "Shopify webhook endpoint is active" },
    { status: 200 }
  )
}
