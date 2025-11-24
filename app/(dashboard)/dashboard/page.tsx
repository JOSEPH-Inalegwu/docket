'use client'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { tools } from '@/lib/tools-config'
import { useConnections } from '@/hooks/use-connection'

export default function DashboardPage() {
  const { isConnected, isLoading } = useConnections()
  
  const [greeting, setGreeting] = useState("");
  const [time, setTime] = useState("");
  const [day, setDay] = useState("");

  useEffect(() => {
    const now = new Date();

    const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
    setDay(weekday);

    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    setTime(formattedTime);

    const hour = now.getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else if (hour < 20) setGreeting("Good Evening");
    else setGreeting("Good Night");
  }, []);

  // Map tools with real connection status
  const toolsWithStatus = tools.map((tool) => ({
    ...tool,
    isConnected: isConnected(tool.id),
  }))

  const connectedTools = toolsWithStatus.filter(tool => tool.isConnected)
  const disconnectedTools = toolsWithStatus.filter(tool => !tool.isConnected)

  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="space-y-2 mb-8">
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-8 w-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="space-y-2 mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {day}, {time} — {greeting}
        </p>
        <h1 className="text-3xl font-bold">
          Welcome to Docket, Joseph!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your e-commerce tools to see all your metrics in one place
        </p>
      </div>

      {/* Connected Tools Section */}
      {connectedTools.length > 0 ? (
        <section>
          <h2 className="text-xl font-semibold mb-4">Connected Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-[#6c47ff] dark:hover:border-[#6c47ff] transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: tool.color + '20' }}
                      >
                        <Icon className="w-6 h-6" style={{ color: tool.color }} />
                      </div>
                      <h3 className="font-semibold">{tool.name}</h3>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-200 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Connected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View metrics and analytics
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tools connected yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by connecting your first e-commerce tool from the sidebar
            </p>
          </div>
        </div>
      )}

      {/* Available Tools Section */}
      {disconnectedTools.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disconnectedTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-[#6c47ff] dark:hover:border-[#6c47ff] transition-all hover:shadow-md group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-opacity-50"
                        style={{ 
                          backgroundColor: tool.color + '10',
                        }}
                      >
                        <Icon className="w-6 h-6 text-gray-400 group-hover:opacity-70" style={{ color: tool.color }} />
                      </div>
                      <h3 className="font-semibold">{tool.name}</h3>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                      Setup
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to connect and start tracking
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}