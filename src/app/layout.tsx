import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Nav from '@/ui/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'akari',
  description: '莞工计协报修系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='zh'>
      <body className={inter.className}>
        <header>
          <Nav />
        </header>
        <main className='pt-16'>{children}</main>
      </body>
    </html>
  );
}
