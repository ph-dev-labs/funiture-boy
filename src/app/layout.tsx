import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import Script from 'next/script';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Trendy Trades | Institutional Crypto Trading Desk',
  description:
    'Experience institutional-grade cryptocurrency trading, advanced copy trading, and high-yield staking with Trendy Trades. Join a secure, global ecosystem built for elite investors.',
  keywords: 'crypto trading, staking, copy trading, bitcoin, institutional',
  openGraph: {
    title: 'Trendy Trades | Institutional Crypto Trading Desk',
    description: 'Secure, fast, and built for elite investors.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans antialiased">
        <ReactQueryProvider>
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1a1b26',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontFamily: 'Outfit, sans-serif',
                },
                success: {
                  iconTheme: { primary: '#00e676', secondary: '#0a0b10' },
                },
                error: {
                  iconTheme: { primary: '#ff1744', secondary: '#0a0b10' },
                },
              }}
            />
            {children}
            
            {/* Smartsupp Live Chat script */}
            <Script id="smartsupp-widget" strategy="afterInteractive" dangerouslySetInnerHTML={{
              __html: `
                var _smartsupp = _smartsupp || {};
                _smartsupp.key = '8f554cd2eeddd6b3af57edeb43f6121744a56f2b';
                window.smartsupp||(function(d) {
                  var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
                  s=d.getElementsByTagName('script')[0];c=d.createElement('script');
                  c.type='text/javascript';c.charset='utf-8';c.async=true;
                  c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
                })(document);
              `
            }} />
            <noscript>Powered by <a href="https://www.smartsupp.com" target="_blank" rel="noopener noreferrer">Smartsupp</a></noscript>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
