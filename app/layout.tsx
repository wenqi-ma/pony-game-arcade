import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Pony 游戏厅｜六款脑力小游戏',
  description: '六款打开就玩的轻量小游戏：打地鼠、24 点、起跑跨栏、记忆翻牌、数字追踪和颜色迷阵。',
  openGraph: {
    title: 'Pony 游戏厅',
    description: '六款脑力小游戏，打开就玩。',
    images: [{ url: '/og.jpg', width: 800, height: 420, alt: 'Pony 游戏厅：六款脑力小游戏' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pony 游戏厅',
    description: '六款脑力小游戏，打开就玩。',
    images: ['/og.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
