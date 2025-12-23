import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/navbar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "BioVerity AI",
    template: "%s | BioVerity AI",
  },
  description: "AI-powered biometric identification platform",
  openGraph: {
    title: "BioVerity AI",
    description: "Biometrics Identification",
    url: "https://www.bioverityai.com",
    siteName: "BioVerity AI",
    images: [
      {
        url: "/og.png", 
        width: 1200,
        height: 630,
        alt: "BioVerity AI",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BioVerity AI",
    description: "Biometrics Identification",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
