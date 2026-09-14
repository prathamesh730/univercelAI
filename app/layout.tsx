import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Agent — Universal Agentic Interface',
  description:
    'Universal AI Agent Interface for autonomous task analysis, dynamic tool execution, and high-fidelity structured synthesis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${jakarta.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="bg-[#0B0F17] text-on-surface font-sans antialiased h-full overflow-hidden flex flex-col selection:bg-primary-container/30 selection:text-primary">
        {/* Atmospheric Glow Overlays */}
        <div className="fixed top-0 left-1/4 w-[650px] h-[300px] bg-[#8083ff]/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="fixed bottom-0 right-1/4 w-[550px] h-[320px] bg-[#00a6e0]/10 blur-[150px] pointer-events-none rounded-full" />
        {children}
      </body>
    </html>
  );
}
