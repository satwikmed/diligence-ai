interface SectionHeadingProps {
  label: string
  title?: string
}

export default function SectionHeading({ label, title }: SectionHeadingProps) {
  return (
    <div className="mb-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400/70">{label}</p>
      {title && (
        <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">
          <span className="hero-gradient-text">
            {title}
          </span>
        </h2>
      )}
    </div>
  )
}
