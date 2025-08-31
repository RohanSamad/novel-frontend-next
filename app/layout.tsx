import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/store/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToasterProvider from "@/store/ToasterProvider";
import Script from "next/script";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title:
    "Read Listen free novel Online. Stream Audiobooks and audionovel full NovelTavern",
  description:
    "Discover thousands of novels and novel updates to read and listen online for free. Enjoy popular genres including romance, fantasy, cultivation, translated novels & more. Stream audiobooks and eBooks anytime, anywhere for completely free. Start your free literary adventure now!",
  icons: {
    icon: "/book-icon.svg",
  },
  other: {
    "theme-color": "#2563EB",
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
        <link rel="dns-prefetch" href="https://api.noveltavern.com" />
        <link rel="preconnect" href="https://api.noveltavern.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
          {children}
          <Script id="custom-script" strategy="afterInteractive">
            {`
            (function(){
              var k = window,
                  o = "af2fbe418896fc230345064620189988",
                  g = [
                    ["siteId",935+492+943+470+5227848],
                    ["minBid",0],
                    ["popundersPerIP","0"],
                    ["delayBetween",0],
                    ["default",false],
                    ["defaultPerDay",0],
                    ["topmostLayer","auto"]
                  ],
                  s = [
                    "d3d3LmJldHRlcmFkc3lzdGVtLmNvbS9lU0RSZEYvenJhdmVuLm1pbi5qcw==",
                    "ZDJrazBvM2ZyN2VkMDEuY2xvdWRmcm9udC5uZXQvaXBxZEcvb1pEQ2lYL3RUZXoubWluLmNzcw==",
                    "d3d3LmlidWdydHpiLmNvbS9aZS9ycmF2ZW4ubWluLmpz",
                    "d3d3Lndrd3FwcHZib3hqZ2YuY29tL01MSFcvcy96VGV6Lm1pbi5jc3M="
                  ],
                  r = -1, v, f,
                  x = function(){
                    clearTimeout(f);
                    r++;
                    if(s[r] && !(1782381244000 < (new Date).getTime() && 1 < r)){
                      v = k.document.createElement("script");
                      v.type = "text/javascript";
                      v.async = true;
                      var p = k.document.getElementsByTagName("script")[0];
                      v.src = "https://" + atob(s[r]);
                      v.crossOrigin = "anonymous";
                      v.onerror = x;
                      v.onload = function(){
                        clearTimeout(f);
                        k[o.slice(0,16)+o.slice(0,16)] || x();
                      };
                      f = setTimeout(x, 5000);
                      p.parentNode.insertBefore(v, p);
                    }
                  };
              if(!k[o]){
                try {
                  Object.freeze(k[o] = g)
                } catch(e){}
                x()
              }
            })();
          `}
          </Script>
          <Footer />
          <ToasterProvider />
          {/* <AuthDebug/> */}
        </Providers>
      </body>
    </html>
  );
}
