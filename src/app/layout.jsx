import './globals.css';

export const metadata = {
  title: 'LeverAI Ventures',
  description: 'Your ecommerce profit intelligence dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
