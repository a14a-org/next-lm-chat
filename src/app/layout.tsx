import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ParticleBackground from '../components/ParticleBackground';
import { ThemeProvider } from '../context/ThemeContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next LM Chat - AI Conversations Made Simple',
  description: 'A beautiful, modern chat interface for AI conversations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ThemeProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-[var(--background-start)] to-[var(--background-end)]`}
          style={{
            background:
              'linear-gradient(135deg, var(--background-start) 0%, var(--background-end) 100%)',
          }}
        >
          <ParticleBackground />
          <div className="max-w-4xl mx-auto min-h-screen flex flex-col relative z-10">
            {children}
          </div>
        </body>
      </ThemeProvider>
    </html>
  );
}
