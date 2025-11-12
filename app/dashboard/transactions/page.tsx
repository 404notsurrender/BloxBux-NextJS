'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Sidebar from '@/app/components/admin/Sidebar'

interface User {
  id: number
  username: string
  role: string
}

interface Order {
  id: number
  amount: number
  discount: number
  finalAmount: number
  status: string
  topupMethod?: string
  gameUsername?: string
  gamePassword?: string
  gameBackupCode?: string
  playerId?: string
  estimatedTime?: string
  createdAt: string
  user?: {
    username: string
  }
}

export default function TransactionsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          if (data.user.role !== 'ADMIN') {
            router.push('/dashboard')
            return
          }
          setUser(data.user)
          await loadOrders()
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

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status }),
      })

      if (response.ok) {
        await loadOrders()
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="flex justify-between items-center mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <div className="text-sm text-gray-600">
                  Total Orders: {orders.length}
                </div>
              </motion.div>

              <div className="overflow-x-auto">
                <motion.table
                  className="min-w-full bg-white border border-black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 border border-black text-black">ID</th>
                      <th className="px-4 py-2 border border-black text-black">User</th>
                      <th className="px-4 py-2 border border-black text-black">Amount</th>
                      <th className="px-4 py-2 border border-black text-black">Final Amount</th>
                      <th className="px-4 py-2 border border-black text-black">Method</th>
                      <th className="px-4 py-2 border border-black text-black">Game Username</th>
                      <th className="px-4 py-2 border border-black text-black">Game Password</th>
                      <th className="px-4 py-2 border border-black text-black">Game Backup Code</th>
                      <th className="px-4 py-2 border border-black text-black">Player ID</th>
                      <th className="px-4 py-2 border border-black text-black">Status</th>
                      <th className="px-4 py-2 border border-black text-black">Created</th>
                      <th className="px-4 py-2 border border-black text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        className="hover:bg-gray-50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                      >
                        <td className="px-4 py-2 border border-black text-black">{order.id}</td>
                        <td className="px-4 py-2 border border-black text-black">{order.user?.username || 'N/A'}</td>
                        <td className="px-4 py-2 border border-black text-black">{order.amount} Robux</td>
                        <td className="px-4 py-2 border border-black text-black">Rp {order.finalAmount.toLocaleString()}</td>
                        <td className="px-4 py-2 border border-black text-black">{order.topupMethod || 'N/A'}</td>
                        <td className="px-4 py-2 border border-black text-black">{order.gameUsername || 'N/A'}</td>
                        <td className="px-4 py-2 border border-black text-black">{order.gamePassword || 'N/A'}</td>
                        <td className="px-4 py-2 border border-black text-black">{order.gameBackupCode || 'N/A'}</td>
                        <td className="px-4 py-2 border border-black text-black">{order.playerId || 'N/A'}</td>
                        <td className="px-4 py-2 border border-black">
                          <span className={`px-2 py-1 rounded text-sm ${
                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            order.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-black text-black">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2 border border-black">
                          {(order.status === 'PENDING' || order.status === 'FAILED') && (
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                                className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Complete
                              </motion.button>
                              <motion.button
                                onClick={() => updateOrderStatus(order.id, 'FAILED')}
                                className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Fail
                              </motion.button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </motion.table>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
