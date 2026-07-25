// ============================================================
// Sanity Image URL Builder
// ============================================================
// Utility for generating optimized Sanity image URLs
// ============================================================

import imageUrlBuilder from "@sanity/image-url"
import { client } from "./client"

import type { SanityImageSource } from "@sanity/image-url"

const builder = imageUrlBuilder(client)

/**
 * Build an optimized Sanity image URL with optional transformations.
 *
 * @param source - The Sanity image source (asset reference or object)
 * @param width - Desired width (default: 800)
 * @param height - Optional height (maintains aspect ratio if omitted)
 * @param quality - Image quality 1-100 (default: 80)
 * @returns A URL string for the transformed image
 */
export function urlForImage(
  source: SanityImageSource,
  {
    width = 800,
    height,
    quality = 80,
  }: {
    width?: number
    height?: number
    quality?: number
  } = {}
): string {
  let image = builder.image(source).width(width).quality(quality)

  if (height) {
    image = image.height(height)
  }

  return image.url()
}

/**
 * Build a Sanity image URL for a hero/full-width banner.
 * Automatically sets large dimensions for background images.
 */
export function urlForHeroImage(
  source: SanityImageSource
): string {
  return builder
    .image(source)
    .width(1920)
    .height(1080)
    .quality(85)
    .format("webp")
    .url()
}

/**
 * Build a Sanity image URL for a blog post thumbnail.
 */
export function urlForThumbnail(
  source: SanityImageSource
): string {
  return builder
    .image(source)
    .width(600)
    .height(400)
    .quality(75)
    .format("webp")
    .url()
}

/**
 * Get the dimensions (width/height) of a Sanity image asset.
 */
export function getImageDimensions(
  source: SanityImageSource
): { width: number; height: number; aspectRatio: number } | null {
  const image = builder.image(source)
  const url = image.url()

  if (!url) return null

  // Extract dimensions from the Sanity image URL query params
  const urlObj = new URL(url)
  const w = parseInt(urlObj.searchParams.get("w") ?? "0", 10)
  const h = parseInt(urlObj.searchParams.get("h") ?? "0", 10)

  if (w && h) {
    return { width: w, height: h, aspectRatio: w / h }
  }

  return null
}