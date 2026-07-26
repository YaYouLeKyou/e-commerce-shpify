// ============================================================
// ProductView — Interactive Product Detail (Client Component)
// ============================================================
// Renders a Shopify product with:
//   - Image carousel / gallery with thumbnail navigation
//   - Variant selector (size, color, etc.) — interactive
//   - Live price update when a variant is selected
//   - Add-to-cart button wired to the CartContext
// ============================================================

"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn, formatPrice } from "@/lib/utils"
import { useCart } from "@/context/cart-context"

import type { ShopifyProduct, ShopifyProductVariant } from "@/lib/shopify/types"

// ============================================================
// Types
// ============================================================

interface ProductViewProps {
  product: ShopifyProduct
}

// ============================================================
// Helpers
// ============================================================

/**
 * Build a lookup map of variant option values for a given option name.
 * e.g. optionName "Size" → ["S", "M", "L"]
 */
function getOptionValues(
  variants: ShopifyProductVariant[],
  optionName: string
): string[] {
  const values = new Set<string>()
  for (const variant of variants) {
    const option = variant.selectedOptions.find(
      (o) => o.name.toLowerCase() === optionName.toLowerCase()
    )
    if (option) values.add(option.value)
  }
  return Array.from(values)
}

/**
 * Find the variant that matches the current selection of options.
 * Falls back to the first available variant.
 */
function findMatchingVariant(
  variants: ShopifyProductVariant[],
  selection: Record<string, string>
): ShopifyProductVariant | undefined {
  // Try exact match first
  for (const variant of variants) {
    const matches = variant.selectedOptions.every(
      (opt) =>
        selection[opt.name.toLowerCase()] === undefined ||
        selection[opt.name.toLowerCase()] === opt.value
    )
    if (matches) return variant
  }
  return variants[0]
}

/**
 * Check if an option value is available for selection given the current
 * partial selection (i.e. there exists at least one variant with this
 * value that is also available for sale).
 */
function isOptionValueAvailable(
  variants: ShopifyProductVariant[],
  optionName: string,
  optionValue: string,
  currentSelection: Record<string, string>
): boolean {
  return variants.some((variant) => {
    const opt = variant.selectedOptions.find(
      (o) => o.name.toLowerCase() === optionName.toLowerCase()
    )
    if (!opt || opt.value !== optionValue) return false
    // Check that all other selected options match
    for (const [key, val] of Object.entries(currentSelection)) {
      if (key === optionName.toLowerCase()) continue
      const otherOpt = variant.selectedOptions.find(
        (o) => o.name.toLowerCase() === key
      )
      if (!otherOpt || otherOpt.value !== val) return false
    }
    return variant.availableForSale
  })
}

// ============================================================
// Component
// ============================================================

export default function ProductView({ product }: ProductViewProps) {
  const { addItem, isLoading } = useCart()

  // --- State ---
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // Build the initial selection from the first variant's options
  const initialSelection = useMemo(() => {
    const selection: Record<string, string> = {}
    const firstVariant = product.variants[0]
    if (firstVariant) {
      for (const opt of firstVariant.selectedOptions) {
        selection[opt.name.toLowerCase()] = opt.value
      }
    }
    return selection
  }, [product.variants])

  const [selectedOptions, setSelectedOptions] = useState(initialSelection)

  // --- Derived: current variant ---
  const currentVariant = useMemo(
    () => findMatchingVariant(product.variants, selectedOptions),
    [product.variants, selectedOptions]
  )

  // --- Derived: images ---
  const images = useMemo(() => {
    // Collect all images from the product, prioritizing the variant image
    const allImages = [...(product.images || [])]
    if (currentVariant?.image && !allImages.find((img) => img.url === currentVariant.image?.url)) {
      allImages.unshift(currentVariant.image)
    }
    if (product.featuredImage && !allImages.find((img) => img.url === product.featuredImage?.url)) {
      allImages.unshift(product.featuredImage)
    }
    return allImages.length > 0 ? allImages : []
  }, [product, currentVariant])

  // --- Derived: price display ---
  const price = currentVariant?.price ?? product.priceRange.minVariantPrice
  const compareAtPrice = currentVariant?.compareAtPrice ?? null
  const hasDiscount = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount)

  // --- Handlers ---
  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName.toLowerCase()]: value,
    }))
  }

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const handleAddToCart = async () => {
    if (!currentVariant || !currentVariant.availableForSale) return
    await addItem(currentVariant.id, quantity)
  }

  // --- Render ---
  if (!currentVariant) return null

  const optionNames = product.options.map((o) => o.name)

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ── Image Gallery ────────────────────────────── */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {images.length > 0 ? (
              <Image
                src={images[selectedImageIndex].url}
                alt={images[selectedImageIndex].altText ?? product.title}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={selectedImageIndex === 0}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12" />
              </div>
            )}

            {/* Navigation arrows (only if multiple images) */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur"
                  onClick={handlePrevImage}
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur"
                  onClick={handleNextImage}
                  aria-label="Image suivante"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.url}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground"
                  )}
                  aria-label={`Voir l'image ${index + 1}`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText ?? `${product.title} - image ${index + 1}`}
                    fill
                    className="object-cover object-center"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ─────────────────────────────── */}
        <div className="space-y-6">
          {/* Vendor */}
          {product.vendor && (
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {product.vendor}
            </p>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-foreground">
              {formatPrice(price.amount, price.currencyCode)}
            </span>
            {hasDiscount && compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
              </span>
            )}
          </div>

          {/* Availability */}
          <p
            className={cn(
              "text-sm font-medium",
              currentVariant.availableForSale
                ? "text-green-600"
                : "text-red-600"
            )}
          >
            {currentVariant.availableForSale
              ? "En stock"
              : "Rupture de stock"}
          </p>

          {/* Variant Selectors */}
          {optionNames.length > 0 && (
            <div className="space-y-4">
              {optionNames.map((optionName) => {
                const values = getOptionValues(product.variants, optionName)
                const selectedValue = selectedOptions[optionName.toLowerCase()]

                return (
                  <div key={optionName}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {optionName}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => {
                        const available = isOptionValueAvailable(
                          product.variants,
                          optionName,
                          value,
                          selectedOptions
                        )
                        const isSelected = selectedValue === value

                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={!available}
                            onClick={() => handleOptionChange(optionName, value)}
                            className={cn(
                              "rounded-md border px-4 py-2 text-sm font-medium transition-all",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : available
                                ? "border-border bg-background hover:border-foreground hover:bg-muted"
                                : "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50"
                            )}
                          >
                            {value}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-foreground">
              Quantité
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Diminuer la quantité"
              >
                −
              </Button>
              <span className="w-8 text-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Augmenter la quantité"
              >
                +
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full"
            disabled={!currentVariant.availableForSale || isLoading}
            onClick={handleAddToCart}
          >
            {isLoading ? (
              "Ajout en cours…"
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ajouter au panier
              </>
            )}
          </Button>

          {/* Description */}
          {product.descriptionHtml && (
            <div
              className="prose prose-sm max-w-none text-muted-foreground pt-4 border-t"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
