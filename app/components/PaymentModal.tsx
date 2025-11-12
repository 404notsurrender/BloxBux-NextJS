'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: number
  amount: number
  onPaymentSuccess: () => void
}

export default function PaymentModal({ isOpen, onClose, orderId, amount, onPaymentSuccess }: PaymentModalProps) {
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string>('')

  const paymentMethods = [
    { id: 'gopay', name: 'GoPay', icon: '💚' },
    { id: 'dana', name: 'DANA', icon: '🔵' },
    { id: 'ovo', name: 'OVO', icon: '🟣' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
  ]

  const handlePayment = async () => {
    if (!selectedPayment) {
      alert('Please select a payment method')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          paymentMethod: selectedPayment
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentUrl(data.payment.redirect_url)

        // Open payment URL in new window
        window.open(data.payment.redirect_url, '_blank')

        // Start polling for payment status
        pollPaymentStatus(orderId)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to process payment')
    } finally {
      setLoading(false)
    }
  }

  const pollPaymentStatus = (orderId: number) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payment/status?orderId=${orderId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.order.paymentStatus === 'SUCCESS') {
            onPaymentSuccess()
            onClose()
            alert('Payment successful! Your order is being processed.')
            return
          } else if (data.order.paymentStatus === 'FAILED') {
            alert('Payment failed. Please try again.')
            return
          }
        }
      } catch (error) {
        console.error('Status check error:', error)
      }

      // Continue polling every 5 seconds
      setTimeout(checkStatus, 5000)
    }

    checkStatus()
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Complete Your Payment</h3>

        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-semibold text-gray-900">#{orderId}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">Rp {amount.toLocaleString()}</p>
          </div>
        </div>

        {!paymentUrl ? (
          <>
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Select Payment Method</h4>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPayment === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{method.icon}</span>
                      <span className="font-medium text-gray-900">{method.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                onClick={handlePayment}
                disabled={loading || !selectedPayment}
                className={`flex-1 px-4 py-3 rounded-lg text-white font-medium ${
                  loading || !selectedPayment ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } transition duration-300`}
                whileHover={{ scale: loading || !selectedPayment ? 1 : 1.02 }}
                whileTap={{ scale: loading || !selectedPayment ? 1 : 0.98 }}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </motion.button>
              <motion.button
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-green-600 text-4xl mb-4">✅</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Link Generated!</h4>
            <p className="text-gray-600 mb-6">
              A new window has opened with your payment link. Complete the payment there.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-yellow-800">
                💡 <strong>Don't close this window!</strong> We're monitoring your payment status.
                You'll be notified once the payment is confirmed.
              </p>
            </div>
            <motion.button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
