import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '커플 드라이브 🌸',
  description: '우리 둘만의 소중한 사진 보관소',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '커플 드라이브',
  },
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
