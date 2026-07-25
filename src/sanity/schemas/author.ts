import { defineType, defineField } from "sanity"

/**
 * Author schema for blog post authors.
 */
export default defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: () => "👤",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Author's full name",
      validation: (rule) => rule.required().min(2).max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "URL-friendly identifier",
      options: {
        source: "name",
        maxLength: 48,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Profile Image",
      type: "image",
      description: "Author's profile photo",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Alternative text for accessibility",
        },
      ],
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      description: "Short biography of the author",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "bio",
      media: "image",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title ?? "Unknown Author",
        subtitle: subtitle
          ? subtitle.substring(0, 60) + (subtitle.length > 60 ? "..." : "")
          : "No bio",
        media,
      }
    },
  },
})