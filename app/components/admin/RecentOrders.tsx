'use client'

import { motion } from 'framer-motion'
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Order {
  id: number
  amount: number
  discount: number
  finalAmount: number
  status: string
  topupMethod?: string
  estimatedTime?: string
  createdAt: string
  user?: {
    username: string
  }
}

interface RecentOrdersProps {
  orders: Order[]
  onViewOrder: (orderId: number) => void
  onUpdateStatus: (orderId: number, status: string) => void
}

export default function RecentOrders({ orders, onViewOrder, onUpdateStatus }: RecentOrdersProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <span className="text-sm text-gray-500">Last 10 orders</span>
      </div>

      <div className="space-y-3">
        {orders.slice(0, 10).map((order, index) => (
          <motion.div
            key={order.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getStatusIcon(order.status)}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Order #{order.id}
                </div>
                <div className="text-sm text-gray-600">
                  {order.user?.username || 'N/A'} • {order.amount} Robux
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  Rp {order.finalAmount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-1">
                <motion.button
                  onClick={() => onViewOrder(order.id)}
                  className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="View Order"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>

                {order.status === 'PENDING' && (
                  <>
                    <motion.button
                      onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                      className="p-1 text-green-600 hover:text-green-700 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Mark as Completed"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => onUpdateStatus(order.id, 'FAILED')}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Mark as Failed"
                    >
                      <XCircle className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No recent orders found
          </div>
        )}
      </div>

      {orders.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Orders →
          </button>
        </div>
      )}
    </motion.div>
  )
}
