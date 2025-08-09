
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Uncial_Antiqua, Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ToastProvider } from '@/hooks/use-toast.tsx';

const fontBody = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '700'],
});

const fontHeadline = Uncial_Antiqua({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400'],
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
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
