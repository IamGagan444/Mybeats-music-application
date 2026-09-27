import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AudioEngine } from "@/components/music/AudioEngine";
import { FavoritesProvider } from "@/components/music/FavoritesProvider";
import { GlobalPlayer } from "@/components/music/GlobalPlayer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/current-user";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyBeats — Listen on Audius",
  description:
    "Stream trending tracks and discover new artists from the Audius network.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <FavoritesProvider isSignedIn={Boolean(user)} />
            <AudioEngine />
            <GlobalPlayer />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
