'use client'

import { motion } from 'framer-motion'

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Banner */}
        <motion.div
          className="text-center mb-16"
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
            MDZ BloxBux Products
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Layanan Top-up Roblox Terpercaya dengan Harga Terjangkau
          </motion.p>
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '⚡', title: 'Instant Delivery', desc: 'Robux langsung masuk ke akun Anda dalam hitungan menit' },
                { icon: '🛡️', title: '100% Secure', desc: 'Transaksi aman dengan sistem enkripsi tingkat tinggi' },
                { icon: '💰', title: 'Best Price', desc: 'Harga kompetitif dengan diskon khusus member' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <motion.div
                    className="text-4xl mb-2"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Product Packages */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <motion.h2
            className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            Paket Robux Terpopuler
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { amount: 400, price: 50000, popular: false },
              { amount: 800, price: 100000, popular: true },
              { amount: 1700, price: 200000, popular: false },
              { amount: 4500, price: 500000, popular: false },
              { amount: 10000, price: 1000000, popular: false },
            ].map((pkg, index) => (
              <motion.div
                key={pkg.amount}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative transition-colors duration-300 ${
                  pkg.popular ? 'ring-2 ring-indigo-500' : ''
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {pkg.popular && (
                  <motion.div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 1.6 + index * 0.1 }}
                  >
                    <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Terpopuler
                    </span>
                  </motion.div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {pkg.amount.toLocaleString()} Robux
                  </h3>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                    Rp {pkg.price.toLocaleString()}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Bonus: {Math.floor(pkg.amount * 0.1)} Robux Gratis
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>• Instant delivery</p>
                    <p>• 24/7 support</p>
                    <p>• Refund guarantee</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.0 }}
        >
          <motion.h2
            className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.2 }}
          >
            Mengapa Memilih MDZ BloxBux?
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { icon: '🎯', title: 'Akurasi Tinggi', desc: 'Sistem otomatis kami memastikan Robux masuk dengan akurat sesuai pesanan. Tidak ada kesalahan dalam proses top-up.' },
              { icon: '🚀', title: 'Proses Cepat', desc: 'Rata-rata proses top-up selesai dalam 5-15 menit. Beberapa pesanan bahkan selesai dalam hitungan detik.' },
              { icon: '💳', title: 'Pembayaran Mudah', desc: 'Berbagai metode pembayaran tersedia: transfer bank, e-wallet, dan payment gateway terpercaya.' },
              { icon: '📞', title: 'Support 24/7', desc: 'Tim support kami siap membantu Anda 24 jam sehari, 7 hari seminggu melalui chat, email, dan WhatsApp.' }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-colors duration-300`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 2.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {item.icon} {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.8 }}
        >
          <motion.div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto transition-colors duration-300`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 3.0 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Siap Top-up Sekarang?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Daftar member untuk mendapatkan diskon 2% dan akses ke fitur premium lainnya.
            </p>
            <div className="space-y-4">
              <motion.a
                href="/register"
                className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 mr-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Daftar Member (2% Diskon)
              </motion.a>
              <motion.a
                href="/topup-guest"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Top-up Tanpa Login (1% Diskon)
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
