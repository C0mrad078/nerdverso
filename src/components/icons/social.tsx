import type { SVGProps } from "react";

/** Monochrome, currentColor-based marks sized to match lucide-react icons. */

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.5 3c.4 2.1 1.9 3.7 4 3.9v2.7c-1.5.1-2.9-.4-4-1.2v6.4a5.6 5.6 0 1 1-5.6-5.6c.2 0 .5 0 .7.1v2.8a2.8 2.8 0 1 0 1.9 2.7V3z" />
    </svg>
  );
}
