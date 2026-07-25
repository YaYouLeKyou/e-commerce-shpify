// ============================================================
// Sanity Fetch Helpers for Server Components
// ============================================================
// Typed helpers to fetch data from Sanity in Server Components
// ============================================================

import { client } from "./client"
import {
  ACTIVE_HERO_BANNERS_QUERY,
  LATEST_BLOG_POSTS_QUERY,
} from "./queries"

import type { SanityImageSource } from "@sanity/image-url"

// --- Hero Banner Types ---

export interface SanityHeroBanner {
  _id: string
  title: string
  subtitle: string | null
  backgroundImage: {
    asset: {
      _id: string
      url: string
      metadata: {
        dimensions: {
          width: number
          height: number
        }
        lqip: string | null
      } | null
    } | null
    hotspot: { x: number; y: number; width: number; height: number } | null
    crop: { top: number; bottom: number; left: number; right: number } | null
  } | null
  cta: {
    text: string
    href: string
  } | null
  order: number
  isActive: boolean
}

export interface SanityBlogPostPreview {
  _id: string
  title: string
  slug: { current: string } | string
  excerpt: string | null
  publishedAt: string
  mainImage: {
    asset: {
      _id: string
      url: string
      metadata: {
        dimensions: { width: number; height: number }
        lqip: string | null
      } | null
    } | null
    alt: string | null
  } | null
  categories: {
    _id: string
    title: string
    slug: { current: string } | string
  }[]
  estimatedReadingTime: number
}

/**
 * Check if Sanity is properly configured with real credentials.
 */
function isSanityConfigured(): boolean {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  return !!projectId && projectId !== "placeholderabcd" && projectId !== "your_project_id"
}

/**
 * Fetch active hero banners for the homepage.
 */
export async function getHeroBanners(): Promise<SanityHeroBanner[]> {
  if (!isSanityConfigured()) {
    return []
  }

  try {
    return await client.fetch<SanityHeroBanner[]>(
      ACTIVE_HERO_BANNERS_QUERY,
      {},
      {
        next: {
          revalidate: 60 * 15, // 15 minutes
          tags: ["sanity-hero-banners"],
        },
      }
    )
  } catch {
    return []
  }
}

/**
 * Fetch the latest N blog posts for the homepage "Notre Histoire / Blog" section.
 */
export async function getLatestBlogPosts(
  limit: number = 3
): Promise<SanityBlogPostPreview[]> {
  if (!isSanityConfigured()) {
    return []
  }

  try {
    return await client.fetch<SanityBlogPostPreview[]>(
      LATEST_BLOG_POSTS_QUERY,
      { limit },
      {
        next: {
          revalidate: 60 * 15,
          tags: ["sanity-blog-posts"],
        },
      }
    )
  } catch {
    return []
  }
}
