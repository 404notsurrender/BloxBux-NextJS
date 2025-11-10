'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
  role: string
}

const ROBUX_PACKAGES = [
  { id: 1, amount: 400, price: 50000 },
  { id: 2, amount: 800, price: 100000 },
  { id: 3, amount: 1700, price: 200000 },
  { id: 4, amount: 4500, price: 500000 },
  { id: 5, amount: 10000, price: 1000000 },
]

export default function TopupPage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [topupMethod, setTopupMethod] = useState<'login' | 'playerid'>('login')
  const [gameUsername, setGameUsername] = useState('')
  const [gamePassword, setGamePassword] = useState('')
  const [playerId, setPlayerId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleTopup = async () => {
    if (!selectedPackage || !user) return

    // Validate inputs based on method
    if (topupMethod === 'login' && (!gameUsername || !gamePassword)) {
      alert('Username dan password game harus diisi')
      return
    }
    if (topupMethod === 'playerid' && !playerId) {
      alert('Player ID harus diisi')
      return
    }

    setSubmitting(true)
    try {
      const packageData = ROBUX_PACKAGES.find(p => p.id === selectedPackage)
      if (!packageData) return

      const discount = user.role === 'USER' ? 0.02 : 0.01 // 2% for members, 1% for guests
      const finalAmount = packageData.price * (1 - discount)
      const estimatedTime = packageData.amount <= 1700 ? '5-15 menit' : '15-30 menit'

      const response = await fetch('/api/orders', {
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
          playerId: topupMethod === 'playerid' ? playerId : null,
          estimatedTime,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Order created successfully! Order ID: ${data.order.id}\nEstimasi waktu proses: ${estimatedTime}`)
        router.push('/orders')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const discount = user.role === 'USER' ? 0.02 : 0.01

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Top Up Roblox</h1>
              <p className="text-gray-600 mt-2">
                Welcome, {user.username}! You get {discount * 100}% discount as a {user.role === 'USER' ? 'member' : 'guest'}.
              </p>
            </div>

            {/* Top-up Method Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Metode Top-up</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    topupMethod === 'login'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setTopupMethod('login')}
                >
                  <h3 className="font-semibold text-gray-900">Via Login Game</h3>
                  <p className="text-sm text-gray-600">Masukkan username dan password Roblox Anda</p>
                </div>
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    topupMethod === 'playerid'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Masukkan password Roblox"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Masukkan Player ID Roblox (angka)"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  📝 Player ID dapat ditemukan di profil Roblox Anda
                </p>
              </div>
            )}

            {/* Package Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Paket Robux</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ROBUX_PACKAGES.map((pkg) => {
                  const finalPrice = pkg.price * (1 - discount)
                  const estimatedTime = pkg.amount <= 1700 ? '5-15 menit' : '15-30 menit'
                  return (
                    <div
                      key={pkg.id}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        selectedPackage === pkg.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                      onClick={() => setSelectedPackage(pkg.id)}
                    >
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900">{pkg.amount} Robux</h3>
                        <p className="text-gray-600 mt-2">Rp {pkg.price.toLocaleString()}</p>
                        <p className="text-green-600 font-semibold mt-1">
                          Rp {finalPrice.toLocaleString()} (with discount)
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          ⏱️ Estimasi: {estimatedTime}
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
                disabled={!selectedPackage || submitting || (topupMethod === 'login' && (!gameUsername || !gamePassword)) || (topupMethod === 'playerid' && !playerId)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
