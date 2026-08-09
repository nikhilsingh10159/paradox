import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AppProvider } from "@/context/AppContext";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
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