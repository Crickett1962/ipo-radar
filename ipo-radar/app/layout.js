import './globals.css';

export const metadata = {
  title: 'IPO Radar — U.S. IPO Tracker',
  description: 'Track upcoming U.S. IPOs and get notified 7 days in advance.',
  manifest: '/manifest.json',
  themeColor: '#0A0E17',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
