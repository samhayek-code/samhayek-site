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
          className="font-mono t-overline block mb-6"
          style={{ color: isEverything ? 'var(--subtle)' : colors.dot }}
        >
          {isEverything ? "I'm Sam" : filter}
        </span>

        <h1 className="font-sans t-display text-foreground mb-4">
          {h.title}
        </h1>

        <p className="font-sans t-body-lg text-muted">
          {h.subtitle}
        </p>
      </div>
    </div>
  )
}
