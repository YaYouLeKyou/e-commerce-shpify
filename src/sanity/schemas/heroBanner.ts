import { defineType, defineField } from "sanity"

/**
 * Hero Banner schema for the homepage hero section.
 * Supports multiple banners that can be ordered and toggled on/off.
 */
export default defineType({
  name: "heroBanner",
  title: "Hero Banner",
  type: "document",
  icon: () => "🖼️",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Main heading text for the hero banner",
      validation: (rule) => rule.required().min(2).max(120),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      description: "Secondary text displayed below the title",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      description: "Full-width background image for the hero banner (1920x1080 recommended)",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Alternative text for accessibility and SEO",
          validation: (rule) => rule.required(),
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cta",
      title: "Call-to-Action",
      type: "object",
      description: "Button that appears on the hero banner",
      fields: [
        defineField({
          name: "text",
          title: "Button Text",
          type: "string",
          description: "Text displayed on the CTA button (e.g. 'Shop Now', 'Learn More')",
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: "href",
          title: "Button Link",
          type: "string",
          description: "URL the button links to (e.g. '/shop', '/about')",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Controls the display order (lower numbers appear first)",
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      description: "Toggle to show/hide this banner on the homepage",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      media: "backgroundImage",
      isActive: "isActive",
      order: "order",
    },
    prepare({ title, subtitle, media, isActive, order }) {
      return {
        title: title ?? "Untitled Banner",
        subtitle: isActive
          ? `Active • Order: ${order ?? 0}`
          : `Inactive • Order: ${order ?? 0}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
})