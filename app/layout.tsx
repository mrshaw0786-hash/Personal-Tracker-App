import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Ascend — Your 45-Day AI Transformation Coach",
    template: "%s · Ascend",
  },
  description:
    "Ascend is an AI-powered transformation platform that rebuilds your fitness, nutrition, sleep, discipline, and career focus through a personalized 45-day system.",
  keywords: [
    "transformation",
    "fitness coach",
    "AI coach",
    "nutrition planner",
    "habit tracker",
    "45 day challenge",
    "discipline",
  ],
  openGraph: {
    title: "Ascend — Your 45-Day AI Transformation Coach",
    description:
      "A personal coach, trainer, nutritionist, and productivity mentor in one app. Transform your lifestyle in 45 days.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
