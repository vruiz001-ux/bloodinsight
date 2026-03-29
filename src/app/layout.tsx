import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MedicalDisclaimer } from "@/components/common/medical-disclaimer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BloodInsight — Understand Your Blood Tests",
  description:
    "AI-powered blood test interpretation. Upload your lab results and get clear, personalized explanations with actionable health insights. Educational tool — not medical advice.",
  keywords: [
    "blood test",
    "lab results",
    "health insights",
    "biomarkers",
    "blood work interpretation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <MedicalDisclaimer />
      </body>
    </html>
  );
}
