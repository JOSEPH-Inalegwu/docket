'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { Bell, X } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useEffect, useState, useRef } from 'react'

interface Notification {
  id: string
  product_name: string
  message: string
  quantity: number
  threshold: number
  is_read: boolean
  created_at: string
}

export default function DashboardNavbar() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch notifications
  useEffect(() => {
    fetchNotifications()
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      })
      
      if (res.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })
      
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        // Remove from local state
        const deletedNotif = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        
        // Decrease unread count if it was unread
        if (deletedNotif && !deletedNotif.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const deleteAllNotifications = async () => {
    setIsLoading(true)
    try {
      // Delete all notifications one by one
      await Promise.all(
        notifications.map(notification => 
          fetch(`/api/notifications/${notification.id}`, { method: 'DELETE' })
        )
      )
      
      // Clear local state
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Error deleting all notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  if (!mounted) {
    return <header className="h-16 w-full" />
  }

  const logoSrc = theme === 'dark' ? '/docket-outline.svg' : '/docket.svg'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image src={logoSrc} alt="Docket Logo" width={32} height={32} />
          <span className="text-2xl font-bold text-[#6c47ff] dark:text-white">Docket</span>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Icon with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2 text-gray-700 dark:text-gray-300 hover:text-[#6c47ff] dark:hover:text-[#6c47ff] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isOpen ? 'bg-gray-100 dark:bg-gray-800 text-[#6c47ff]' : ''
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-[500px] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        disabled={isLoading}
                        className="text-xs text-[#6c47ff] hover:underline disabled:opacity-50"
                      >
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={deleteAllNotifications}
                        disabled={isLoading}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                      >
                        Delete all
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div 
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.product_name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-[#6c47ff] rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                              aria-label="Delete notification"
                            >
                              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile */}
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
