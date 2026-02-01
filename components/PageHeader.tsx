import { headerContent, typeColors } from '@/lib/types'

interface PageHeaderProps {
  filter: string
}

export default function PageHeader({ filter }: PageHeaderProps) {
  const h = headerContent[filter] || headerContent.Everything
  const isEverything = filter === 'Everything'
  const colors = typeColors[filter] || typeColors.Everything

  return (
    <div className="min-h-[35vh] flex flex-col justify-end p-4 lg:p-12 pt-24">
      <div className="max-w-[800px]">
        <span
          className="font-mono font-medium text-[11px] tracking-[0.15em] uppercase block mb-6"
          style={{ color: isEverything ? 'var(--subtle)' : colors.dot }}
        >
          {isEverything ? "I'm Sam" : filter}
        </span>

        <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-foreground mb-4 leading-tight">
          {h.title}
        </h1>

        <p className="font-sans text-[17px] font-normal text-muted leading-relaxed tracking-[0.02em]">
          {h.subtitle}
        </p>
      </div>
    </div>
  )
}
