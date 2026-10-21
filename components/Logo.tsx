import Image from "next/image";

export default function Logo({ size = 44, className = "" }: { size?: number; className?: string }) {
  return <Image src="/logo.png" alt="Ona-Igbala Baptist Church logo" width={size} height={size} className={`rounded-full ${className}`} />;
}

/** Concentric rings echoing the ring around the church logo. Decorative. */
export function Rings({ className = "" }: { className?: string }) {
  const dots = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    return [200 + 188 * Math.cos(a), 200 + 188 * Math.sin(a)];
  });
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" fill="none">
      <circle cx="200" cy="200" r="188" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="158" stroke="currentColor" strokeWidth="1" strokeDasharray="2 9" strokeLinecap="round" />
      <circle cx="200" cy="200" r="128" stroke="currentColor" strokeWidth="1" />
      {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 6 === 0 ? 4 : 2} fill="#F5C518" />)}
    </svg>
  );
}
