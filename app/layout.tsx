import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AudioEngine } from "@/components/music/AudioEngine";
import { FavoritesProvider } from "@/components/music/FavoritesProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/current-user";
import "./globals.css";

// Self-hosted by next/font — no runtime request to Google, and only the
// weights actually used are shipped.
const poppins = Poppins({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background">
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
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
