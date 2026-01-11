import React, { useState } from 'react';
import { ArrowRight, Clock, Code, GitBranch, Layers, Music, Palette, Terminal, Zap, ExternalLink, ChevronDown, Check, ArrowUpRight } from 'lucide-react';

const CaseStudyRedesign = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedFeature, setExpandedFeature] = useState(null);

  const techStack = [
    { layer: 'Framework', tech: 'Next.js 14', icon: <Layers size={16} /> },
    { layer: 'Language', tech: 'TypeScript', icon: <Code size={16} /> },
    { layer: 'Styling', tech: 'Tailwind CSS', icon: <Palette size={16} /> },
    { layer: 'CMS', tech: 'Sanity v3', icon: <Terminal size={16} /> },
    { layer: 'Hosting', tech: 'Vercel', icon: <Zap size={16} /> },
    { layer: 'Payments', tech: 'Lemon Squeezy', icon: <ArrowRight size={16} /> },
  ];

  const metrics = [
    { label: 'Dev Time', value: '8hrs', detail: 'Single day build' },
    { label: 'Commits', value: '15+', detail: 'Iterative development' },
    { label: 'Integrations', value: '4', detail: 'Third-party services' },
    { label: 'Content Types', value: '8', detail: 'Flexible schema' },
    { label: 'Lines of Code', value: '~1.5k', detail: 'Excluding deps' },
  ];

  const features = [
    {
      id: 'navigation',
      title: 'Responsive Navigation',
      problem: 'Desktop needed horizontal filter tabs with keyboard shortcuts. Mobile needed touch-friendly targets.',
      solution: 'Dual-layout component using Tailwind breakpoints. Desktop renders horizontal row; mobile renders 3×3 grid.',
      code: `// Desktop: horizontal row
<div className="hidden sm:flex items-center justify-between">
// Mobile: 3x3 grid  
<div className="sm:hidden grid grid-cols-3 gap-2">`
    },
    {
      id: 'audio',
      title: 'Procedural Audio',
      problem: 'Wanted subtle hover/navigation sounds without loading audio files.',
      solution: 'Web Audio API generates tones procedurally. Sine wave oscillator (800Hz) with rapid gain decay.',
      code: `const oscillator = audioContext.createOscillator()
oscillator.frequency.value = 800
oscillator.type = 'sine'
gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03)`
    },
    {
      id: 'keyboard',
      title: 'Keyboard Navigation',
      problem: 'Arrow keys should cycle through filter categories with visual feedback.',
      solution: 'useEffect listens for ArrowLeft/ArrowRight, triggers 150ms flash indicator.',
      code: `useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedItem) return // Don't navigate when modal open
    const currentIndex = filterCategories.indexOf(activeFilter)
    if (e.key === 'ArrowLeft') {
      const newIndex = currentIndex <= 0 ? filterCategories.length - 1 : currentIndex - 1
      setActiveFilter(filterCategories[newIndex])
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [activeFilter, selectedItem])`
    },
    {
      id: 'checkout',
      title: 'Overlay Checkout',
      problem: 'Lemon Squeezy overlay conflicted with site modal—z-index battles and scroll lock conflicts.',
      solution: 'Three-part fix: anchor tag with SDK class, close modal before checkout, ref prevents scroll restoration.',
      code: `const closingForCheckoutRef = useRef(false)
useEffect(() => {
  document.body.style.overflow = 'hidden'
  return () => {
    if (!closingForCheckoutRef.current) {
      document.body.style.overflow = 'auto'
    }
  }
}, [])`
    },
    {
      id: 'sorting',
      title: 'Hybrid Content Ordering',
      problem: 'Needed newest first (chronological) but also to pin certain items to the bottom.',
      solution: 'Two-field sorting: order field takes priority, date as secondary. Default order: 0, pin with order: 100.',
      code: `*[_type == "archiveItem"] | order(coalesce(order, 0) asc, date desc)`
    },
    {
      id: 'embeds',
      title: 'Multi-Embed Modal',
      problem: 'Single modal needed to handle Spotify, YouForm, Cal.com, galleries, and rich text conditionally.',
      solution: 'Slug-based detection for special embeds, field-based for standard. Each loads scripts dynamically.',
      code: `const isContactForm = item.slug?.current === 'send-message'
const isBookingForm = item.slug?.current === 'book-a-call'

{isContactForm && <YouFormEmbed />}
{isBookingForm && <CalEmbed />}
{item.embedUrl && <SpotifyEmbed url={item.embedUrl} />}`
    },
  ];

  const lessons = [
    { title: 'Overlay conflicts are subtle', desc: 'Z-index and scroll lock interactions between multiple overlay systems required careful state management.' },
    { title: 'Sorting flexibility matters', desc: 'Simple "sort by date" seemed sufficient until edge cases emerged. Hybrid system solved real problems.' },
    { title: 'Mobile-first isn\'t always right', desc: 'Desktop defined the feature set; mobile got a thoughtful subset. Worked better for interaction-heavy design.' },
    { title: 'Documentation is a feature', desc: 'Comprehensive CLAUDE.md and README.md made context recovery between sessions seamless.' },
  ];

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'features', label: 'Features' },
    { id: 'lessons', label: 'Lessons' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased">
      {/* CSS Variables for shadcn yellow theme */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        :root {
          --radius: 0.375rem;
          --accent: 47 96% 53%;
          --accent-foreground: 0 0% 9%;
        }
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        code, pre {
          font-family: 'JetBrains Mono', monospace;
        }
        
        .accent-gradient {
          background: linear-gradient(135deg, hsl(47, 96%, 53%) 0%, hsl(38, 92%, 50%) 100%);
        }
        
        .glass {
          background: rgba(23, 23, 23, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .card-hover {
          transition: all 0.2s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        .text-accent {
          color: hsl(47, 96%, 53%);
        }

        .bg-accent {
          background-color: hsl(47, 96%, 53%);
        }

        .border-accent {
          border-color: hsl(47, 96%, 53%);
        }

        .ring-accent {
          --tw-ring-color: hsl(47, 96%, 53%);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-in {
          animation: fadeIn 0.4s ease forwards;
        }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
      `}</style>

      {/* Navigation - Inverted Menu */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center">
                <Music size={16} className="text-neutral-950" />
              </div>
              <span className="font-semibold text-sm tracking-tight">Case Study</span>
            </div>
            
            {/* Nav Pills */}
            <div className="hidden md:flex items-center bg-neutral-900 rounded-sm p-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-all ${
                    activeSection === item.id
                      ? 'bg-accent text-neutral-950'
                      : 'text-neutral-400 hover:text-neutral-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <a 
              href="https://samhayek-site.vercel.app" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-sm font-medium rounded-sm transition-colors"
            >
              Live Site
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 rounded-sm text-xs font-medium text-neutral-400 mb-6">
                <Clock size={12} />
                Built in a single day
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Building a Portfolio Site with{' '}
                <span className="text-accent">AI-Assisted</span> Development
              </h1>
              
              <p className="text-lg text-neutral-400 leading-relaxed mb-8 max-w-xl">
                A full-stack portfolio website built with Next.js, Sanity CMS, and Claude Code. 
                From scaffold to production in 8 hours—including responsive design, four third-party 
                integrations, and keyboard navigation with procedural audio.
              </p>

              <div className="flex flex-wrap gap-3">
                <a 
                  href="https://samhayek-site.vercel.app" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-neutral-950 font-semibold text-sm rounded-sm hover:opacity-90 transition-opacity"
                >
                  View Live Site
                  <ArrowUpRight size={16} />
                </a>
                <a 
                  href="https://samhayek.sanity.studio" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 font-medium text-sm rounded-sm transition-colors"
                >
                  Sanity Studio
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in stagger-2">
              {metrics.map((metric, i) => (
                <div 
                  key={metric.label}
                  className={`p-4 bg-neutral-900/50 border border-neutral-800 rounded-sm card-hover ${
                    i === 0 ? 'col-span-2 sm:col-span-1' : ''
                  }`}
                >
                  <div className="text-2xl font-bold text-accent mb-1">{metric.value}</div>
                  <div className="text-sm font-medium text-neutral-200">{metric.label}</div>
                  <div className="text-xs text-neutral-500 mt-1">{metric.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-6 border-t border-neutral-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-6 bg-accent rounded-full"></div>
            <h2 className="text-2xl font-bold">Technical Architecture</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((item, i) => (
              <div 
                key={item.layer}
                className="flex items-center gap-4 p-4 bg-neutral-900/30 border border-neutral-800/50 rounded-sm card-hover animate-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-10 h-10 rounded-sm bg-neutral-800 flex items-center justify-center text-accent">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">{item.layer}</div>
                  <div className="font-semibold">{item.tech}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Architecture Highlights */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Server Components + Client Islands',
                desc: 'Page renders server-side via App Router. Interactive elements isolated in HomeClient component with "use client" for small initial bundles.',
              },
              {
                title: 'Headless CMS with GROQ',
                desc: 'Content lives in Sanity, queried via GROQ. Schema defines 8 content types with type-specific fields and manual sorting override.',
              },
              {
                title: 'Dynamic Third-Party Loading',
                desc: 'Embed scripts (Cal.com, YouForm, Lemon Squeezy) load conditionally based on content type. Zero unnecessary payload.',
              },
            ].map((item, i) => (
              <div key={item.title} className="p-6 bg-neutral-900/20 border border-neutral-800/30 rounded-sm">
                <h3 className="font-semibold mb-3 text-neutral-100">{item.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-neutral-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-6 bg-accent rounded-full"></div>
            <h2 className="text-2xl font-bold">Feature Implementation</h2>
          </div>

          <div className="space-y-4">
            {features.map((feature, i) => (
              <div 
                key={feature.id}
                className="border border-neutral-800/50 rounded-sm overflow-hidden bg-neutral-950/50"
              >
                <button
                  onClick={() => setExpandedFeature(expandedFeature === feature.id ? null : feature.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-neutral-900/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-sm bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-left">{feature.title}</span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`text-neutral-500 transition-transform ${
                      expandedFeature === feature.id ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {expandedFeature === feature.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-neutral-800/30 animate-in">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Problem</div>
                        <p className="text-sm text-neutral-300 mb-4">{feature.problem}</p>
                        
                        <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Solution</div>
                        <p className="text-sm text-neutral-300">{feature.solution}</p>
                      </div>
                      
                      <div>
                        <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Code</div>
                        <pre className="p-4 bg-neutral-900 rounded-sm text-xs text-neutral-300 overflow-x-auto">
                          <code>{feature.code}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CMS Schema Section */}
      <section className="py-20 px-6 border-t border-neutral-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-6 bg-accent rounded-full"></div>
            <h2 className="text-2xl font-bold">CMS Schema Design</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="pb-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">Field</th>
                  <th className="pb-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">Type</th>
                  <th className="pb-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['title', 'string', 'Display name'],
                  ['slug', 'slug', 'URL identifier, special embed detection'],
                  ['type', 'enum', 'Category (Music, Art, Shop, etc.)'],
                  ['label', 'string', 'Subtype ("Single", "Oil on Canvas")'],
                  ['order', 'number', 'Manual sort override'],
                  ['date', 'date', 'Chronological sorting'],
                  ['coverImage', 'image', 'Card background + modal hero'],
                  ['embedUrl', 'url', 'Spotify/Apple Music'],
                  ['externalUrl', 'url', 'External links'],
                  ['lemonSqueezyUrl', 'url', 'Checkout integration'],
                  ['body', 'portable text', 'Rich content for Writing type'],
                  ['gallery', 'image[]', 'Additional images'],
                ].map(([field, type, purpose], i) => (
                  <tr key={field} className="border-b border-neutral-800/30">
                    <td className="py-3 font-mono text-accent">{field}</td>
                    <td className="py-3 text-neutral-400">{type}</td>
                    <td className="py-3 text-neutral-300">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Lessons Learned */}
      <section className="py-20 px-6 bg-neutral-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-6 bg-accent rounded-full"></div>
            <h2 className="text-2xl font-bold">Lessons Learned</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {lessons.map((lesson, i) => (
              <div 
                key={lesson.title}
                className="flex gap-4 p-5 bg-neutral-950/50 border border-neutral-800/30 rounded-sm card-hover"
              >
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{lesson.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{lesson.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Pipeline */}
      <section className="py-20 px-6 border-t border-neutral-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-6 bg-accent rounded-full"></div>
            <h2 className="text-2xl font-bold">Deployment Pipeline</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { trigger: 'git push origin main', action: 'Vercel builds + deploys site', icon: <GitBranch size={18} /> },
              { trigger: 'npx sanity deploy', action: 'Deploys Sanity Studio', icon: <Terminal size={18} /> },
              { trigger: 'Sanity content change', action: 'CDN invalidates, site updates', icon: <Zap size={18} /> },
            ].map((item) => (
              <div key={item.trigger} className="p-5 bg-neutral-900/30 border border-neutral-800/50 rounded-sm">
                <div className="w-10 h-10 rounded-sm bg-neutral-800 flex items-center justify-center text-accent mb-4">
                  {item.icon}
                </div>
                <div className="font-mono text-sm text-accent mb-2">{item.trigger}</div>
                <div className="text-sm text-neutral-400">{item.action}</div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-neutral-400 max-w-2xl">
            Vercel maintains deployment history with instant rollback. Git provides code versioning. 
            Sanity maintains document revision history. The three systems together create a robust 
            recovery path for any failure mode.
          </p>
        </div>
      </section>

      {/* Performance Section */}
      <section className="py-20 px-6 bg-neutral-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-6 bg-accent rounded-full"></div>
            <h2 className="text-2xl font-bold">Performance Optimizations</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              'Server-side rendering',
              'Sanity image pipeline',
              'Next.js <Image> optimization',
              'Conditional script loading',
              'Procedural audio (no file requests)',
              'Tailwind CSS purge',
            ].map((item) => (
              <div 
                key={item}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-950/50 border border-neutral-800/30 rounded-sm text-sm"
              >
                <Check size={14} className="text-accent" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 border-t border-neutral-800/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">See it in action</h2>
          <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
            The entire portfolio site—responsive design, keyboard navigation, 
            procedural audio, and all four integrations—deployed and live.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://samhayek-site.vercel.app" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-neutral-950 font-semibold rounded-sm hover:opacity-90 transition-opacity"
            >
              View Live Site
              <ArrowUpRight size={18} />
            </a>
            <a 
              href="https://samhayek.sanity.studio" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 font-medium rounded-sm transition-colors"
            >
              Open Sanity Studio
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-neutral-800/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-sm bg-accent flex items-center justify-center">
              <Music size={10} className="text-neutral-950" />
            </div>
            <span>Next.js 14 / TypeScript / Tailwind CSS / Sanity v3 / Vercel</span>
          </div>
          <div>Built with Claude Code</div>
        </div>
      </footer>
    </div>
  );
};

export default CaseStudyRedesign;
