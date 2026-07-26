// ============================================================
// Shopify Storefront API Client
// ============================================================
// Reusable fetch function with Next.js cache & revalidation support
// ============================================================

import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_COLLECTIONS_QUERY,
  GET_PRODUCTS_BY_COLLECTION_QUERY,
  SEARCH_PRODUCTS_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  GET_CART_QUERY,
} from "./queries"

import type {
  ShopifyFetchOptions,
  ShopifyFetchResponse,
  ShopifyProductsResponse,
  ShopifyProductResponse,
  ShopifyCollectionsResponse,
  ShopifyProduct,
  ShopifyCollection,
  ShopifyCart,
  ShopifyCartCreateResponse,
  ShopifyCartLinesAddResponse,
  ShopifyCartLinesRemoveResponse,
  ShopifyCartLinesUpdateResponse,
  ShopifyCartResponse,
  ShopifyCartLineInput,
  ShopifyCartLineUpdateInput,
} from "./types"

// --- Cache tags constants for revalidation ---
export const SHOPIFY_CACHE_TAGS = {
  products: "shopify-products",
  product: (handle: string) => `shopify-product-${handle}`,
  collections: "shopify-collections",
  collection: (handle: string) => `shopify-collection-${handle}`,
} as const

// --- Cookie name for storing the Shopify cart ID ---
export const CART_COOKIE_NAME = "shopify_cart_id"

// --- Default revalidation time (in seconds) ---
const DEFAULT_REVALIDATE = 60 * 5 // 5 minutes
const LONG_REVALIDATE = 60 * 60 * 24 // 24 hours for collections

/**
 * Generic fetch function to query the Shopify Storefront GraphQL API.
 * Supports Next.js data cache and revalidation tags for ISR.
 */
export async function shopifyFetch<T>({
  query,
  variables,
  tags,
  cache = "force-cache",
  revalidate,
}: ShopifyFetchOptions): Promise<ShopifyFetchResponse<T>> {
  const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token":
        process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "",
    },
    body: JSON.stringify({ query, variables }),
    cache,
    next: {
      revalidate: revalidate ?? DEFAULT_REVALIDATE,
      tags: tags ?? [],
    },
  })

  if (!response.ok) {
    throw new Error(
      `Shopify API error: ${response.status} ${response.statusText}`
    )
  }

  const result: ShopifyFetchResponse<T> = await response.json()

  if (result.errors) {
    throw new Error(
      `Shopify GraphQL error: ${result.errors
        .map((e) => e.message)
        .join(", ")}`
    )
  }

  return result
}

/**
 * Fetch function for cart mutations — always bypasses the cache.
 * Used by client-side cart operations (add, remove, update, create).
 */
async function shopifyCartFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<ShopifyFetchResponse<T>> {
  const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token":
        process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(
      `Shopify API error: ${response.status} ${response.statusText}`
    )
  }

  const result: ShopifyFetchResponse<T> = await response.json()

  if (result.errors) {
    throw new Error(
      `Shopify GraphQL error: ${result.errors
        .map((e) => e.message)
        .join(", ")}`
    )
  }

  return result
}

// ============================================================
// Public API Functions
// ============================================================

/**
 * Fetch a paginated list of products.
 * @param limit - Number of products to fetch (default: 20)
 * @param query - Optional search query string
 * @param after - Cursor for pagination
 */
export async function getProducts({
  limit = 20,
  query,
  after,
}: {
  limit?: number
  query?: string
  after?: string
} = {}): Promise<{
  products: ShopifyProduct[]
  pageInfo: ShopifyProductsResponse["products"]["pageInfo"]
}> {
  const { data } = await shopifyFetch<ShopifyProductsResponse>({
    query: GET_PRODUCTS_QUERY,
    variables: {
      first: limit,
      query: query || undefined,
      after: after || undefined,
    },
    tags: [SHOPIFY_CACHE_TAGS.products],
  })

  return {
    products: data.products.edges.map((edge) => edge.node),
    pageInfo: data.products.pageInfo,
  }
}

/**
 * Fetch a single product by its handle (slug).
 * @param handle - The product handle (e.g. "mon-produit")
 */
export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const { data } = await shopifyFetch<ShopifyProductResponse>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    tags: [SHOPIFY_CACHE_TAGS.product(handle)],
    revalidate: LONG_REVALIDATE,
  })

  return data.product
}

/**
 * Fetch all collections (categories).
 * @param limit - Number of collections to fetch (default: 50)
 */
export async function getCategories({
  limit = 50,
  after,
}: {
  limit?: number
  after?: string
} = {}): Promise<{
  collections: ShopifyCollection[]
  pageInfo: ShopifyCollectionsResponse["collections"]["pageInfo"]
}> {
  const { data } = await shopifyFetch<ShopifyCollectionsResponse>({
    query: GET_COLLECTIONS_QUERY,
    variables: {
      first: limit,
      after: after || undefined,
    },
    tags: [SHOPIFY_CACHE_TAGS.collections],
    revalidate: LONG_REVALIDATE,
  })

  return {
    collections: data.collections.edges.map((edge) => edge.node),
    pageInfo: data.collections.pageInfo,
  }
}

/**
 * Fetch products belonging to a specific collection.
 * @param collectionHandle - The collection handle
 * @param limit - Number of products to fetch (default: 20)
 * @param after - Cursor for pagination
 */
export async function getProductsByCollection({
  collectionHandle,
  limit = 20,
  after,
}: {
  collectionHandle: string
  limit?: number
  after?: string
}): Promise<{
  collection: { id: string; title: string; handle: string }
  products: ShopifyProduct[]
  pageInfo: ShopifyProductsResponse["products"]["pageInfo"]
}> {
  const { data } = await shopifyFetch<{
    collection: {
      id: string
      title: string
      handle: string
      products: ShopifyProductsResponse["products"]
    }
  }>({
    query: GET_PRODUCTS_BY_COLLECTION_QUERY,
    variables: {
      handle: collectionHandle,
      first: limit,
      after: after || undefined,
    },
    tags: [
      SHOPIFY_CACHE_TAGS.collection(collectionHandle),
      SHOPIFY_CACHE_TAGS.products,
    ],
  })

  return {
    collection: {
      id: data.collection.id,
      title: data.collection.title,
      handle: data.collection.handle,
    },
    products: data.collection.products.edges.map((edge) => edge.node),
    pageInfo: data.collection.products.pageInfo,
  }
}

/**
 * Search products by query string.
 * @param query - The search query
 * @param limit - Number of results (default: 20)
 * @param after - Cursor for pagination
 */
export async function searchProducts({
  query,
  limit = 20,
  after,
}: {
  query: string
  limit?: number
  after?: string
}): Promise<{
  products: ShopifyProduct[]
  pageInfo: ShopifyProductsResponse["products"]["pageInfo"]
}> {
  const { data } = await shopifyFetch<ShopifyProductsResponse>({
    query: SEARCH_PRODUCTS_QUERY,
    variables: {
      query,
      first: limit,
      after: after || undefined,
    },
    tags: [SHOPIFY_CACHE_TAGS.products],
    revalidate: DEFAULT_REVALIDATE,
  })

  return {
    products: data.products.edges.map((edge) => edge.node),
    pageInfo: data.products.pageInfo,
  }
}

// ============================================================
// Cart API Functions
// ============================================================

/**
 * Create a new empty cart in Shopify.
 * Returns the cart with its ID and checkout URL.
 */
export async function createCart(): Promise<ShopifyCart> {
  const { data } = await shopifyCartFetch<ShopifyCartCreateResponse>(
    CART_CREATE_MUTATION
  )

  if (!data.cartCreate.cart) {
    throw new Error("Failed to create cart: no cart returned")
  }

  return data.cartCreate.cart
}

/**
 * Fetch an existing cart by its Shopify cart ID.
 * @param cartId - The Shopify cart ID
 */
export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const { data } = await shopifyCartFetch<ShopifyCartResponse>(
    GET_CART_QUERY,
    { cartId }
  )

  return data.cart
}

/**
 * Add line items to a cart.
 * @param cartId - The Shopify cart ID
 * @param lines - Array of { quantity, merchandiseId }
 */
export async function addCartLines(
  cartId: string,
  lines: ShopifyCartLineInput[]
): Promise<ShopifyCart> {
  const { data } = await shopifyCartFetch<ShopifyCartLinesAddResponse>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines }
  )

  if (!data.cartLinesAdd.cart) {
    throw new Error("Failed to add lines to cart")
  }

  return data.cartLinesAdd.cart
}

/**
 * Remove line items from a cart.
 * @param cartId - The Shopify cart ID
 * @param lineIds - Array of cart line item IDs to remove
 */
export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  const { data } = await shopifyCartFetch<ShopifyCartLinesRemoveResponse>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds }
  )

  if (!data.cartLinesRemove.cart) {
    throw new Error("Failed to remove lines from cart")
  }

  return data.cartLinesRemove.cart
}

/**
 * Update line items in a cart (e.g. change quantity).
 * @param cartId - The Shopify cart ID
 * @param lines - Array of { id, quantity }
 */
export async function updateCartLines(
  cartId: string,
  lines: ShopifyCartLineUpdateInput[]
): Promise<ShopifyCart> {
  const { data } = await shopifyCartFetch<ShopifyCartLinesUpdateResponse>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines }
  )

  if (!data.cartLinesUpdate.cart) {
    throw new Error("Failed to update lines in cart")
  }

  return data.cartLinesUpdate.cart
}
