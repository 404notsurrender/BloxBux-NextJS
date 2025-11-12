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

interface AdminUser {
  id: number
  username: string
  role: string
  createdAt: string
  _count: {
    orders: number
  }
}

export default function UsersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [users, setUsers] = useState<AdminUser[]>([])
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
          await loadUsers()
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

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error loading users:', error)
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
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <div className="text-sm text-gray-600">
                  Total Users: {users.length}
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
                      <th className="px-4 py-2 border border-black text-black">Username</th>
                      <th className="px-4 py-2 border border-black text-black">Role</th>
                      <th className="px-4 py-2 border border-black text-black">Orders</th>
                      <th className="px-4 py-2 border border-black text-black">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((adminUser, index) => (
                      <motion.tr
                        key={adminUser.id}
                        className="hover:bg-gray-50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                      >
                        <td className="px-4 py-2 border border-black text-black">{adminUser.id}</td>
                        <td className="px-4 py-2 border border-black text-black">{adminUser.username}</td>
                        <td className="px-4 py-2 border border-black">
                          <span className={`px-2 py-1 rounded text-sm ${
                            adminUser.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-black'
                          }`}>
                            {adminUser.role}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-black text-black">{adminUser._count.orders}</td>
                        <td className="px-4 py-2 border border-black text-black">{new Date(adminUser.createdAt).toLocaleDateString()}</td>
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
