// ============================================================
// Shopify Storefront API - TypeScript Types
// ============================================================

// --- Image ---
export interface ShopifyImage {
  url: string
  altText: string | null
  width: number
  height: number
}

// --- Price ---
export interface ShopifyPrice {
  amount: string
  currencyCode: string
}

// --- Product Variant ---
export interface ShopifyProductVariant {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: {
    name: string
    value: string
  }[]
  price: ShopifyPrice
  compareAtPrice: ShopifyPrice | null
  image: ShopifyImage | null
  sku: string
}

// --- Product ---
export interface ShopifyProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  availableForSale: boolean
  tags: string[]
  vendor: string
  productType: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  images: ShopifyImage[]
  featuredImage: ShopifyImage | null
  priceRange: {
    minVariantPrice: ShopifyPrice
    maxVariantPrice: ShopifyPrice
  }
  variants: ShopifyProductVariant[]
  options: {
    id: string
    name: string
    values: string[]
  }[]
  seo: {
    title: string
    description: string
  }
}

// --- Collection / Category ---
export interface ShopifyCollection {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  image: ShopifyImage | null
  productsCount: number
  updatedAt: string
}

// --- Pagination ---
export interface ShopifyPageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string | null
  endCursor: string | null
}

// --- API Response Wrappers ---
export interface ShopifyProductsResponse {
  products: {
    edges: {
      node: ShopifyProduct
      cursor: string
    }[]
    pageInfo: ShopifyPageInfo
  }
}

export interface ShopifyProductResponse {
  product: ShopifyProduct | null
}

export interface ShopifyCollectionsResponse {
  collections: {
    edges: {
      node: ShopifyCollection
      cursor: string
    }[]
    pageInfo: ShopifyPageInfo
  }
}

// --- Fetch Options ---
export interface ShopifyFetchOptions {
  query: string
  variables?: Record<string, unknown>
  tags?: string[]
  cache?: RequestCache
  revalidate?: number
}

// --- Fetch Response ---
export interface ShopifyFetchResponse<T> {
  data: T
  errors?: { message: string; locations?: { line: number; column: number }[] }[]
}