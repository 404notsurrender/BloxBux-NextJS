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

interface LogEntry {
  id: string
  timestamp: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  message: string
  user?: string
  action?: string
  ip?: string
}

export default function LogsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
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
          await loadLogs()
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

  const loadLogs = async () => {
    try {
      // Generate sample logs for demonstration
      const sampleLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          level: 'SUCCESS',
          message: 'Order #1234 status updated to COMPLETED',
          user: 'admin',
          action: 'UPDATE_ORDER_STATUS',
          ip: '192.168.1.100'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          level: 'INFO',
          message: 'User john_doe registered successfully',
          user: 'system',
          action: 'USER_REGISTRATION',
          ip: '192.168.1.101'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          level: 'WARNING',
          message: 'Failed login attempt for user admin',
          user: 'admin',
          action: 'FAILED_LOGIN',
          ip: '192.168.1.102'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          level: 'ERROR',
          message: 'Telegram notification failed to send',
          user: 'system',
          action: 'TELEGRAM_ERROR',
          ip: '127.0.0.1'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          level: 'SUCCESS',
          message: 'Payment processed for order #1233',
          user: 'system',
          action: 'PAYMENT_SUCCESS',
          ip: '192.168.1.103'
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          level: 'INFO',
          message: 'System maintenance completed',
          user: 'admin',
          action: 'MAINTENANCE',
          ip: '127.0.0.1'
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          level: 'WARNING',
          message: 'High memory usage detected',
          user: 'system',
          action: 'SYSTEM_WARNING',
          ip: '127.0.0.1'
        },
        {
          id: '8',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          level: 'SUCCESS',
          message: 'Database backup completed successfully',
          user: 'system',
          action: 'BACKUP_SUCCESS',
          ip: '127.0.0.1'
        }
      ]

      setLogs(sampleLogs)
    } catch (error) {
      console.error('Error loading logs:', error)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'ALL' || log.level === filter
    const matchesSearch = searchTerm === '' ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesFilter && matchesSearch
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600 bg-red-100'
      case 'WARNING': return 'text-yellow-600 bg-yellow-100'
      case 'SUCCESS': return 'text-green-600 bg-green-100'
      case 'INFO': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      setLogs([])
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
                <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
                <div className="flex gap-4">
                  <motion.button
                    onClick={clearLogs}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear Logs
                  </motion.button>
                  <motion.button
                    onClick={loadLogs}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Refresh
                  </motion.button>
                </div>
              </motion.div>

              {/* Filters */}
              <motion.div
                className="flex flex-col md:flex-row gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  {(['ALL', 'INFO', 'WARNING', 'ERROR', 'SUCCESS'] as const).map((level) => (
                    <motion.button
                      key={level}
                      onClick={() => setFilter(level)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition duration-300 ${
                        filter === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {level}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <motion.table
                  className="min-w-full bg-white border border-black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 border border-black text-black">Time</th>
                      <th className="px-4 py-2 border border-black text-black">Level</th>
                      <th className="px-4 py-2 border border-black text-black">Message</th>
                      <th className="px-4 py-2 border border-black text-black">User</th>
                      <th className="px-4 py-2 border border-black text-black">Action</th>
                      <th className="px-4 py-2 border border-black text-black">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        className="hover:bg-gray-50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                      >
                        <td className="px-4 py-2 border border-black text-black text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 border border-black">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-black text-black">{log.message}</td>
                        <td className="px-4 py-2 border border-black text-black">{log.user || 'N/A'}</td>
                        <td className="px-4 py-2 border border-black text-black">{log.action || 'N/A'}</td>
                        <td className="px-4 py-2 border border-black text-black text-sm">{log.ip || 'N/A'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </motion.table>
              </div>

              {filteredLogs.length === 0 && (
                <motion.div
                  className="text-center py-8 text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  No logs found matching your criteria.
                </motion.div>
              )}

              <motion.div
                className="mt-4 text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Showing {filteredLogs.length} of {logs.length} log entries
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
