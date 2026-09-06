import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Dev seed placeholders are local SVGs; production photography will use
    // a real image host configured via images.remotePatterns.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
