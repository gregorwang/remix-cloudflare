interface ChangelogCardProps {
  version: string
  date: string
  description: string
}

export default function ChangelogCard({ version, date, description }: ChangelogCardProps) {
  return (
    <div className="
      rounded-lg bg-primary-100 p-1.5
      transition-[transform,box-shadow] duration-300 ease-expo-out
      hover:-translate-y-1 hover:shadow-xl
    ">
      {/* Version and Date Header */}
      <div className="flex items-center gap-0.5 mb-0.75">
        {/* Version Badge */}
        <span className="
          inline-flex items-center justify-center
          rounded-xs bg-accent/10 px-0.75 py-0.25
          text-xs font-semibold tracking-wide text-accent
        ">
          {version}
        </span>
        {/* Date */}
        <span className="text-sm text-primary-950/70">{date}</span>
      </div>

      {/* Description */}
      <p className="text-base leading-relaxed text-primary-950/80">{description}</p>
    </div>
  )
}
  