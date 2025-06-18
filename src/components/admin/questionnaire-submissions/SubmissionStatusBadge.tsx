'use client'

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface SubmissionStatusBadgeProps {
  isComplete: boolean
  completionPercentage: number
  className?: string
}

export function SubmissionStatusBadge({ 
  isComplete, 
  completionPercentage, 
  className 
}: SubmissionStatusBadgeProps) {
  if (isComplete) {
    return (
      <Badge 
        variant="default"
        className={cn(
          "inline-flex items-center gap-1.5 font-medium bg-green-100 text-green-800 hover:bg-green-100",
          className
        )}
      >
        <CheckCircle className="h-3 w-3" />
        Complete
      </Badge>
    )
  }

  if (completionPercentage === 0) {
    return (
      <Badge 
        variant="outline"
        className={cn(
          "inline-flex items-center gap-1.5 font-medium bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50",
          className
        )}
      >
        <Clock className="h-3 w-3" />
        Not Started
      </Badge>
    )
  }

  return (
    <Badge 
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50",
        className
      )}
    >
      <AlertCircle className="h-3 w-3" />
      In Progress ({completionPercentage}%)
    </Badge>
  )
} 