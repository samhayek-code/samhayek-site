import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'jpxmevq8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// All links to add
const xHandles = {
  '@elirousso': 'https://x.com/elirousso',
  '@shadcn': 'https://x.com/shadcn',
  '@JulianGarnier': 'https://x.com/JulianGarnier',
  '@raunofreiberg': 'https://x.com/raunofreiberg',
  '@rauchg': 'https://x.com/rauchg',
  '@ibelick': 'https://x.com/ibelick',
  '@bcherny': 'https://x.com/bcherny',
  '@AnthropicAI': 'https://x.com/AnthropicAI',
}

const resourceLinks = {
  'Claude Code Documentation': 'https://docs.anthropic.com/en/docs/claude-code',
  'Prompt Kit Components': 'https://prompt-kit.com/',
  'Vercel Web Interface Guidelines': 'https://github.com/vercel-labs/web-interface-guidelines',
  '/rams': 'https://rams.ai/',
  'Prettier': 'https://prettier.io/',
  'shadcn/ui': 'https://ui.shadcn.com/',
  'anime.js': 'https://animejs.com/',
}

// Helper to create a linked text block
function createLinkedBlock(key, text, url) {
  const markKey = `link_${key}`
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    children: [
      { _type: 'span', _key: `${key}s`, text: '• ', marks: [] },
      { _type: 'span', _key: `${key}link`, text, marks: [markKey] },
    ],
    markDefs: [
      { _type: 'link', _key: markKey, href: url },
    ],
  }
}

// Helper to create block with inline link
function createBlockWithLink(key, prefix, linkText, url, suffix = '') {
  const markKey = `link_${key}`
  const children = []

  if (prefix) {
    children.push({ _type: 'span', _key: `${key}pre`, text: prefix, marks: [] })
  }
  children.push({ _type: 'span', _key: `${key}link`, text: linkText, marks: [markKey] })
  if (suffix) {
    children.push({ _type: 'span', _key: `${key}suf`, text: suffix, marks: [] })
  }

  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    children,
    markDefs: [
      { _type: 'link', _key: markKey, href: url },
    ],
  }
}

async function updateArticle() {
  console.log('Fetching current article...')

  // Get the document
  const doc = await client.getDocument('pGOOV6KDPyYBw2Izeou7hT')
  if (!doc) {
    console.error('Document not found!')
    return
  }

  console.log('Updating body with links...\n')

  // Find and get the cover image reference for later
  const coverImage = doc.coverImage

  // Get uploaded image assets from the existing body
  const existingImages = {}
  for (const block of doc.body) {
    if (block._type === 'image' && block._key) {
      existingImages[block._key] = block
    }
  }

  // Build the updated body with proper links
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
    existingImages['claude-setup-diagram'],

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
    existingImages['claude-collaboration-loop'],

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
    // /rams with link to @elirousso
    {
      _type: 'block',
      _key: 'format5',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'format5s1', text: '/rams (by: ' },
        { _type: 'span', _key: 'format5s2', text: '@elirousso', marks: ['link_elirousso'] },
        { _type: 'span', _key: 'format5s3', text: ') for UI accessibility and visual polish' },
      ],
      markDefs: [
        { _type: 'link', _key: 'link_elirousso', href: 'https://x.com/elirousso' },
      ],
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
    existingImages['claude-formatting-linting'],

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
    // Credit with links
    {
      _type: 'block',
      _key: 'stack6',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'stack6s1', text: 'Credit to ' },
        { _type: 'span', _key: 'stack6s2', text: '@shadcn', marks: ['link_shadcn'] },
        { _type: 'span', _key: 'stack6s3', text: ' for the component system and ' },
        { _type: 'span', _key: 'stack6s4', text: '@JulianGarnier', marks: ['link_julian'] },
        { _type: 'span', _key: 'stack6s5', text: ' for anime.js.' },
      ],
      markDefs: [
        { _type: 'link', _key: 'link_shadcn', href: 'https://x.com/shadcn' },
        { _type: 'link', _key: 'link_julian', href: 'https://x.com/JulianGarnier' },
      ],
    },

    // Stack context image
    existingImages['claude-stack-context'],

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
    // WIG with links to @raunofreiberg and @rauchg
    {
      _type: 'block',
      _key: 'wig1',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'wig1s1', text: "Vercel's Web Interface Guidelines by " },
        { _type: 'span', _key: 'wig1s2', text: '@raunofreiberg', marks: ['link_rauno'] },
        { _type: 'span', _key: 'wig1s3', text: ' and ' },
        { _type: 'span', _key: 'wig1s4', text: '@rauchg', marks: ['link_rauchg'] },
        { _type: 'span', _key: 'wig1s5', text: ', condensed into ~/.claude/rules/web-interface-guidelines.md with MUST/SHOULD/NEVER directives:' },
      ],
      markDefs: [
        { _type: 'link', _key: 'link_rauno', href: 'https://x.com/raunofreiberg' },
        { _type: 'link', _key: 'link_rauchg', href: 'https://x.com/rauchg' },
      ],
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
    // Prompt Kit with link to @ibelick
    {
      _type: 'block',
      _key: 'pk1',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'pk1s1', text: 'A component library for AI chat interfaces. Prompt Kit by ' },
        { _type: 'span', _key: 'pk1s2', text: '@ibelick', marks: ['link_ibelick'] },
      ],
      markDefs: [
        { _type: 'link', _key: 'link_ibelick', href: 'https://x.com/ibelick' },
      ],
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
    existingImages['claude-reference-resources'],

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
    existingImages['claude-before-after'],

    // Section: Getting Started
    {
      _type: 'block',
      _key: 'h2start',
      style: 'h2',
      children: [{ _type: 'span', _key: 'h2starts', text: 'Getting Started' }],
      markDefs: [],
    },
    // Step 1 with link
    {
      _type: 'block',
      _key: 'start1',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'start1s1', text: '1. Install Claude Code: ' },
        { _type: 'span', _key: 'start1s2', text: 'docs.anthropic.com/en/docs/claude-code', marks: ['link_claudedocs'] },
      ],
      markDefs: [
        { _type: 'link', _key: 'link_claudedocs', href: 'https://docs.anthropic.com/en/docs/claude-code' },
      ],
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

    // Thanks with links
    {
      _type: 'block',
      _key: 'thanks',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'thankss1', text: 'Thanks to ' },
        { _type: 'span', _key: 'thankss2', text: '@bcherny', marks: ['link_bcherny'] },
        { _type: 'span', _key: 'thankss3', text: ' and ' },
        { _type: 'span', _key: 'thankss4', text: '@AnthropicAI', marks: ['link_anthropic'] },
        { _type: 'span', _key: 'thankss5', text: '.' },
      ],
      markDefs: [
        { _type: 'link', _key: 'link_bcherny', href: 'https://x.com/bcherny' },
        { _type: 'link', _key: 'link_anthropic', href: 'https://x.com/AnthropicAI' },
      ],
    },

    // Section: Links
    {
      _type: 'block',
      _key: 'h2links',
      style: 'h2',
      children: [{ _type: 'span', _key: 'h2linkss', text: 'Links' }],
      markDefs: [],
    },
    createLinkedBlock('link1', 'Claude Code Documentation', 'https://docs.anthropic.com/en/docs/claude-code'),
    createLinkedBlock('link2', 'Prompt Kit Components', 'https://prompt-kit.com/'),
    createLinkedBlock('link3', 'Vercel Web Interface Guidelines', 'https://github.com/vercel-labs/web-interface-guidelines'),
    createLinkedBlock('link4', '/rams', 'https://rams.ai/'),
    createLinkedBlock('link5', 'Prettier', 'https://prettier.io/'),
    createLinkedBlock('link6', 'shadcn/ui', 'https://ui.shadcn.com/'),
    createLinkedBlock('link7', 'anime.js', 'https://animejs.com/'),
  ]

  // Filter out any undefined images
  const filteredBody = body.filter(block => block !== undefined)

  // Update the document
  await client
    .patch('pGOOV6KDPyYBw2Izeou7hT')
    .set({ body: filteredBody })
    .commit()

  console.log('Article updated with all links!')
  console.log('\nLinks added:')
  console.log('- @elirousso → https://x.com/elirousso')
  console.log('- @shadcn → https://x.com/shadcn')
  console.log('- @JulianGarnier → https://x.com/JulianGarnier')
  console.log('- @raunofreiberg → https://x.com/raunofreiberg')
  console.log('- @rauchg → https://x.com/rauchg')
  console.log('- @ibelick → https://x.com/ibelick')
  console.log('- @bcherny → https://x.com/bcherny')
  console.log('- @AnthropicAI → https://x.com/AnthropicAI')
  console.log('- Claude Code Documentation → https://docs.anthropic.com/en/docs/claude-code')
  console.log('- Prompt Kit Components → https://prompt-kit.com/')
  console.log('- Vercel Web Interface Guidelines → https://github.com/vercel-labs/web-interface-guidelines')
  console.log('- /rams → https://rams.ai/')
  console.log('- Prettier → https://prettier.io/')
  console.log('- shadcn/ui → https://ui.shadcn.com/')
  console.log('- anime.js → https://animejs.com/')
}

updateArticle().catch(console.error)
