/** Logo mark: a window arch with light inside. */
export default function ArchMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M3 30V14a13 13 0 0 1 26 0v16z" fill="#0E3B2C" />
      <path d="M9 30V15a7 7 0 0 1 14 0v15z" fill="#F2B01E" />
    </svg>
  );
}

/** Decorative nested-arch outlines used on dark banners. */
export function ArchLines({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 250 170" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 170V100a55 55 0 0 1 110 0v70" />
      <path d="M32 170v-68a33 33 0 0 1 66 0v68" />
      <path d="M54 170v-64a11 11 0 0 1 22 0v64" />
      <path d="M135 170V70a55 55 0 0 1 110 0v100" />
      <path d="M157 170V72a33 33 0 0 1 66 0v98" />
      <path d="M179 170V74a11 11 0 0 1 22 0v96" />
    </svg>
  );
}
