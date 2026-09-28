import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/app/providers";
import { AudioEngine } from "@/components/music/AudioEngine";
import { FavoritesProvider } from "@/components/music/FavoritesProvider";
import { PlayerPersistence } from "@/components/music/PlayerPersistence";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const TITLE = "MyBeats — Stream Music Free";
const DESCRIPTION =
  "MyBeats is a free music streaming player. Discover trending tracks, follow artists, build your library and listen instantly — no download required.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · MyBeats",
  },
  description: DESCRIPTION,
  applicationName: "MyBeats",
  keywords: [
    "MyBeats",
    "music streaming",
    "free music player",
    "online music",
    "trending songs",
    "discover artists",
    "listen to music online",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "MyBeats",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f0d" },
  ],
  colorScheme: "light dark",
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
          <Providers>
            <TooltipProvider>
              {children}
              <FavoritesProvider isSignedIn={Boolean(user?.myBeatsUserId)} />
              <PlayerPersistence />
              <AudioEngine />
            </TooltipProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
