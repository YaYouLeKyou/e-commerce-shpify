// ============================================================
// Sanity GROQ Queries
// ============================================================
// GROQ queries for fetching Sanity content (hero banners, blog posts)
// ============================================================

// --- Hero Banner Queries ---

/**
 * Fetch all hero banners for the homepage, ordered by priority.
 * Returns title, subtitle, background image, CTA, and display order.
 */
export const HERO_BANNERS_QUERY = `*[_type == "heroBanner"] | order(order asc) {
  _id,
  title,
  subtitle,
  backgroundImage {
    asset->{
      _id,
      url,
      metadata {
        dimensions {
          width,
          height
        },
        lqip
      }
    },
    hotspot,
    crop
  },
  cta {
    text,
    href
  },
  order,
  isActive
}`

/**
 * Fetch active hero banners (isActive === true) for the homepage.
 */
export const ACTIVE_HERO_BANNERS_QUERY = `*[_type == "heroBanner" && isActive == true] | order(order asc) {
  _id,
  title,
  subtitle,
  backgroundImage {
    asset->{
      _id,
      url,
      metadata {
        dimensions {
          width,
          height
        },
        lqip
      }
    },
    hotspot,
    crop
  },
  cta {
    text,
    href
  },
  order,
  isActive
}`

/**
 * Fetch a single hero banner by its _id.
 */
export const HERO_BANNER_BY_ID_QUERY = `*[_type == "heroBanner" && _id == $id][0] {
  _id,
  title,
  subtitle,
  backgroundImage {
    asset->{
      _id,
      url,
      metadata {
        dimensions {
          width,
          height
        },
        lqip
      }
    },
    hotspot,
    crop
  },
  cta {
    text,
    href
  },
  order,
  isActive
}`

// --- Blog Post Queries ---

/**
 * Fetch all blog posts, with pagination support.
 * Ordered by publishing date descending.
 */
export const BLOG_POSTS_QUERY = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage {
    asset->{
      _id,
      url,
      metadata {
        dimensions {
          width,
          height
        },
        lqip
      }
    },
    alt,
    hotspot,
    crop
  },
  categories[]->{
    _id,
    title,
    slug
  },
  author->{
    _id,
    name,
    image {
      asset->{
        _id,
        url
      }
    },
    bio
  },
  "estimatedReadingTime": round(length(pt::text(body)) / 1000) * 5 + 1
}`

/**
 * Fetch a single blog post by its slug.
 * Includes full body content.
 */
export const BLOG_POST_BY_SLUG_QUERY = `*[_type == "blogPost" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage {
    asset->{
      _id,
      url,
      metadata {
        dimensions {
          width,
          height
        },
        lqip
      }
    },
    alt,
    hotspot,
    crop
  },
  body,
  categories[]->{
    _id,
    title,
    slug
  },
  author->{
    _id,
    name,
    image {
      asset->{
        _id,
        url
      }
    },
    bio
  },
  seo {
    title,
    description,
    ogImage {
      asset->{
        _id,
        url
      }
    }
  },
  "estimatedReadingTime": round(length(pt::text(body)) / 1000) * 5 + 1
}`

/**
 * Fetch blog post slugs for static generation.
 */
export const BLOG_POST_SLUGS_QUERY = `*[_type == "blogPost" && defined(slug.current)] {
  "slug": slug.current
}`

/**
 * Fetch the latest N blog posts for the homepage or sidebar.
 */
export const LATEST_BLOG_POSTS_QUERY = `*[_type == "blogPost"] | order(publishedAt desc) [0...$limit] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage {
    asset->{
      _id,
      url,
      metadata {
        dimensions {
          width,
          height
        },
        lqip
      }
    },
    alt
  },
  categories[]->{
    _id,
    title,
    slug
  },
  "estimatedReadingTime": round(length(pt::text(body)) / 1000) * 5 + 1
}`

// --- Generic Utility Query ---

/**
 * Fetch a single document by its _type and slug.
 * Generic utility for any slug-based Sanity document.
 */
export const DOCUMENT_BY_SLUG_QUERY = `*[_type == $type && slug.current == $slug][0]`

/**
 * Fetch all slugs for a given document type.
 */
export const ALL_SLUGS_BY_TYPE_QUERY = `*[_type == $type && defined(slug.current)] {
  "slug": slug.current
}`