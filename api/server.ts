// Vercel serverless function that delegates every request to the
// TanStack Start SSR handler built into dist/server/server.js.
// vercel.json rewrites all non-asset paths here.
//
export const config = { runtime: "nodejs" };

export default async function vercelHandler(request: Request): Promise<Response> {
  // Resolved by Vercel at runtime after `npm run build` has produced dist/server.
  const { default: handler } = await import(/* @vite-ignore */ "../dist/server/server.js");

  return (handler as { fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> })
    .fetch(request, process.env, {});
}
