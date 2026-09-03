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
      <section className="relative min-h-[45vh] sm:min-h-[55vh] md:min-h-[70vh] flex items-end overflow-hidden pt-20 md:pt-24">
        {/* Background image — optimized focal point for mobile */}
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[center_30%] md:object-center transition-all duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#1A0A00]" />
        )}

        {/* Overlays: Light gradient so the full image remains visible */}
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/85 via-black/60 to-black/30 md:to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 relative z-10">
          <div className="max-w-5xl">
            {badge && (
              <div className="flex items-center gap-2 mb-2 md:mb-4">
                <Sparkles className="text-gold-500 h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                <span className="text-gold-500 font-semibold tracking-[0.15em] text-[11px] md:text-sm uppercase">
                  {badge}
                </span>
              </div>
            )}

            <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-2 md:mb-4">
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
                  <div className="text-xl sm:text-3xl md:text-5xl font-bold text-black leading-tight">
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