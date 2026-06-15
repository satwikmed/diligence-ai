interface PageHeadingProps {
  eyebrow?: string
  line1?: string
  line2?: string
  line3?: string
  subtitle?: string
  singleTitle?: string
}

export default function PageHeading({
  eyebrow,
  line1,
  line2,
  line3,
  subtitle,
  singleTitle,
}: PageHeadingProps) {
  if (singleTitle) {
    const words = singleTitle.split(" ")
    const first = words[0] || singleTitle
    const rest = words.slice(1).join(" ")

    return (
      <div className="mb-10 hero-fade-up">
        {eyebrow && (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-cyan-400/80">{eyebrow}</p>
        )}
        <h1 className="text-4xl font-bold leading-none tracking-tight text-white md:text-5xl lg:text-6xl">
          <span className="hero-gradient-text block text-2xl font-light md:text-3xl lg:text-4xl">
            {first}
          </span>
          {rest && <span className="mt-1 block font-black">{rest}</span>}
        </h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-white/70">{subtitle}</p>}
      </div>
    )
  }

  return (
    <div className="mb-10 hero-fade-up">
      {eyebrow && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-cyan-400/80">{eyebrow}</p>
      )}
      <h1 className="text-4xl font-bold leading-none tracking-tight text-white md:text-5xl lg:text-6xl">
        {line1 && (
          <span className="hero-gradient-text mb-1 block text-2xl font-light md:text-3xl lg:text-4xl">
            {line1}
          </span>
        )}
        {line2 && <span className="block font-black">{line2}</span>}
        {line3 && <span className="block font-light italic text-white/80">{line3}</span>}
      </h1>
      {subtitle && <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-white/70">{subtitle}</p>}
    </div>
  )
}
