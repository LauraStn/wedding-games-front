import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../styles/global.css";
import "../styles/components.css";
import { Providers } from "./providers";
import { ConnectionBanner } from "../components/ConnectionBanner";

export const metadata: Metadata = {
  title: "Jeux de mariage",
  description: "Application privée d'animations de mariage",
};

export const viewport: Viewport = {
  themeColor: "#7c5cff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          <ConnectionBanner />
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
