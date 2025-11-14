import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MDZ BloxBux",
  description: "Website topup Roblox termurah dan terpercaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        <ThemeProvider>
          <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                <a href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  MDZ BloxBux
                </a>
                <div className="flex items-center space-x-6">
                  <a href="/products" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition duration-300">
                    Produk
                  </a>
                  <a href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition duration-300">
                    Syarat & Ketentuan
                  </a>
                  <a href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition duration-300">
                    Login
                  </a>
                </div>
              </div>
            </div>
          </nav>
          {children}
          <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8 transition-colors duration-300">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">MDZ BloxBux</h3>
                  <p className="text-gray-300 dark:text-gray-400">
                    Website topup Roblox terpercaya dengan harga terbaik dan pelayanan 24/7.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Layanan</h3>
                  <ul className="space-y-2 text-gray-300 dark:text-gray-400">
                    <li><a href="/products" className="hover:text-white dark:hover:text-gray-200 transition duration-300">Produk</a></li>
                    <li><a href="/topup" className="hover:text-white dark:hover:text-gray-200 transition duration-300">Top Up</a></li>
                    <li><a href="/orders" className="hover:text-white dark:hover:text-gray-200 transition duration-300">Riwayat Order</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bantuan</h3>
                  <ul className="space-y-2 text-gray-300 dark:text-gray-400">
                    <li><a href="/terms" className="hover:text-white dark:hover:text-gray-200 transition duration-300">Syarat & Ketentuan</a></li>
                    <li><a href="mailto:support@mdzbloxbux.com" className="hover:text-white dark:hover:text-gray-200 transition duration-300">Kontak Support</a></li>
                    <li><a href="https://wa.me/6281234567890" className="hover:text-white dark:hover:text-gray-200 transition duration-300">WhatsApp</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-700 dark:border-gray-600 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
                <p>&copy; 2024 MDZ BloxBux. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
