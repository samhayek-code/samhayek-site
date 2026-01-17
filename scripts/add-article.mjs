import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Sanity client with write access
const client = createClient({
  projectId: 'jpxmevq8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Image paths from the article folder
const imageDir = '/Users/samhayek/Desktop/Code/claude-article-1.1'
const images = [
  { filename: 'claude-setup-diagram.png', caption: 'The ~/.claude directory: one config file, one rules folder, applied to every session.' },
  { filename: 'claude-collaboration-loop.png', caption: 'The 4-step loop that shifts Claude from autonomous to collaborative.' },
  { filename: 'claude-formatting-linting.png', caption: 'Prettier (formatting) → ESLint (code quality) → /rams (accessibility + visual).' },
  { filename: 'claude-stack-context.png', caption: 'Define your defaults once. Claude uses them without being told.' },
  { filename: 'claude-reference-resources.png', caption: 'Point Claude to documentation once—it references it automatically.' },
  { filename: 'claude-before-after.png', caption: 'What changes when Claude has context about how you work.' },
]

async function uploadImage(filename, caption) {
  const filepath = resolve(imageDir, filename)
  const imageBuffer = readFileSync(filepath)

  console.log(`Uploading ${filename}...`)
  const asset = await client.assets.upload('image', imageBuffer, {
    filename,
    contentType: 'image/png',
  })

  return {
    _type: 'image',
    _key: filename.replace('.png', ''),
    asset: { _type: 'reference', _ref: asset._id },
    alt: caption,
    caption: caption,
  }
}

async function createArticle() {
  console.log('Starting article creation...\n')

  // Upload all images first
  const uploadedImages = {}
  for (const img of images) {
    uploadedImages[img.filename] = await uploadImage(img.filename, img.caption)
  }
  console.log('\nAll images uploaded.\n')

  // Build the body content with text blocks and images
  const body = [
    // Intro
    {
      _type: 'block',
      _key: 'intro1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'intro1s', text: 'With the right ingredients, yes.' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'intro2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'intro2s', text: "There's one file that teaches it how." }],
      markDefs: [],
    },

    // Setup diagram image
    uploadedImages['claude-setup-diagram.png'],

    // Section: The ~/CLAUDE.md File
    {
      _type: 'block',
      _key: 'h2claudemd',
      style: 'h2',
      children: [{ _type: 'span', _key: 'h2claudemds', text: 'The ~/CLAUDE.md File' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'claudemd1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'claudemd1s', text: 'Claude Code reads ~/CLAUDE.md from your home directory (~/.claude/CLAUDE.md) and project root.' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'claudemd2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'claudemd2s', text: 'These instructions persist across every conversation.' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'claudemd3',
      style: 'normal',
      children: [{ _type: 'span', _key: 'claudemd3s', text: "The thing is, I don't want an AI that sprints ahead on assumptions. I want a collaborator." }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'claudemd4',
      style: 'normal',
      children: [{ _type: 'span', _key: 'claudemd4s', text: "Here's how I tell Claude to operate:" }],
      markDefs: [],
    },

    // Subsection: Clarify before building
    {
      _type: 'block',
      _key: 'h3clarify',
      style: 'h3',
      children: [{ _type: 'span', _key: 'h3clarifys', text: 'Clarify before building.' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'clarify1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'clarify1s', text: 'Before implementing any significant changes:' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'clarify2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'clarify2s', text: '1. Summarize your understanding of what I want' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'clarify3',
      style: 'normal',
      children: [{ _type: 'span', _key: 'clarify3s', text: '2. Ask clarifying questions about unclear requirements or edge cases' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'clarify4',
      style: 'normal',
      children: [{ _type: 'span', _key: 'clarify4s', text: '3. Propose your approach and get my approval' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'clarify5',
      style: 'normal',
      children: [{ _type: 'span', _key: 'clarify5s', text: '4. Then build together incrementally, checking in at decision points' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'clarify6',
      style: 'normal',
      children: [{ _type: 'span', _key: 'clarify6s', text: "When unsure about anything, stop and ask. Don't assume." }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'clarify7',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'clarify7s1', text: 'Why it matters:', marks: ['strong'] },
        { _type: 'span', _key: 'clarify7s2', text: ' This shifts the interaction from "generate code" to "solve problems together."' },
      ],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'clarify8',
      style: 'normal',
      children: [{ _type: 'span', _key: 'clarify8s', text: 'Claude asks questions, proposes approaches, and checks in at decision points before writing.' }],
      markDefs: [],
    },

    // Collaboration loop image
    uploadedImages['claude-collaboration-loop.png'],

    // Subsection: Communication
    {
      _type: 'block',
      _key: 'h3comm',
      style: 'h3',
      children: [{ _type: 'span', _key: 'h3comms', text: 'Communication' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'comm1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'comm1s', text: '• Explain your reasoning and approach before writing code' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'comm2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'comm2s', text: '• Walk me through the "why" not just the "what"' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'comm3',
      style: 'normal',
      children: [{ _type: 'span', _key: 'comm3s', text: '• Be collaborative, not autonomous' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'comm4',
      style: 'normal',
      children: [{ _type: 'span', _key: 'comm4s', text: 'Understanding the reasoning surfaces misalignment early, before code gets written.' }],
      markDefs: [],
    },

    // Subsection: Code Style
    {
      _type: 'block',
      _key: 'h3code',
      style: 'h3',
      children: [{ _type: 'span', _key: 'h3codes', text: 'Code Style' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'code1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'code1s', text: '• Include helpful comments explaining non-obvious logic' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'code2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'code2s', text: '• Add inline explanations for complex patterns' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'code3',
      style: 'normal',
      children: [{ _type: 'span', _key: 'code3s', text: '• Make code readable and self-documenting' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'code4',
      style: 'normal',
      children: [{ _type: 'span', _key: 'code4s', text: '• Prefer clarity over cleverness' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'code5',
      style: 'normal',
      children: [{ _type: 'span', _key: 'code5s', text: "Readable code with comments beats elegant code you can't debug." }],
      markDefs: [],
    },

    // Section: Formatting & Linting
    {
      _type: 'block',
      _key: 'h2format',
      style: 'h2',
      children: [{ _type: 'span', _key: 'h2formats', text: 'Formatting & Linting' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'format1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'format1s', text: 'Prettier is configured globally (~/.prettierrc). Claude writes code that matches.' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'format2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'format2s', text: 'ESLint stays per-project:' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'format3',
      style: 'normal',
      children: [{ _type: 'span', _key: 'format3s', text: '• Next.js: next lint' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'format4',
      style: 'normal',
      children: [{ _type: 'span', _key: 'format4s', text: '• Other React/TS: ESLint with @typescript-eslint' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'format5',
      style: 'normal',
      children: [{ _type: 'span', _key: 'format5s', text: '/rams (by: @elirousso) for UI accessibility and visual polish' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'format6',
      style: 'normal',
      children: [{ _type: 'span', _key: 'format6s', text: '• Catches accessibility issues (WCAG), visual inconsistencies, missing states' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'format7',
      style: 'normal',
      children: [{ _type: 'span', _key: 'format7s', text: '• Complements Web Interface Guidelines, WIG prescribes, /rams verifies' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'format8',
      style: 'normal',
      children: [{ _type: 'span', _key: 'format8s', text: 'Claude runs checks, reports results, and proposes fixes when something fails.' }],
      markDefs: [],
    },

    // Formatting/linting image
    uploadedImages['claude-formatting-linting.png'],

    // Section: Stack Context
    {
      _type: 'block',
      _key: 'h2stack',
      style: 'h2',
      children: [{ _type: 'span', _key: 'h2stacks', text: 'Stack Context' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'stack1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'stack1s', text: 'Primary stack: JavaScript, TypeScript, React, Next.js, Tailwind CSS, shadcn/ui' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'stack2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'stack2s', text: 'Animation: anime.js' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'stack3',
      style: 'normal',
      children: [{ _type: 'span', _key: 'stack3s', text: 'Claude knows my defaults.' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'stack4',
      style: 'normal',
      children: [{ _type: 'span', _key: 'stack4s', text: 'I don\'t specify "use Tailwind" every time.' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'stack5',
      style: 'normal',
      children: [{ _type: 'span', _key: 'stack5s', text: 'It can still suggest alternatives when appropriate.' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'stack6',
      style: 'normal',
      children: [{ _type: 'span', _key: 'stack6s', text: 'Credit to @shadcn for the component system and @JulianGarnier for anime.js.' }],
      markDefs: [],
    },

    // Stack context image
    uploadedImages['claude-stack-context.png'],

    // Section: Reference Resources
    {
      _type: 'block',
      _key: 'h2ref',
      style: 'h2',
      children: [{ _type: 'span', _key: 'h2refs', text: 'Reference Resources' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'ref1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'ref1s', text: 'I keep local documentation that Claude can reference directly.' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'h3wig',
      style: 'h3',
      children: [{ _type: 'span', _key: 'h3wigs', text: 'Web Interface Guidelines' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'wig1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'wig1s', text: "Vercel's Web Interface Guidelines by @raunofreiberg and @rauchg, condensed into ~/.claude/rules/web-interface-guidelines.md with MUST/SHOULD/NEVER directives:" }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'wig2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'wig2s', text: '• Keyboard accessibility per WAI-ARIA patterns' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'wig3',
      style: 'normal',
      children: [{ _type: 'span', _key: 'wig3s', text: '• Hit targets ≥24px (≥44px on mobile)' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'wig4',
      style: 'normal',
      children: [{ _type: 'span', _key: 'wig4s', text: '• Honor prefers-reduced-motion' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'wig5',
      style: 'normal',
      children: [{ _type: 'span', _key: 'wig5s', text: '• URL reflects state (deep-linkable)' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'wig6',
      style: 'normal',
      children: [{ _type: 'span', _key: 'wig6s', text: '• Optimistic UI with rollback on failure' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'h3pk',
      style: 'h3',
      children: [{ _type: 'span', _key: 'h3pks', text: 'Prompt Kit' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'pk1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'pk1s', text: 'A component library for AI chat interfaces. Prompt Kit by @ibelick' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'pk2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'pk2s', text: 'Available components: PromptInput, ChatContainer, Message, CodeBlock, Markdown, Loader, ThinkingBar, ChainOfThought, Tool, Source, FileUpload, ScrollButton, ResponseStream, Steps, SystemMessage, TextShimmer, FeedbackBar' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'pk3',
      style: 'normal',
      children: [{ _type: 'span', _key: 'pk3s', text: 'Claude reaches for these instead of building chat components from scratch; and follows guidelines automatically when writing UI code.' }],
      markDefs: [],
    },

    // Reference resources image
    uploadedImages['claude-reference-resources.png'],

    // Section: The Rules Directory
    {
      _type: 'block',
      _key: 'h2rules',
      style: 'h2',
      children: [{ _type: 'span', _key: 'h2ruless', text: 'The Rules Directory' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'rules1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'rules1s', text: 'Beyond ~/CLAUDE.md, the ~/.claude/rules/ directory holds specialized instruction sets:' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'rules2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'rules2s', text: '• API design principles' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'rules3',
      style: 'normal',
      children: [{ _type: 'span', _key: 'rules3s', text: '• Testing conventions' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'rules4',
      style: 'normal',
      children: [{ _type: 'span', _key: 'rules4s', text: '• Style guides' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'rules5',
      style: 'normal',
      children: [{ _type: 'span', _key: 'rules5s', text: '• Framework-specific patterns' }],
      markDefs: [],
    },

    // Section: The Result
    {
      _type: 'block',
      _key: 'h2result',
      style: 'h2',
      children: [{ _type: 'span', _key: 'h2results', text: 'The Result' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'result1',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'result1s1', text: 'Before:', marks: ['strong'] },
        { _type: 'span', _key: 'result1s2', text: ' Using AI for coding felt inconsistent. Sometimes on-target, sometimes off-base.' },
      ],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'result2',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'result2s1', text: 'After:', marks: ['strong'] },
        { _type: 'span', _key: 'result2s2', text: ' It behaves like a collaborator who asks good questions, explains their thinking, follows conventions, runs tests, and knows where the documentation lives.' },
      ],
      markDefs: [],
    },

    // Before/after image
    uploadedImages['claude-before-after.png'],

    // Section: Getting Started
    {
      _type: 'block',
      _key: 'h2start',
      style: 'h2',
      children: [{ _type: 'span', _key: 'h2starts', text: 'Getting Started' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'start1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'start1s', text: '1. Install Claude Code: docs.anthropic.com/en/docs/claude-code' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'start2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'start2s', text: '2. Create ~/.claude/CLAUDE.md with your preferences' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'start3',
      style: 'normal',
      children: [{ _type: 'span', _key: 'start3s', text: '3. Optionally add rules in ~/.claude/rules/' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'start4',
      style: 'normal',
      children: [{ _type: 'span', _key: 'start4s', text: 'This works best when customized for your workflow.' }],
      markDefs: [],
    },

    // Thanks
    {
      _type: 'block',
      _key: 'thanks',
      style: 'normal',
      children: [{ _type: 'span', _key: 'thankss', text: 'Thanks to @bcherny and @AnthropicAI.' }],
      markDefs: [],
    },

    // Section: Links
    {
      _type: 'block',
      _key: 'h2links',
      style: 'h2',
      children: [{ _type: 'span', _key: 'h2linkss', text: 'Links' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'link1',
      style: 'normal',
      children: [{ _type: 'span', _key: 'link1s', text: '• Claude Code Documentation' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'link2',
      style: 'normal',
      children: [{ _type: 'span', _key: 'link2s', text: '• Prompt Kit Components' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'link3',
      style: 'normal',
      children: [{ _type: 'span', _key: 'link3s', text: '• Vercel Web Interface Guidelines' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'link4',
      style: 'normal',
      children: [{ _type: 'span', _key: 'link4s', text: '• /rams' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'link5',
      style: 'normal',
      children: [{ _type: 'span', _key: 'link5s', text: '• Prettier' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'link6',
      style: 'normal',
      children: [{ _type: 'span', _key: 'link6s', text: '• shadcn/ui' }],
      markDefs: [],
    },
    {
      _type: 'block',
      _key: 'link7',
      style: 'normal',
      children: [{ _type: 'span', _key: 'link7s', text: '• anime.js' }],
      markDefs: [],
    },
  ]

  // Create the document
  const doc = {
    _type: 'archiveItem',
    title: 'Can Claude Code Cook?',
    slug: { _type: 'slug', current: 'can-claude-code-cook' },
    type: 'Writing',
    label: 'Dev',
    cta: 'Read',
    order: 0,
    date: '2025-01-14',
    year: '2025',
    description: "With the right ingredients, yes. There's one file that teaches it how. A guide to configuring Claude Code for collaborative development.",
    body,
    coverImage: uploadedImages['claude-setup-diagram.png'],
  }

  console.log('Creating article document...')
  const result = await client.create(doc)
  console.log(`\nArticle created successfully!`)
  console.log(`Document ID: ${result._id}`)
  console.log(`\nView in Sanity Studio: https://samhayek.sanity.studio/structure/archiveItem;${result._id}`)
  console.log(`View on site: https://samhayek.com (click the article card)`)
}

createArticle().catch(console.error)
