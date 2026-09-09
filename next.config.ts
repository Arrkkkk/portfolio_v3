import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev badge sits over the bottom-left of every screenshot,
  // which breaks the visual-validation loop against the reference frames.
  devIndicators: false,
};

export default nextConfig;
