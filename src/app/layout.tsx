import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/site";

export const metadata: Metadata = {
  metadataBase: new URL("https://vape-zero.vercel.app"),
  title: { default: "VAPE ZERO — Informação para escolher. Apoio para mudar.", template: "%s · VAPE ZERO" },
  description: "Plataforma de prevenção e educação em saúde sobre vape para adolescentes, escolas e UBS.",
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = { themeColor: "#4f9d8e" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen flex flex-col">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow">Pular para o conteúdo</a>
        <Header />
        <main id="conteudo" tabIndex={-1} className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
