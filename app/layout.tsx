import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Toast } from "@heroui/react";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flashcard Input",
  description: "Nhập liệu flashcard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toast.Provider />
        {children}
      </body>
    </html>
  );
}
