import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import { ThemeProvider } from "@/components/theme-provider"
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Certis — Patent Drafting Intelligence",
  description: "AI-powered drafting augmentation platform for patent attorneys. Reduce drafting time from 20-40 hours to 3 hours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthGuard>
            <AppShell>
              {children}
            </AppShell>
          </AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
