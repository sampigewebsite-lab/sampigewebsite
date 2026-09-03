import { Sparkles } from 'lucide-react'

interface PageHeroProps {
  badge?: string | null
  title: string
  description?: string | null
  backgroundImage?: string | null
  stats?: Array<{ value: string; label: string }>
}

export default function PageHero({
  badge,
  title,
  description,
  backgroundImage,
  stats,
}: PageHeroProps) {
  const validStats = stats?.filter((s) => s.value && s.label) || []

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[75vh] flex items-end overflow-hidden pt-16 md:pt-20">
        {/* Background image */}
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#1A0A00]" />
        )}

        {/* Responsive dark gradient overlays — lighter & top-to-bottom on mobile so the image stays visible */}
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/90 via-black/70 md:via-black/60 to-black/40 md:to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-20 relative z-10">
          <div className="max-w-5xl">
            {badge && (
              <div className="flex items-center gap-2 mb-3 md:mb-5">
                <Sparkles className="text-gold-500 h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                <span className="text-gold-500 font-semibold tracking-[0.15em] text-[11px] md:text-sm uppercase">
                  {badge}
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] md:leading-[1.05] mb-3 md:mb-5">
              {title}
            </h1>

            {description && (
              <p className="text-xs sm:text-base md:text-lg text-gray-200 max-w-4xl leading-relaxed md:leading-8">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* YELLOW STAT STRIP */}
      {validStats.length > 0 && (
        <section className="bg-gold-500 py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-4">
            <div
              className={`grid gap-3 sm:gap-4 md:gap-6 ${
                validStats.length === 1
                  ? 'grid-cols-1'
                  : validStats.length === 2
                    ? 'grid-cols-2'
                    : validStats.length === 3
                      ? 'grid-cols-3'
                      : 'grid-cols-2 md:grid-cols-4'
              }`}
            >
              {validStats.map((stat, index) => (
                <div
                  key={index}
                  className={`${
                    index !== 0 ? 'border-l border-black/15 md:border-black/20 pl-3 sm:pl-4 md:pl-6' : ''
                  }`}
                >
                  <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-black leading-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-black/80 uppercase tracking-wider mt-0.5 md:mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}