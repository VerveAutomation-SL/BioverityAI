import "./globals.css";
import Navbar from "./components/navbar";
import { Toaster } from "react-hot-toast";

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
