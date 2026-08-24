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
  title: 'Pony 游戏厅｜七款脑力小游戏',
  description: '七款打开就玩的轻量小游戏：打地鼠、24 点、起跑反应、记忆翻牌、数字追踪、颜色迷阵和节拍跳跳。',
  openGraph: {
    title: 'Pony 游戏厅',
    description: '七款脑力小游戏，打开就玩。',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Pony 游戏厅：七款脑力小游戏' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pony 游戏厅',
    description: '七款脑力小游戏，打开就玩。',
    images: ['/og.png'],
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
