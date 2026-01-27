import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { KeyboardProvider } from "@/components/providers/KeyboardProvider";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { AntdProvider } from "@/components/providers/AntdProvider";
import { PageTransition } from "@/components/transitions/PageTransition";
import { RouteProgressBar } from "@/components/transitions/RouteProgressBar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "GEO Nexus Platform",
  description: "Enterprise GEO Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AntdProvider>
          <KeyboardProvider>
            <RouteProgressBar />
            <div className="flex min-h-screen bg-slate-50">
              {/* Sidebar */}
              <Sidebar />

              {/* Main Content Area */}
              <main className="flex-1 lg:ml-64">
                {/* Mobile header spacer */}
                <div className="h-14 lg:h-0" />
                <div className="p-4 md:p-6 lg:p-8">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </div>
              </main>
            </div>
            <Toaster />
            <OnboardingGuide />
          </KeyboardProvider>
        </AntdProvider>
      </body>
    </html>
  );
}
