import { defineType, defineField } from "sanity"

/**
 * Block content schema for rich text editing in blog posts.
 * Supports headings, lists, blockquotes, images, and code blocks.
 */
export default defineType({
  title: "Block Content",
  name: "blockContent",
  type: "array",
  of: [
    {
      title: "Block",
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Underline", value: "underline" },
          { title: "Strike", value: "strike-through" },
          { title: "Code", value: "code" },
        ],
        annotations: [
          {
            title: "URL",
            name: "link",
            type: "object",
            fields: [
              defineField({
                title: "URL",
                name: "href",
                type: "url",
                validation: (rule) =>
                  rule.uri({
                    scheme: ["http", "https", "mailto", "tel"],
                    allowRelative: true,
                  }),
              }),
              defineField({
                title: "Open in new tab",
                name: "blank",
                type: "boolean",
                initialValue: true,
              }),
            ],
          },
        ],
      },
    },
    {
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Alternative text for accessibility and SEO",
          validation: (rule) => rule.required(),
        },
        {
          name: "caption",
          title: "Caption",
          type: "string",
          description: "Optional caption displayed below the image",
        },
      ],
    },
  ],
})