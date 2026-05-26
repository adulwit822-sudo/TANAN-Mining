import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TANAN Mining | บริษัท ธนธรณินทร์ จำกัด',
  description: 'Mining Operations Dashboard — Integrated Mining Management System',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
