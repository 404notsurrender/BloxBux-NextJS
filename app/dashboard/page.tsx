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

interface AdminUser {
  id: number
  username: string
  role: string
  createdAt: string
  _count: {
    orders: number
  }
}

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  pendingPayments: number
  verifiedOrders: number
  todayRevenue: number
  activeUsers: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [adminOrders, setAdminOrders] = useState<Order[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingPayments: 0,
    verifiedOrders: 0,
    todayRevenue: 0,
    activeUsers: 0
  })
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)

          // Load admin data if user is admin
          if (data.user.role === 'ADMIN') {
            await loadAdminData()
            await checkApiStatus()
          }
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

  const checkApiStatus = async () => {
    try {
      setApiStatus('checking')
      const response = await fetch('/api/health')
      if (response.ok) {
        setApiStatus('connected')
      } else {
        setApiStatus('disconnected')
      }
    } catch (error) {
      setApiStatus('disconnected')
    }
  }

  const loadAdminData = async () => {
    try {
      // Load all orders
      const ordersResponse = await fetch('/api/admin/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setAdminOrders(ordersData.orders)

        // Calculate enhanced stats
        const totalOrders = ordersData.orders.length
        const totalRevenue = ordersData.orders.reduce((sum: number, order: Order) => sum + order.finalAmount, 0)
        const pendingPayments = ordersData.orders.filter((order: Order) => order.status === 'PENDING' || order.status === 'FAILED').length
        const verifiedOrders = ordersData.orders.filter((order: Order) => order.status === 'COMPLETED').length

        // Calculate today's revenue
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayRevenue = ordersData.orders
          .filter((order: Order) => {
            const orderDate = new Date(order.createdAt)
            orderDate.setHours(0, 0, 0, 0)
            return orderDate.getTime() === today.getTime() && order.status === 'COMPLETED'
          })
          .reduce((sum: number, order: Order) => sum + order.finalAmount, 0)

        setStats(prev => ({
          ...prev,
          totalOrders,
          totalRevenue,
          pendingPayments,
          verifiedOrders,
          todayRevenue
        }))
      }

      // Load all users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setAdminUsers(usersData.users)
        setStats(prev => ({ ...prev, totalUsers: usersData.users.length }))
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
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
        // Reload admin data to reflect changes
        await loadAdminData()
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
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {user.role === 'ADMIN' ? (
        <div className="flex h-screen">
          <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-6xl mx-auto">
                <motion.div
                  className="bg-white rounded-lg shadow-lg p-8 mb-8"
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
                    <h1 className="text-3xl font-bold text-gray-900">
                      Welcome to MDZ BloxBux, {user.username}!
                      {user.role === 'ADMIN' && <span className="text-sm text-blue-600 ml-2">(Admin)</span>}
                    </h1>
                    <motion.button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Logout
                    </motion.button>
                  </motion.div>

                  {/* Admin Statistics */}
                  {user.role === 'ADMIN' && (
                    <motion.div
                      className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <motion.div
                        className="bg-blue-50 p-6 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <h3 className="text-lg font-semibold text-blue-900">Total Orders</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
                      </motion.div>
                      <motion.div
                        className="bg-green-50 p-6 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <h3 className="text-lg font-semibold text-green-900">Total Revenue</h3>
                        <p className="text-3xl font-bold text-green-600">Rp {stats.totalRevenue.toLocaleString()}</p>
                      </motion.div>
                      <motion.div
                        className="bg-purple-50 p-6 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <h3 className="text-lg font-semibold text-purple-900">Total Users</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
                      </motion.div>
                      <motion.div
                        className="bg-yellow-50 p-6 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <h3 className="text-lg font-semibold text-yellow-900">Pending Payments</h3>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                      </motion.div>
                      <motion.div
                        className="bg-indigo-50 p-6 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <h3 className="text-lg font-semibold text-indigo-900">Verified Orders</h3>
                        <p className="text-3xl font-bold text-indigo-600">{stats.verifiedOrders}</p>
                      </motion.div>
                      <motion.div
                        className="bg-orange-50 p-6 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <h3 className="text-sm font-semibold text-orange-900">Today's Revenue</h3>
                        <p className="text-2xl font-bold text-orange-600">Rp {stats.todayRevenue.toLocaleString()}</p>
                      </motion.div>
                      <motion.div
                        className={`p-6 rounded-lg ${apiStatus === 'connected' ? 'bg-green-50' : apiStatus === 'disconnected' ? 'bg-red-50' : 'bg-yellow-50'}`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <h3 className={`text-lg font-semibold ${apiStatus === 'connected' ? 'text-green-900' : apiStatus === 'disconnected' ? 'text-red-900' : 'text-yellow-900'}`}>API Status</h3>
                        <p className={`text-3xl font-bold ${apiStatus === 'connected' ? 'text-green-600' : apiStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {apiStatus === 'connected' ? 'Connected' : apiStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
                        </p>
                        <motion.button
                          onClick={checkApiStatus}
                          className="mt-2 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Refresh
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8 mb-8"
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
                <h1 className="text-3xl font-bold text-gray-900">Welcome to MDZ BloxBux, {user.username}!</h1>
                <motion.button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 gap-6"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div
                  className="bg-blue-50 p-6 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h2 className="text-xl font-semibold text-blue-900 mb-4">Top Up Roblox</h2>
                  <p className="text-blue-700 mb-4">Top up your Roblox account with Robux</p>
                  <motion.button
                    onClick={() => router.push('/topup')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Top Up
                  </motion.button>
                </motion.div>

                <motion.div
                  className="bg-green-50 p-6 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h2 className="text-xl font-semibold text-green-900 mb-4">Order History</h2>
                  <p className="text-green-700 mb-4">View your previous top-up orders</p>
                  <motion.button
                    onClick={() => router.push('/orders')}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Orders
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
