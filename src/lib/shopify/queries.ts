// ============================================================
// Shopify Storefront API - GraphQL Queries
// ============================================================

export const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCard on Product {
    id
    handle
    title
    availableForSale
    vendor
    productType
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
  }
`

export const PRODUCT_VARIANT_FRAGMENT = `
  fragment ProductVariant on ProductVariant {
    id
    title
    availableForSale
    sku
    selectedOptions {
      name
      value
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    image {
      url
      altText
      width
      height
    }
  }
`

export const PRODUCT_DETAIL_FRAGMENT = `
  fragment ProductDetail on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    tags
    vendor
    productType
    createdAt
    updatedAt
    publishedAt
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    options {
      id
      name
      values
    }
    variants(first: 100) {
      edges {
        node {
          ...ProductVariant
        }
      }
    }
    seo {
      title
      description
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`

export const COLLECTION_FRAGMENT = `
  fragment Collection on Collection {
    id
    handle
    title
    description
    descriptionHtml
    image {
      url
      altText
      width
      height
    }
    productsCount
    updatedAt
  }
`

// --- Queries ---

export const GET_PRODUCTS_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query GetProducts($first: Int!, $query: String, $after: String) {
    products(first: $first, query: $query, after: $after) {
      edges {
        cursor
        node {
          ...ProductCard
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

export const GET_PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_DETAIL_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductDetail
    }
  }
`

export const GET_COLLECTIONS_QUERY = `
  ${COLLECTION_FRAGMENT}
  query GetCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      edges {
        cursor
        node {
          ...Collection
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

export const GET_PRODUCTS_BY_COLLECTION_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query GetProductsByCollection($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first, after: $after) {
        edges {
          cursor
          node {
            ...ProductCard
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`

export const SEARCH_PRODUCTS_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query SearchProducts($query: String!, $first: Int!, $after: String) {
    products(first: $first, query: $query, after: $after) {
      edges {
        cursor
        node {
          ...ProductCard
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`