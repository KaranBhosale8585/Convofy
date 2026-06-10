import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
import { getDbUserId } from "@/actions/user.action";
import NotificationListener from "@/components/NotificationListener";

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
  title: "Convofy",
  description:
    "Convofy is a modern chat application that lets you connect, chat, and share seamlessly in real time.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbUserId = await getDbUserId().catch(() => null);

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* ✅ ROOT CONTAINER */}
            <div className="min-h-screen flex flex-col">
              {/* ✅ NAVBAR (fixed height) */}
              <Navbar />

              {/* ✅ MAIN AREA */}
              <main className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4">
                  {/* ✅ GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* ✅ SIDEBAR */}
                    <div className="hidden lg:block lg:col-span-3">
                      <Sidebar />
                    </div>

                    {/* ✅ PAGE CONTENT */}
                    <div className="lg:col-span-9">
                      {children}
                    </div>
                  </div>
                </div>
              </main>
            </div>

            <Toaster />
            <NotificationListener userId={dbUserId} />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}