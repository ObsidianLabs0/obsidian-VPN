// Vercel serverless function that delegates every request to the
// TanStack Start SSR handler built into dist/server/server.js.
// vercel.json rewrites all non-asset paths here.
//
// @ts-ignore - resolved at deploy time from the build output
import handler from "../dist/server/server.js";

export const config = { runtime: "nodejs" };

export default async function vercelHandler(request: Request): Promise<Response> {
  return (handler as { fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> })
    .fetch(request, process.env, {});
}
