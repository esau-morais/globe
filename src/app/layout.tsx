import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConvexClientProvider } from "@/components/convex-client-provider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Visitor Globe",
  description: "Real-time visitor locations on an interactive globe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("font-sans bg-[#010302] text-[#e5e5e5]", geist.variable)}
    >
      <body>
        <ConvexClientProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
