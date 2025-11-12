'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TopupGuestPage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [topupMethod, setTopupMethod] = useState<'login' | 'playerid'>('login')
  const [gameUsername, setGameUsername] = useState('')
  const [gamePassword, setGamePassword] = useState('')
  const [gameBackupCode, setGameBackupCode] = useState('')
  const [playerId, setPlayerId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'gopay' | 'ovo' | 'dana' | 'bank'>('gopay')
  const [submitting, setSubmitting] = useState(false)
  const [robuxPackages, setRobuxPackages] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    // Fetch products from admin API
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products')
        if (response.ok) {
          const data = await response.json()
          // Convert admin products to guest package format
          const packages = data.products.map((product: any, index: number) => ({
            id: index + 1,
            amount: product.quantity, // Using quantity as amount for display
            price: product.price,
            name: product.name,
            description: product.description
          }))
          setRobuxPackages(packages)
        } else {
          // Fallback to default packages if API fails
          setRobuxPackages([
            { id: 1, amount: 80, price: 15000, name: 'Robux 80', description: '80 Robux for Roblox' },
            { id: 2, amount: 400, price: 75000, name: 'Robux 400', description: '400 Robux for Roblox' },
            { id: 3, amount: 800, price: 150000, name: 'Robux 800', description: '800 Robux for Roblox' },
          ])
        }
      } catch (error) {
        // Fallback to default packages
        setRobuxPackages([
          { id: 1, amount: 80, price: 15000, name: 'Robux 80', description: '80 Robux for Roblox' },
          { id: 2, amount: 400, price: 75000, name: 'Robux 400', description: '400 Robux for Roblox' },
          { id: 3, amount: 800, price: 150000, name: 'Robux 800', description: '800 Robux for Roblox' },
        ])
      }
    }

    fetchProducts()
  }, [])

  const handleTopup = async () => {
    if (!selectedPackage) return

    // Validate inputs based on method
    if (topupMethod === 'login' && (!gameUsername || !gamePassword || !gameBackupCode)) {
      alert('Username, password, dan Backup Code game harus diisi')
      return
    }
    if (topupMethod === 'playerid' && !playerId) {
      alert('Player ID harus diisi')
      return
    }

    setSubmitting(true)
    try {
      const packageData = robuxPackages.find(p => p.id === selectedPackage)
      if (!packageData) return

      const discount = 0.01 // 1% discount for guests
      const finalAmount = packageData.price * (1 - discount)
      const estimatedTime = packageData.amount <= 400 ? '5-15 menit' : '15-30 menit'

      const response = await fetch('/api/orders/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: packageData.amount,
          price: packageData.price,
          discount,
          finalAmount,
          topupMethod,
          gameUsername: topupMethod === 'login' ? gameUsername : null,
          gamePassword: topupMethod === 'login' ? gamePassword : null,
          gameBackupCode: topupMethod === 'login' ? gameBackupCode : null,
          playerId: topupMethod === 'playerid' ? playerId : null,
          estimatedTime,
          paymentMethod,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Order created successfully! Order ID: ${data.order.id}\nEstimasi waktu proses: ${estimatedTime}`)
        // For guest orders, we don't redirect to orders page since they don't have accounts
        alert('Please save your Order ID for reference. Contact support if needed.')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const discount = 0.01

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Top Up Roblox (Guest)</h1>
              <p className="text-gray-600 mt-2">
                Top up without registration. You get 1% discount.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                For better experience and 2% discount, please <a href="/register" className="text-indigo-600 hover:underline">register</a> or <a href="/login" className="text-indigo-600 hover:underline">login</a>.
              </p>
            </div>

            {/* Top-up Method Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Metode Top-up</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    topupMethod === 'login'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setTopupMethod('login')}
                >
                  <h3 className="font-semibold text-gray-900">Via Login Game</h3>
                  <p className="text-sm text-gray-600">Masukkan username dan password Roblox Anda</p>
                </div>
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    topupMethod === 'playerid'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setTopupMethod('playerid')}
                >
                  <h3 className="font-semibold text-gray-900">Via Player ID</h3>
                  <p className="text-sm text-gray-600">Masukkan Player ID Roblox Anda</p>
                </div>
              </div>
            </div>

            {/* Game Credentials Form */}
            {topupMethod === 'login' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Akun Game</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gameUsername" className="block text-sm font-medium text-gray-700 mb-2">
                      Username Roblox
                    </label>
                    <input
                      type="text"
                      id="gameUsername"
                      value={gameUsername}
                      onChange={(e) => setGameUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Masukkan username Roblox"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gamePassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Password Roblox
                    </label>
                    <input
                      type="password"
                      id="gamePassword"
                      value={gamePassword}
                      onChange={(e) => setGamePassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Masukkan password Roblox"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="gameBackupCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Backup Code Roblox
                    </label>
                    <input
                      type="text"
                      id="gameBackupCode"
                      value={gameBackupCode}
                      onChange={(e) => setGameBackupCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Masukkan Backup Code Roblox"
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  ⚠️ Data akun game Anda akan disimpan dengan aman dan hanya digunakan untuk proses top-up
                </p>
              </div>
            )}

            {topupMethod === 'playerid' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Player</h2>
                <div>
                  <label htmlFor="playerId" className="block text-sm font-medium text-gray-700 mb-2">
                    Player ID Roblox
                  </label>
                  <input
                    type="text"
                    id="playerId"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Masukkan Player ID Roblox (angka)"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  📝 Player ID dapat ditemukan di profil Roblox Anda
                </p>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Metode Pembayaran</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'gopay', name: 'GoPay', icon: '💚' },
                  { id: 'ovo', name: 'OVO', icon: '🟣' },
                  { id: 'dana', name: 'DANA', icon: '🔵' },
                  { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setPaymentMethod(method.id as any)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{method.icon}</div>
                      <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Package Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Paket Robux</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {robuxPackages.map((pkg) => {
                  const finalPrice = pkg.price * (1 - discount)
                  return (
                    <div
                      key={pkg.id}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        selectedPackage === pkg.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      onClick={() => setSelectedPackage(pkg.id)}
                    >
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                        <p className="text-gray-600 mt-2">Rp {pkg.price.toLocaleString()}</p>
                        <p className="text-green-600 font-semibold mt-1">
                          Rp {finalPrice.toLocaleString()} (with 1% discount)
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleTopup}
                disabled={!selectedPackage || submitting || (topupMethod === 'login' && (!gameUsername || !gamePassword || !gameBackupCode)) || (topupMethod === 'playerid' && !playerId)}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Top Up Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
