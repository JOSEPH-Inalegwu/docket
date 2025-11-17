'use client'

import { tools } from '@/lib/tools-config'
import { Tool } from '@/lib/tools-config'
import ToolItem from './tool-item'

interface ToolListProps {
  onToolClick?: (tool: Tool) => void
}

export default function ToolList({ onToolClick }: ToolListProps) {
  return (
    <nav className="space-y-1">
      {tools.map((tool) => (
        <ToolItem 
          key={tool.id} 
          tool={tool} 
          onToolClick={onToolClick}
        />
      ))}
    </nav>
  )
}