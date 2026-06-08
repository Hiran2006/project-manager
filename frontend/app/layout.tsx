import type { Metadata } from "next"
import { Anybody } from "next/font/google"
import "./globals.css"
import { StoreProvider } from "../store/provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
