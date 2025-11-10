'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ROBUX_PACKAGES = [
  { id: 1, amount: 400, price: 50000 },
  { id: 2, amount: 800, price: 100000 },
  { id: 3, amount: 1700, price: 200000 },
  { id: 4, amount: 4500, price: 500000 },
  { id: 5, amount: 10000, price: 1000000 },
]

export default function TopupGuestPage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const handleTopup = async () => {
    if (!selectedPackage) return

    setSubmitting(true)
    try {
      const packageData = ROBUX_PACKAGES.find(p => p.id === selectedPackage)
      if (!packageData) return

      const discount = 0.01 // 1% discount for guests
      const finalAmount = packageData.price * (1 - discount)

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
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Order created successfully! Order ID: ${data.order.id}`)
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {ROBUX_PACKAGES.map((pkg) => {
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
                      <h3 className="text-xl font-semibold text-gray-900">{pkg.amount} Robux</h3>
                      <p className="text-gray-600 mt-2">Rp {pkg.price.toLocaleString()}</p>
                      <p className="text-green-600 font-semibold mt-1">
                        Rp {finalPrice.toLocaleString()} (with 1% discount)
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-center">
              <button
                onClick={handleTopup}
                disabled={!selectedPackage || submitting}
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
