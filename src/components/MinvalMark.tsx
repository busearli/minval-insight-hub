type Props = { className?: string };

/** Circular emblem inspired by the Minval logo: concentric arches inside a sage disc. */
export function MinvalMark({ className = "h-9 w-9" }: Props) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Minval Akademi" className={className}>
      <circle cx="32" cy="32" r="32" fill="var(--primary)" />
      <g fill="none" stroke="var(--sage)" strokeWidth="2.6" strokeLinecap="round">
        <path d="M18 46V32a14 14 0 0 1 28 0v14" />
        <path d="M25 46V32a7 7 0 0 1 14 0v14" />
        <path d="M32 46v-13" />
      </g>
    </svg>
  );
}

/** Decorative concentric arch line pattern for hero / header backgrounds. */
export function ArchPattern({ className = "" }: Props) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMax slice"
      className={className}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        {[40, 70, 100, 130, 160, 190].map((r) => (
          <path key={r} d={`M${200 - r} 200V${200 - r * 0.85}a${r} ${r * 0.85} 0 0 1 ${r * 2} 0V200`} />
        ))}
      </g>
    </svg>
  );
}
