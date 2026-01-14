import { headerContent } from '@/lib/types'

interface PageHeaderProps {
  filter: string
}

export default function PageHeader({ filter }: PageHeaderProps) {
  const h = headerContent[filter] || headerContent.Everything
  const isEverything = filter === 'Everything'
  
  return (
    <div className="min-h-[35vh] flex flex-col justify-end p-4 lg:p-12 pt-24">
      <div className="max-w-[800px]">
        <span className="font-mono font-medium text-[11px] text-subtle tracking-[0.15em] uppercase block mb-6">
          {isEverything ? "I'm Sam" : filter}
        </span>

        <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-foreground mb-4 leading-tight">
          {h.title}
        </h1>

        <p className="font-sans text-[17px] font-medium text-muted leading-relaxed">
          {h.subtitle}
        </p>
      </div>
    </div>
  )
}
