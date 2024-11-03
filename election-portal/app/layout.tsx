import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { SharedStateProvider } from './sharedContext';
import './globals.css';
import { AppProviders } from '@/AppProviders';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
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
          href="https://use.typekit.net/dze2nzm.css  "
        ></link>
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
