import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Badasspoet 95",
  description: "Welcome to Badasspoet 95 - Windows 95-style experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/react95@4.0.0/dist/fonts/ms_sans_serif.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/react95@4.0.0/dist/fonts/ms_sans_serif_bold.css"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
