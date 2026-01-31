import type { Metadata } from "next";
import localFont from "next/font/local";
import "./portfolio.css";
import { Header } from "@/components/portfolio/Header";
import Footer from "@/components/portfolio/Footer";
import { ThemeProvider } from "@/components/portfolio/theme-provider";
import { DynamicBackground } from "@/components/portfolio/DynamicBackground";
import ClientWrapper from "@/components/portfolio/ClientWrapper";
import { ScrollToTopButton } from "@/components/portfolio/ScrollToTopButton";
import { Toaster } from "sonner";
import { BackgroundProvider } from "@/contexts/BackgroundContext";
import { GoogleAnalytics } from "@next/third-parties/google";

const spaceGrotesk = localFont({
  src: [
    {
      path: "../../public/fonts/SpaceGrotesk-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/SpaceGrotesk-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/SpaceGrotesk-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/SpaceGrotesk-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Milan's Portfolio",
  description: "Milan Madusanka is a Full-Stack Developer & DevOps Engineer specializing in React, Next.js, Laravel, and Linux systems. View the official portfolio and projects.",
  keywords: [
    "Full-Stack Developer",
    "React Developer",
    "Next.js Developer",
    "Laravel Developer",
    "DevOps Engineer",
    "RHEL Administrator",
    "Web Developer Portfolio",
    "Sri Lanka Software Engineer"
  ],
  authors: [{ name: "Milan Madusanka", url: "https://github.com/Milanz247" }],
  creator: "Milan Madusanka",
  publisher: "Milan Madusanka",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/web-app-manifest-192x192.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://milanmadusanka.me",
    title: "Milan's Portfolio | Full-Stack Developer & DevOps Engineer",
    description: "Portfolio showcasing web development projects, system administration, and DevOps work. Specializing in React, Next.js, Laravel, and Linux systems.",
    siteName: "Milan Madusanka Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Milan Madusanka - Full-Stack Developer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Milan's Portfolio | Full-Stack Developer & DevOps Engineer",
    description: "Portfolio showcasing web development projects and DevOps expertise",
    images: ["/og-image.png"],
    creator: "@milanmadusanka",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://milanmadusanka.me/#person",
        "name": "Milan Madusanka",
        "url": "https://milanmadusanka.me",
        "image": {
          "@type": "ImageObject",
          "url": "https://milanmadusanka.me/og-image.png",
          "width": 1200,
          "height": 630
        },
        "sameAs": [
          "https://github.com/Milanz247",
          "https://twitter.com/milanmadusanka"
        ],
        "jobTitle": "Full-Stack Developer & DevOps Engineer",
        "worksFor": {
          "@type": "Organization",
          "name": "Milan Madusanka"
        },
        "description": "Full-Stack Developer specializing in React, Next.js, Laravel, and DevOps with 1.5+ years experience"
      },
      {
        "@type": "WebSite",
        "@id": "https://milanmadusanka.me/#website",
        "url": "https://milanmadusanka.me",
        "name": "Milan Madusanka Portfolio",
        "description": "Portfolio of Milan Madusanka - Full-Stack Developer specializing in React, Next.js, Laravel, and DevOps",
        "publisher": {
          "@id": "https://milanmadusanka.me/#person"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "Organization",
        "@id": "https://milanmadusanka.me/#organization",
        "name": "Milan Madusanka",
        "url": "https://milanmadusanka.me",
        "logo": {
          "@type": "ImageObject",
          "url": "https://milanmadusanka.me/favicon/web-app-manifest-512x512.png"
        },
        "sameAs": [
          "https://github.com/Milanz247",
          "https://linkedin.com/in/milanmadusanka",
          "https://twitter.com/milanmadusanka"
        ]
      }
    ]
  };

  return (
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#667eea" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} antialiased font-sans`}
      >
        <ThemeProvider>
          <BackgroundProvider>
            <ClientWrapper>
              <DynamicBackground />
              <Header />
              <main className="pt-24 overflow-x-hidden w-full max-w-full">{children}</main>
              <Footer />
              <ScrollToTopButton />
              <Toaster position="top-right" richColors closeButton />
            </ClientWrapper>
          </BackgroundProvider>
        </ThemeProvider>
        <GoogleAnalytics gaId="G-G8DQZWGX4N" />
      </body>
    </html>
  );
}
