import type { Metadata } from "next";
import { Geist, Geist_Mono, Alex_Brush } from "next/font/google";
import "./globals.css";
import { AssessmentProvider } from "@/lib/assessment-store";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const alexBrush = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-alex-brush",
});

export const metadata: Metadata = {
  title: "CodeAssess | Technical Coding Assessment & Candidate Evaluation Platform",
  description: "Standardized technical coding assessments, in-browser Monaco IDE, empirical laboratory evaluation reports, and candidate review console.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${alexBrush.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
        <AssessmentProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </AssessmentProvider>
      </body>
    </html>
  );
}
