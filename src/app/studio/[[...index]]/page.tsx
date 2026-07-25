import { NextStudio } from "next-sanity/studio"
import config from "@/sanity/sanity.config"
import { metadata as studioMetadata, viewport as studioViewport } from "next-sanity/studio"

export const metadata = {
  ...studioMetadata,
  title: "Studio CMS - E-Commerce Shopify",
}

export const viewport = {
  ...studioViewport,
  interactiveWidget: "resizes-content" as const,
}

export default function StudioPage() {
  return <NextStudio config={config} />
}