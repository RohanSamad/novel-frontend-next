import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/store/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToasterProvider from "@/store/ToasterProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', 
  preload: true,  
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: "Novel Tavern | Audiobooks & Novel Reading Platform",
  description: "Novel Tavern - Your premier platform for audiobooks and novels",
  icons: {
    icon: '/book-icon.svg', 
  },
  other: {
    'theme-color': '#2563EB',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://development.mitprogrammer.com" />
        <link rel="preconnect" href="https://development.mitprogrammer.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header/>
            {children}
          <Footer/>
          <ToasterProvider/>
        </Providers>
      </body>
    </html>
  );
}
