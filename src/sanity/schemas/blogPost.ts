import { defineType, defineField } from "sanity"

/**
 * Blog Post schema for brand storytelling and content marketing.
 * Supports rich text body, categories, author, and SEO metadata.
 */
export default defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  icon: () => "📝",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The blog post title",
      validation: (rule) => rule.required().min(5).max(200),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "URL-friendly identifier (e.g. 'notre-histoire')",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      description: "Short summary displayed in listings and previews",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      description: "Featured image for the blog post",
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
      name: "body",
      title: "Body Content",
      type: "blockContent",
      description: "Main content of the blog post (rich text with images)",
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      description: "Blog post categories/tags",
      of: [
        {
          type: "reference",
          to: [{ type: "blogCategory" }],
        },
      ],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      description: "Post author",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      description: "When the post was published",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      description: "SEO metadata for search engines and social sharing",
      fields: [
        defineField({
          name: "title",
          title: "SEO Title",
          type: "string",
          description: "Custom title for search results (overrides the post title)",
          validation: (rule) => rule.max(70),
        }),
        defineField({
          name: "description",
          title: "SEO Description",
          type: "text",
          description: "Meta description for search results",
          rows: 2,
          validation: (rule) => rule.max(160),
        }),
        defineField({
          name: "ogImage",
          title: "OG Image",
          type: "image",
          description: "Open Graph image for social sharing (1200x630 recommended)",
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "mainImage",
      authorName: "author.name",
    },
    prepare({ title, subtitle, media, authorName }) {
      const date = subtitle
        ? new Date(subtitle).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "No date"

      return {
        title: title ?? "Untitled Post",
        subtitle: authorName ? `${date} • by ${authorName}` : date,
        media,
      }
    },
  },
  orderings: [
    {
      title: "Publish Date",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Title",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
})