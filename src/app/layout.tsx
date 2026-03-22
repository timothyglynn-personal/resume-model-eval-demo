import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Resume Fit Evaluator",
  description:
    "Evaluate how well your resume matches a job description using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <nav className="border-b bg-white">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-sm font-medium text-gray-900">
              Evaluator
            </Link>
            <Link
              href="/trends"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Trends
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
