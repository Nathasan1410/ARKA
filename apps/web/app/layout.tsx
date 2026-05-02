import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ARKA - Immutable Auditing',
  description: 'Cryptographically anchored operational evidence and triage.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans antialiased text-neu-foreground bg-neu-bg">{children}</body>
    </html>
  );
}
