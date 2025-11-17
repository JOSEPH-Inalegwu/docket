'use client'

import { Tool } from '@/lib/tools-config'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'


interface ToolItemProps {
  tool: Tool
  onToolClick?: (tool: Tool) => void
}

export default function ToolItem({ tool, onToolClick }: ToolItemProps) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(tool.href)
  const [isExpanded, setIsExpanded] = useState(isActive)

  const Icon = tool.icon

  const handleMainClick = (e: React.MouseEvent) => {
    // If tool is not connected, prevent navigation and trigger modal
    if (!tool.isConnected) {
      e.preventDefault()
      onToolClick?.(tool)
      return
    }

    // For connected tools with nested links, toggle expansion
    if (tool.nestedLinks) {
      setIsExpanded(!isExpanded)
    }
  }

  const MainContent = (
    <div
      className={`
        flex items-center justify-between px-3 py-2 rounded-lg
        transition-all duration-200 group cursor-pointer
        ${isActive 
          ? 'bg-[#6c47ff]/10 text-[#6c47ff] dark:bg-[#6c47ff]/20' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }
      `}
      onClick={handleMainClick}
    >
      <div className="flex items-center gap-3 flex-1">
        <div 
          className={`
            p-2 rounded-lg transition-colors
            ${isActive ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'}
          `}
          style={{ 
            backgroundColor: isActive ? tool.color + '20' : undefined 
          }}
        >
          <Icon 
            className="w-4 h-4" 
            style={{ 
              color: isActive ? tool.color : undefined 
            }}
          />
        </div>
        
        <span className="font-medium text-sm">{tool.name}</span>
      </div>

      {/* Expand/Collapse Icon - only show if connected and has nested links */}
      {tool.isConnected && tool.nestedLinks && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Connection Status Badge */}
      {!tool.isConnected && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
          Setup
        </span>
      )}
    </div>
  )

  return (
    <div>
      {/* Main Tool Item */}
      {tool.isConnected ? (
        <Link href={tool.href}>
          {MainContent}
        </Link>
      ) : (
        MainContent
      )}

      {/* Nested Links - only show if connected and expanded */}
      {tool.isConnected && tool.nestedLinks && isExpanded && (
        <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
          {tool.nestedLinks.map((link) => {
            const isNestedActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  block px-3 py-1.5 rounded-md text-sm
                  transition-colors duration-200
                  ${isNestedActive 
                    ? 'bg-[#6c47ff]/10 text-[#6c47ff] font-medium dark:bg-[#6c47ff]/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}