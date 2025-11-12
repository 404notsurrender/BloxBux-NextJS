'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Product {
  id: number
  name: string
  price: number
  quantity: number
  description: string
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products')
        if (response.ok) {
          const data = await response.json()
          // Show first 3 products as featured
          setFeaturedProducts(data.products.slice(0, 3))
        } else {
          // Fallback products
          setFeaturedProducts([
            { id: 1, name: 'Robux 80', price: 15000, quantity: 100, description: '80 Robux for Roblox' },
            { id: 2, name: 'Robux 400', price: 75000, quantity: 50, description: '400 Robux for Roblox' },
            { id: 3, name: 'Robux 800', price: 150000, quantity: 25, description: '800 Robux for Roblox' },
          ])
        }
      } catch (error) {
        // Fallback products
        setFeaturedProducts([
          { id: 1, name: 'Robux 80', price: 15000, quantity: 100, description: '80 Robux for Roblox' },
          { id: 2, name: 'Robux 400', price: 75000, quantity: 50, description: '400 Robux for Roblox' },
          { id: 3, name: 'Robux 800', price: 150000, quantity: 25, description: '800 Robux for Roblox' },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            MDZ BloxBux
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Website Topup Roblox Terpercaya
          </motion.p>
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.a
              href="/products"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-300 mr-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Produk
            </motion.a>
            <motion.a
              href="/login"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 mr-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login Member
            </motion.a>
            <motion.a
              href="/topup-guest"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Topup Tanpa Login (1% Diskon)
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mengapa Memilih MDZ BloxBux?</h2>
          <p className="text-gray-600 dark:text-gray-300">Kami menyediakan layanan topup Roblox terbaik dengan berbagai keunggulan</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <motion.div
            className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Proses Cepat</h3>
            <p className="text-gray-600 dark:text-gray-300">Topup Robux Anda diproses dalam waktu 5-30 menit</p>
          </motion.div>

          <motion.div
            className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aman & Terpercaya</h3>
            <p className="text-gray-600 dark:text-gray-300">Data Anda aman dengan enkripsi tingkat tinggi</p>
          </motion.div>

          <motion.div
            className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Harga Terbaik</h3>
            <p className="text-gray-600 dark:text-gray-300">Diskon hingga 2% untuk member terdaftar</p>
          </motion.div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="container mx-auto px-4 py-16 bg-white dark:bg-gray-800">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Paket Robux Terpopuler</h2>
          <p className="text-gray-600 dark:text-gray-300">Pilih paket Robux favorit Anda</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-lg shadow-lg text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{product.description}</p>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                  Rp {product.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Stok: {product.quantity > 50 ? 'Tersedia' : product.quantity > 20 ? 'Terbatas' : 'Hampir Habis'}
                </div>
                <motion.a
                  href="/topup-guest"
                  className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Beli Sekarang
                </motion.a>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="/products"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Lihat Semua Produk
          </motion.a>
        </motion.div>
      </div>

      {/* Call to Action Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-12 text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Siap Topup Robux Anda?</h2>
          <p className="text-xl mb-8 opacity-90">Bergabunglah dengan ribuan pemain yang telah mempercayai MDZ BloxBux</p>
          <div className="space-x-4">
            <motion.a
              href="/register"
              className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Daftar Sekarang
            </motion.a>
            <motion.a
              href="/topup-guest"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Topup Tanpa Login
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
