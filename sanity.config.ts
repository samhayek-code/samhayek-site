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
    muxInput(),
  ],

  schema: {
    types: schemaTypes,
  },
})
