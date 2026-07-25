import { defineType, defineField } from "sanity"

/**
 * Blog Category schema for organizing blog posts by topic.
 */
export default defineType({
  name: "blogCategory",
  title: "Blog Category",
  type: "document",
  icon: () => "📂",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Category name (e.g. 'Mode', 'Conseils', 'Actualités')",
      validation: (rule) => rule.required().min(2).max(60),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "URL-friendly identifier",
      options: {
        source: "title",
        maxLength: 48,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "Optional description of the category",
      rows: 2,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
    prepare({ title, subtitle }) {
      return {
        title: title ?? "Untitled Category",
        subtitle: subtitle ?? "No description",
      }
    },
  },
})