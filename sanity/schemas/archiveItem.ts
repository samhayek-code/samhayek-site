import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'archiveItem',
  title: 'Archive Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Music', value: 'Music' },
          { title: 'Art', value: 'Art' },
          { title: 'Writing', value: 'Writing' },
          { title: 'Downloads', value: 'Downloads' },
          { title: 'Tools', value: 'Tools' },
          { title: 'Shop', value: 'Shop' },
          { title: 'Design', value: 'Design' },
          { title: 'Chat', value: 'Chat' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'E.g., "Single", "Oil on Canvas", "Package", "Poetry"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cta',
      title: 'CTA Button Text',
      type: 'string',
      description: 'E.g., "Listen", "View", "Buy", "Read"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Sort priority: lower numbers first, higher numbers last. Leave at 0 for default (sorts by date). Use 100+ to push to end.',
      initialValue: 0,
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'Used for sorting (when order is the same)',
    }),
    defineField({
      name: 'year',
      title: 'Display Year',
      type: 'string',
      description: 'Shown on the card (e.g., "2024", "2023-2024")',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'For Shop/Design items (e.g., "$200", "$8,000")',
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Shown in the modal',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Full Content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'For Writing items — full text content',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Main image shown on card and modal hero',
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      description: 'Additional images shown in modal',
    }),
    defineField({
      name: 'embedUrl',
      title: 'Embed URL',
      type: 'url',
      description: 'For Music — Spotify/Apple Music embed URL',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      description: 'For Tools — link to the tool',
    }),
    defineField({
      name: 'lemonSqueezyUrl',
      title: 'Lemon Squeezy URL',
      type: 'url',
      description: 'For Shop/Design items — checkout link',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      media: 'coverImage',
    },
    prepare({ title, type, media }) {
      return {
        title,
        subtitle: type,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Date, New',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Type',
      name: 'typeAsc',
      by: [{ field: 'type', direction: 'asc' }],
    },
  ],
})
