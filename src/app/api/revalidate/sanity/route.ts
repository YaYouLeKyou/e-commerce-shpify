// ============================================================
// Sanity Webhook — On-Demand Revalidation
// ============================================================
// Listens to Sanity webhook events (document publish/update/delete)
// and invalidates the Next.js cache via revalidateTag().
//
// Secured with a shared secret (REVALIDATE_SECRET) passed in the
// "x-webhook-secret" header.
// ============================================================

import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

// ============================================================
// Configuration
// ============================================================

const SANITY_CACHE_TAGS = {
  heroBanners: "sanity-hero-banners",
  blogPosts: "sanity-blog-posts",
  blogPost: (slug: string) => `sanity-blog-post-${slug}`,
  pages: "sanity-pages",
  page: (slug: string) => `sanity-page-${slug}`,
}

// ============================================================
// POST Handler
// ============================================================

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET

  // --- Verify the shared secret ---
  if (!secret) {
    console.error("[Sanity Webhook] REVALIDATE_SECRET is not set")
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    )
  }

  const webhookSecret = request.headers.get("x-webhook-secret")

  if (webhookSecret !== secret) {
    console.warn("[Sanity Webhook] Invalid or missing secret")
    return NextResponse.json(
      { message: "Unauthorized — invalid secret" },
      { status: 401 }
    )
  }

  // --- Parse the webhook payload ---
  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    console.error("[Sanity Webhook] Invalid JSON payload")
    return NextResponse.json(
      { message: "Invalid JSON" },
      { status: 400 }
    )
  }

  // --- Extract document info ---
  const documentType = payload._type as string | undefined
  const slug =
    (payload.slug as { current?: string } | undefined)?.current ||
    (payload.slug as string | undefined)
  const operation = payload._op as string | undefined

  console.log(
    `[Sanity Webhook] Received: type=${documentType}, op=${operation}, slug=${slug}`
  )

  // --- Determine which cache tags to revalidate ---
  const tagsToRevalidate: string[] = []

  switch (documentType) {
    case "heroBanner":
      tagsToRevalidate.push(SANITY_CACHE_TAGS.heroBanners)
      break

    case "blogPost":
      tagsToRevalidate.push(SANITY_CACHE_TAGS.blogPosts)
      if (slug) {
        tagsToRevalidate.push(SANITY_CACHE_TAGS.blogPost(slug))
      }
      break

    case "page":
      tagsToRevalidate.push(SANITY_CACHE_TAGS.pages)
      if (slug) {
        tagsToRevalidate.push(SANITY_CACHE_TAGS.page(slug))
      }
      break

    default:
      // For unknown document types, revalidate all Sanity tags
      console.log(
        `[Sanity Webhook] Unknown document type: ${documentType} — revalidating all Sanity tags`
      )
      tagsToRevalidate.push(
        SANITY_CACHE_TAGS.heroBanners,
        SANITY_CACHE_TAGS.blogPosts,
        SANITY_CACHE_TAGS.pages
      )
      break
  }

  // --- Revalidate the cache tags ---
  for (const tag of tagsToRevalidate) {
    try {
      // Use { expire: 0 } for immediate expiration (webhook use case)
      revalidateTag(tag, { expire: 0 })
      console.log(`[Sanity Webhook] Revalidated cache tag: ${tag}`)
    } catch (error) {
      console.error(
        `[Sanity Webhook] Failed to revalidate tag "${tag}":`,
        error
      )
    }
  }

  return NextResponse.json(
    {
      message: "Revalidation triggered",
      revalidated: tagsToRevalidate,
      documentType,
      operation,
      slug,
    },
    { status: 200 }
  )
}

// ============================================================
// GET Handler — Health check
// ============================================================

export async function GET() {
  return NextResponse.json(
    { message: "Sanity webhook endpoint is active" },
    { status: 200 }
  )
}
