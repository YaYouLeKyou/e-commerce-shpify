// ============================================================
// Sanity Client
// ============================================================
// Configured with next-sanity for optimal Next.js integration
// ============================================================

import { createClient } from "next-sanity"

import type { ClientConfig } from "@sanity/client"

const clientConfig: ClientConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-10-01",
  useCdn: true,
  perspective: "published",
  stega: {
    enabled: false,
  },
}

/**
 * Sanity client for fetching content in Server Components.
 * Uses CDN by default for optimal performance.
 */
export const client = createClient(clientConfig)

/**
 * Sanity client for fetching content with raw data (no stega encoding).
 * Use this when you need clean data for serialization or revalidation.
 */
export const clientRaw = createClient({
  ...clientConfig,
  stega: {
    enabled: false,
  },
})

/**
 * Sanity client for Server Actions and mutations.
 * Bypasses CDN to ensure fresh data.
 */
export const clientWrite = createClient({
  ...clientConfig,
  useCdn: false,
  perspective: "previewDrafts",
  stega: {
    enabled: false,
  },
})