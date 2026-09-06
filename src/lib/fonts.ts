import { Inter, Anton, Geist_Mono } from "next/font/google";

export const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Bold, condensed display face chosen to sit next to the brand's hand-drawn
// graffiti wordmark without clashing with it (an elegant serif read as
// off-brand against that mark — see docs/design-system.md).
export const anton = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const fontVariables = `${inter.variable} ${anton.variable} ${geistMono.variable}`;
