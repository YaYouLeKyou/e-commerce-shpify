// ============================================================
// Homepage - Hybrid (Sanity + Shopify)
// ============================================================
// Server Component that fetches:
//   - Hero banners from Sanity (vitrine)
//   - Featured products from Shopify (e-commerce)
//   - Latest blog posts from Sanity (Notre Histoire / Blog)
// ============================================================

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ProductCard from "@/components/ProductCard"
import { getHeroBanners, getLatestBlogPosts } from "@/lib/sanity/fetch"
import { getProducts } from "@/lib/shopify"
import { urlForHeroImage, urlForThumbnail } from "@/lib/sanity/image"

import type { SanityHeroBanner, SanityBlogPostPreview } from "@/lib/sanity/fetch"

// ============================================================
// Hero Section
// ============================================================

function HeroSection({ banners }: { banners: SanityHeroBanner[] }) {
  if (banners.length === 0) {
    return (
      <section className="relative flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Bienvenue sur notre boutique
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre sélection de produits soigneusement choisis pour vous.
          </p>
          <Link
            href="/products"
            className={cn(buttonVariants({ size: "lg" }), "mt-8")}
          >
            Découvrir la boutique
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    )
  }

  // For now, display the first active banner as the main hero
  const primary = banners[0]

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden">
      {/* Background image */}
      {primary.backgroundImage?.asset?.url && (
        <Image
          src={urlForHeroImage(primary.backgroundImage)}
          alt={primary.title}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {primary.title}
          </h1>
          {primary.subtitle && (
            <p className="mt-4 text-lg text-white/80 max-w-lg">
              {primary.subtitle}
            </p>
          )}
          {primary.cta && (
            <Link
              href={primary.cta.href}
              className={cn(buttonVariants({ size: "lg" }), "mt-8")}
            >
              {primary.cta.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Banner indicators (if multiple) */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-8 rounded-full transition-colors ${
                index === 0 ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ============================================================
// Featured Products Section
// ============================================================

async function FeaturedProductsSection() {
  let products

  try {
    const result = await getProducts({ limit: 8 })
    products = result.products
  } catch {
    // Graceful fallback if Shopify is unavailable
    return null
  }

  if (!products || products.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Produits vedettes
            </h2>
            <p className="mt-2 text-muted-foreground">
              Les articles les plus populaires de notre collection
            </p>
          </div>
          <Link
            href="/products"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "hidden sm:inline-flex"
            )}
          >
            Voir tout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className={buttonVariants({ variant: "outline" })}
          >
            Voir tout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Blog / Notre Histoire Section
// ============================================================

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateString
  }
}

function getSlug(slug: { current?: string } | string | undefined): string {
  if (!slug) return ""
  if (typeof slug === "string") return slug
  return slug.current ?? ""
}

function BlogSection({
  posts,
}: {
  posts: SanityBlogPostPreview[]
}) {
  if (posts.length === 0) return null

  return (
    <section className="bg-muted/50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Notre histoire
            </h2>
            <p className="mt-2 text-muted-foreground">
              Découvrez nos articles, conseils et actualités
            </p>
          </div>
          <Link
            href="/blog"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "hidden sm:inline-flex"
            )}
          >
            Tous les articles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const slug = getSlug(post.slug)
            return (
              <Link
                key={post._id}
                href={`/blog/${slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  {post.mainImage?.asset?.url ? (
                    <Image
                      src={urlForThumbnail(post.mainImage)}
                      alt={post.mainImage.alt ?? post.title}
                      fill
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Clock className="h-10 w-10" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {/* Categories */}
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.categories.map((cat) => (
                        <span
                          key={cat._id}
                          className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {cat.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-semibold leading-snug group-hover:underline">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt)}
                    </time>
                    {post.estimatedReadingTime > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>
                          {post.estimatedReadingTime} min de lecture
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/blog"
            className={buttonVariants({ variant: "outline" })}
          >
            Tous les articles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Homepage Component
// ============================================================

export default async function HomePage() {
  // Fetch data in parallel
  const [banners, posts] = await Promise.all([
    getHeroBanners(),
    getLatestBlogPosts(3),
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Section (Sanity) */}
      <HeroSection banners={banners} />

      {/* Featured Products (Shopify) */}
      <FeaturedProductsSection />

      {/* Blog / Notre Histoire (Sanity) */}
      <BlogSection posts={posts} />
    </div>
  )
}