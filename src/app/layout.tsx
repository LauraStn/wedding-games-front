import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "../styles/global.css";
import "../styles/components.css";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Weddup",
  description: "Weddup — l'application de jeux pour animer votre mariage",
};

export const viewport: Viewport = {
  themeColor: "#2457ff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body>
        <Providers>
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
