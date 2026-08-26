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
  metadataBase: new URL('https://pony-game-arcade.ma-wenqi-paul.chatgpt.site'),
  title: 'Pony 游戏厅｜八款脑力小游戏',
  description: '八款打开就玩的轻量小游戏：打地鼠、24 点、闪电反应、记忆翻牌、数字追踪、颜色迷阵、迷宫探险和时间感应。',
  openGraph: {
    title: 'Pony 游戏厅',
    description: '八款脑力小游戏，无需登录，打开就玩。',
    images: [{ url: '/og.jpg', width: 800, height: 420, alt: 'Pony 游戏厅：八款脑力小游戏' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pony 游戏厅',
    description: '八款脑力小游戏，无需登录，打开就玩。',
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
