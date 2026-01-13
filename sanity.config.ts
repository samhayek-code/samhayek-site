import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { muxInput } from 'sanity-plugin-mux-input'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'sam-hayek-studio',
  title: 'Sam Hayek Studio',

  projectId: 'jpxmevq8',
  dataset: 'production',

  plugins: [
    structureTool(),
    muxInput({
      credentials: {
        tokenId: process.env.SANITY_STUDIO_MUX_TOKEN_ID || '',
        tokenSecret: process.env.SANITY_STUDIO_MUX_TOKEN_SECRET || '',
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
