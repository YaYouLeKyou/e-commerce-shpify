"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ShopifyProduct } from "@/lib/shopify/types"

/**
 * Format a price string from Shopify (e.g. "49.99") to a localized price.
 */
function formatPrice(amount: string, currencyCode: string = "EUR"): string {
  const numericAmount = parseFloat(amount)
  if (isNaN(numericAmount)) return amount

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}

/**
 * Check if a product has a discount (compareAtPrice > price).
 */
function hasDiscount(product: ShopifyProduct): boolean {
  const minPrice = parseFloat(product.priceRange.minVariantPrice.amount)
  const compareAt = product.variants?.[0]?.compareAtPrice
  if (!compareAt) return false
  return parseFloat(compareAt.amount) > minPrice
}

interface ProductCardProps {
  product: ShopifyProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.featuredImage
  const minPrice = product.priceRange.minVariantPrice
  const maxPrice = product.priceRange.maxVariantPrice
  const isSinglePrice = minPrice.amount === maxPrice.amount
  const discounted = hasDiscount(product)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-lg">
      {/* Image container */}
      <Link
        href={`/products/${product.handle}`}
        className="relative aspect-square overflow-hidden bg-muted"
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            width={image.width}
            height={image.height}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}

        {/* Discount badge */}
        {discounted && (
          <span className="absolute left-2 top-2 rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground">
            Promo
          </span>
        )}

        {/* Quick add button (appears on hover) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <Button
            variant="default"
            size="sm"
            className="w-full rounded-none"
            onClick={(e) => {
              e.preventDefault()
              // TODO: Implement add-to-cart logic
              console.log("Add to cart:", product.handle)
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ajouter au panier
          </Button>
        </div>
      </Link>

      {/* Product info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {/* Vendor / Brand */}
        {product.vendor && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.vendor}
          </p>
        )}

        {/* Title */}
        <Link href={`/products/${product.handle}`}>
          <h3 className="font-medium leading-tight text-foreground line-clamp-2 hover:underline">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-1.5 pt-1">
          <span className="text-sm font-semibold text-foreground">
            {isSinglePrice
              ? formatPrice(minPrice.amount, minPrice.currencyCode)
              : `${formatPrice(minPrice.amount, minPrice.currencyCode)} – ${formatPrice(maxPrice.amount, maxPrice.currencyCode)}`}
          </span>

          {discounted && product.variants?.[0]?.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(
                product.variants[0].compareAtPrice.amount,
                product.variants[0].compareAtPrice.currencyCode
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}