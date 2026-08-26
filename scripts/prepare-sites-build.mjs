import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");
const worker = `const html = ${JSON.stringify(html)};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const looksLikeAsset = /\\.[a-z0-9]+$/i.test(url.pathname);

    if (looksLikeAsset && env?.ASSETS) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  },
};
`;

await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await writeFile("dist/server/index.js", worker, "utf8");
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");
