import type { MetadataRoute } from "next";
const B = "https://vape-zero.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/entrar", "/cadastro", "/legal/termos", "/legal/privacidade", "/legal/aviso"].map((p) => ({ url: B + p }));
}
