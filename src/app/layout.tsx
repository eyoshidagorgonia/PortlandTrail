import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Cinzel_Decorative, EB_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontBody = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Cinzel_Decorative({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'The Portland Trail',
  description: 'A hipster journey of survival and irony.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", fontBody.variable, fontHeadline.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
