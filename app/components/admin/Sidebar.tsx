'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  CreditCard,
  Package,
  Users,
  Settings,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const menuItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    description: 'Overview & Statistics'
  },
  {
    name: 'Transactions',
    icon: CreditCard,
    path: '/dashboard/transactions',
    description: 'Order Management'
  },
  {
    name: 'Products',
    icon: Package,
    path: '/dashboard/products',
    description: 'Game Management'
  },
  {
    name: 'Users',
    icon: Users,
    path: '/dashboard/users',
    description: 'User Management'
  },
  {
    name: 'Settings',
    icon: Settings,
    path: '/dashboard/settings',
    description: 'Configuration'
  },
  {
    name: 'Logs',
    icon: FileText,
    path: '/dashboard/logs',
    description: 'System Logs'
  },
  {
    name: 'Profile',
    icon: User,
    path: '/dashboard/profile',
    description: 'Admin Profile'
  }
]

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <motion.div
      className={`bg-white shadow-lg border-r border-gray-200 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <motion.h2
            className="text-lg font-semibold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Admin Panel
          </motion.h2>
        )}
        <motion.button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </motion.button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <motion.button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <motion.div
            className="text-xs text-gray-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            MDZ BloxBux v1.0
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
