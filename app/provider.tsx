"use client";

import { ThemeProvider } from "next-themes";
// import { QueryClientProvider } from '@tanstack/react-query'
// import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
