/** @type {import('next').NextConfig} */

// In local dev the FastAPI app runs separately on :8000. In production on Vercel,
// `vercel.json` rewrites `/api/*` to the Python serverless function, so this
// rewrite is a no-op there (guarded by NODE_ENV).
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      const target = process.env.API_PROXY_TARGET || "http://127.0.0.1:8000";
      return [{ source: "/api/:path*", destination: `${target}/api/:path*` }];
    }
    return [];
  },
};

export default nextConfig;
