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

interface ProfileData {
  username: string
  email: string
  role: string
  createdAt: string
  lastLogin: string
  totalOrders: number
  totalSpent: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ username: '', email: '' })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          await loadProfile(data.user)
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

  const loadProfile = async (userData: User) => {
    try {
      // Load user orders for statistics
      const ordersResponse = await fetch('/api/orders')
      let totalOrders = 0
      let totalSpent = 0

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        totalOrders = ordersData.orders.length
        totalSpent = ordersData.orders.reduce((sum: number, order: any) => sum + order.finalAmount, 0)
      }

      const profileData: ProfileData = {
        username: userData.username,
        email: `${userData.username}@mdzblox.com`, // Mock email
        role: userData.role,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // Mock created date
        lastLogin: new Date().toISOString(),
        totalOrders,
        totalSpent
      }

      setProfile(profileData)
      setFormData({
        username: profileData.username,
        email: profileData.email
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSave = async () => {
    try {
      // In a real app, this would update the user profile via API
      if (profile) {
        setProfile({
          ...profile,
          username: formData.username,
          email: formData.email
        })
      }
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username,
        email: profile.email
      })
    }
    setEditing(false)
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!')
      return
    }

    setChangingPassword(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordForm),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Password changed successfully!')
        setShowPasswordModal(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        alert(data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Password change error:', error)
      alert('Failed to change password')
    } finally {
      setChangingPassword(false)
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

  if (!user || !profile) {
    return null
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="flex justify-between items-center mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
                {!editing && (
                  <motion.button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Edit Profile
                  </motion.button>
                )}
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Profile Information */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profile.username}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        {editing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profile.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          <span className={`px-2 py-1 rounded text-sm ${
                            profile.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {profile.role}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Member Since
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Login
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {new Date(profile.lastLogin).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {editing && (
                    <motion.div
                      className="flex gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Save Changes
                      </motion.button>
                      <motion.button
                        onClick={handleCancel}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>

                {/* Statistics */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Statistics</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        className="bg-blue-50 p-4 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <h3 className="text-lg font-semibold text-blue-900">Total Orders</h3>
                        <p className="text-2xl font-bold text-blue-600">{profile.totalOrders}</p>
                      </motion.div>
                      <motion.div
                        className="bg-green-50 p-4 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <h3 className="text-lg font-semibold text-green-900">Total Spent</h3>
                        <p className="text-2xl font-bold text-green-600">Rp {profile.totalSpent.toLocaleString()}</p>
                      </motion.div>
                    </div>
                  </div>

                  {/* Account Security */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Security</h2>
                    <div className="space-y-4">
                      <motion.button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Change Password
                      </motion.button>
                      <motion.button
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Enable 2FA
                      </motion.button>
                      <motion.button
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View Login History
                      </motion.button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                      <motion.button
                        onClick={() => router.push('/dashboard/transactions')}
                        className="w-full text-left bg-gray-50 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition duration-300"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        View My Orders
                      </motion.button>
                      <motion.button
                        onClick={() => router.push('/dashboard/settings')}
                        className="w-full text-left bg-gray-50 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition duration-300"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        System Settings
                      </motion.button>
                      <motion.button
                        onClick={() => router.push('/dashboard/logs')}
                        className="w-full text-left bg-gray-50 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition duration-300"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        View System Logs
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Password Change Modal */}
              {showPasswordModal && (
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <motion.button
                        onClick={handlePasswordChange}
                        disabled={changingPassword}
                        className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
                          changingPassword ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        } transition duration-300`}
                        whileHover={{ scale: changingPassword ? 1 : 1.02 }}
                        whileTap={{ scale: changingPassword ? 1 : 0.98 }}
                      >
                        {changingPassword ? 'Changing...' : 'Change Password'}
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setShowPasswordModal(false)
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                        }}
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
