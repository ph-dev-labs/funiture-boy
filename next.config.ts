import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only firebase-admin needs to stay external (native/gRPC bindings can't be
  // bundled). jose/jwks-rsa must be bundled by Next so ESM/CJS interop is
  // resolved at build time — externalizing them makes Turbopack's runtime
  // loader require() jose's ESM-only build directly, which crashes
  // (ERR_REQUIRE_ESM) the moment verifyIdToken's JWKS verification path runs.
  serverExternalPackages: ['firebase-admin'],
};

export default nextConfig;
