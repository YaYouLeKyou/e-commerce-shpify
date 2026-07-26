// ============================================================
// Product Detail Page — Dynamic Product from Shopify
// ============================================================
// Server Component that fetches a single product by handle and
// renders a client-side interactive product view with:
//   - Image carousel / gallery
//   - Variant selector (size, color, etc.)
//   - Live price update on variant change
//   - Add-to-cart button (wired to the CartContext)
// ============================================================

import { notFound } from "next/navigation"
import { getProductByHandle } from "@/lib/shopify"
import ProductView from "@/components/ProductView"

import type { ShopifyProduct } from "@/lib/shopify/types"

// ============================================================
// Page
// ============================================================

interface ProductPageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = await params
  const product = await getProductByHandle(handle).catch(() => null)

  if (!product) {
    return { title: "Produit introuvable" }
  }

  return {
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.description,
    openGraph: {
      title: product.title,
      description: product.seo?.description || product.description,
      images: product.featuredImage ? [product.featuredImage.url] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params

  let product: ShopifyProduct | null

  try {
    product = await getProductByHandle(handle)
  } catch {
    product = null
  }

  if (!product) {
    notFound()
  }

  return <ProductView product={product} />
}
