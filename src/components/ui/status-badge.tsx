'use client'

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Clock, AlertCircle, Pause } from "lucide-react"

export type StatusType = 'active' | 'inactive' | 'draft' | 'pending' | 'error' | 'success' | 'warning'

interface StatusBadgeProps {
  status: StatusType
  text?: string
  showIcon?: boolean
  className?: string
}

const statusConfig = {
  active: {
    variant: 'default' as const,
    icon: CheckCircle,
    text: 'Active',
    className: 'bg-green-100 text-green-800 hover:bg-green-100'
  },
  inactive: {
    variant: 'secondary' as const,
    icon: Pause,
    text: 'Inactive',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  },
  draft: {
    variant: 'outline' as const,
    icon: Clock,
    text: 'Draft',
    className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50'
  },
  pending: {
    variant: 'outline' as const,
    icon: Clock,
    text: 'Pending',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50'
  },
  error: {
    variant: 'destructive' as const,
    icon: XCircle,
    text: 'Error',
    className: 'bg-red-100 text-red-800 hover:bg-red-100'
  },
  success: {
    variant: 'default' as const,
    icon: CheckCircle,
    text: 'Success',
    className: 'bg-green-100 text-green-800 hover:bg-green-100'
  },
  warning: {
    variant: 'outline' as const,
    icon: AlertCircle,
    text: 'Warning',
    className: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50'
  }
}

export function StatusBadge({ 
  status, 
  text, 
  showIcon = true, 
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  const displayText = text || config.text

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {displayText}
    </Badge>
  )
} 