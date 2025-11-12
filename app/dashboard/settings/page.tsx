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

interface Settings {
  telegramBotToken: string
  telegramChatId: string
  emailNotifications: boolean
  whatsappNotifications: boolean
  maintenanceMode: boolean
  discountPercentage: number
  processingTime: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    telegramBotToken: '',
    telegramChatId: '',
    emailNotifications: false,
    whatsappNotifications: false,
    maintenanceMode: false,
    discountPercentage: 2,
    processingTime: '5-15 minutes'
  })
  const [saving, setSaving] = useState(false)
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
          await loadSettings()
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

  const loadSettings = async () => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll use local storage or default values
      const savedSettings = localStorage.getItem('adminSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // In a real app, this would save to a database via API
      localStorage.setItem('adminSettings', JSON.stringify(settings))
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Settings, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
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
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <motion.button
                  onClick={saveSettings}
                  disabled={saving}
                  className={`px-6 py-2 rounded-md text-white font-medium ${
                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } transition duration-300`}
                  whileHover={{ scale: saving ? 1 : 1.05 }}
                  whileTap={{ scale: saving ? 1 : 0.95 }}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </motion.button>
              </motion.div>

              <div className="space-y-8">
                {/* Telegram Bot Settings */}
                <motion.div
                  className="bg-gray-50 p-6 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Telegram Bot Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
