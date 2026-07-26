// ============================================================
// Catalogue Page - Products Listing with Filters
// ============================================================
// Server Component that fetches products from Shopify
// with filtering by collection and price range.
// ============================================================

import Link from "next/link"
import { Suspense } from "react"
import { SlidersHorizontal, X } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ProductCard from "@/components/ProductCard"
import PriceFilter from "@/components/PriceFilter"
import { getProducts, getCategories } from "@/lib/shopify"

import type { ShopifyCollection } from "@/lib/shopify/types"

// ============================================================
// Types
// ============================================================

interface ProductsPageProps {
  searchParams: Promise<{
    collection?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
  }>
}

// ============================================================
// Price formatting helper
// ============================================================

function formatPriceFilter(amount: string): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return amount
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

// ============================================================
// Active Filters Display
// ============================================================

function ActiveFilters({
  collection,
  minPrice,
  maxPrice,
  collections,
}: {
  collection?: string
  minPrice?: string
  maxPrice?: string
  collections: ShopifyCollection[]
}) {
  const hasFilters = collection || minPrice || maxPrice
  if (!hasFilters) return null

  const collectionName = collection
    ? collections.find((c) => c.handle === collection)?.title ?? collection
    : null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground">Filtres actifs :</span>

      {collectionName && (
        <Link
          href="/products"
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          {collectionName}
          <X className="h-3 w-3" />
        </Link>
      )}

      {minPrice && (
        <Link
          href={collection ? `/products?collection=${collection}` : "/products"}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          Min : {formatPriceFilter(minPrice)}
          <X className="h-3 w-3" />
        </Link>
      )}

      {maxPrice && (
        <Link
          href={collection ? `/products?collection=${collection}` : "/products"}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          Max : {formatPriceFilter(maxPrice)}
          <X className="h-3 w-3" />
        </Link>
      )}

      <Link
        href="/products"
        className="text-xs text-muted-foreground underline hover:text-foreground"
      >
        Réinitialiser tout
      </Link>
    </div>
  )
}

// ============================================================
// Sidebar Filters
// ============================================================

function FiltersSidebar({
  collections,
  activeCollection,
  minPrice,
  maxPrice,
}: {
  collections: ShopifyCollection[]
  activeCollection?: string
  minPrice?: string
  maxPrice?: string
}) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-24 space-y-8">
        {/* Collections Filter */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Collections
          </h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="/products"
                className={cn(
                  "block rounded-md px-3 py-1.5 text-sm transition-colors",
                  !activeCollection
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                Tous les produits
              </Link>
            </li>
            {collections.map((col) => (
              <li key={col.id}>
                <Link
                  href={`/products?collection=${col.handle}`}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm transition-colors",
                    activeCollection === col.handle
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {col.title}
                  {col.productsCount > 0 && (
                    <span className="ml-1.5 text-xs opacity-60">
                      ({col.productsCount})
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Range Filter */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Prix</h3>
          <PriceFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            activeCollection={activeCollection}
          />
        </div>
      </div>
    </aside>
  )
}

// ============================================================
// Product Grid
// ============================================================

async function ProductGrid({
  collection,
  minPrice,
  maxPrice,
}: {
  collection?: string
  minPrice?: string
  maxPrice?: string
}) {
  // Build Shopify query string for filtering
  const queryParts: string[] = []

  if (collection) {
    // Collection filtering is handled by getProductsByCollection
  }

  if (minPrice) {
    queryParts.push(`variants.price:>=${minPrice}`)
  }

  if (maxPrice) {
    queryParts.push(`variants.price:<=${maxPrice}`)
  }

  const query = queryParts.length > 0 ? queryParts.join(" AND ") : undefined

  let products

  try {
    if (collection) {
      const result = await getProducts({
        limit: 24,
        query: query ? `collection:${collection} AND ${query}` : `collection:${collection}`,
      })
      products = result.products
    } else {
      const result = await getProducts({ limit: 24, query })
      products = result.products
    }
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg text-muted-foreground">
          Impossible de charger les produits pour le moment.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Veuillez réessayer ultérieurement.
        </p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg text-muted-foreground">
          Aucun produit trouvé.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Essayez de modifier vos filtres.
        </p>
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
        >
          Réinitialiser les filtres
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// ============================================================
// Loading Skeleton
// ============================================================

function ProductsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border bg-background">
          <div className="aspect-square bg-muted" />
          <div className="p-4 space-y-3">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/3 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// Products Page
// ============================================================

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const activeCollection = params.collection
  const minPrice = params.minPrice
  const maxPrice = params.maxPrice

  // Fetch collections for the sidebar
  let collections: ShopifyCollection[] = []
  try {
    const result = await getCategories({ limit: 50 })
    collections = result.collections
  } catch {
    // Graceful fallback
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {activeCollection
            ? collections.find((c) => c.handle === activeCollection)?.title ??
              "Catalogue"
            : "Catalogue"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Découvrez tous nos produits soigneusement sélectionnés
        </p>
      </div>

      {/* Active Filters */}
      <ActiveFilters
        collection={activeCollection}
        minPrice={minPrice}
        maxPrice={maxPrice}
        collections={collections}
      />

      {/* Layout: Sidebar + Grid */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <FiltersSidebar
          collections={collections}
          activeCollection={activeCollection}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={<ProductsLoadingSkeleton />}>
            <ProductGrid
              collection={activeCollection}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}