import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Our Couple Drive',
  description: 'Two of us, infinite memories',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
