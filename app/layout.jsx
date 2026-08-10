import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Nritya Bharathanjali 2026 – Skanda | M.S. Natyakshetra',
  description: 'Official E-Ticketing Platform for M.S. Natyakshetra’s Nritya Bharathanjali 2026 – Skanda production on September 26, 2026.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Marcellus&display=swap"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
