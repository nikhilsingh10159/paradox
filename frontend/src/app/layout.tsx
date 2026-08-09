import type { Metadata } from "next";
import "./globals.css";

import { AppProvider } from "@/context/AppContext";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Paradox — Smart Escrow & AI Dispute Platform",
  description: "Reputation-Weighted Escrow with Multi-Modal AI Dispute Resolution",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ToastProvider>
            <AppProvider>
              <Navbar />
              {children}
            </AppProvider>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}