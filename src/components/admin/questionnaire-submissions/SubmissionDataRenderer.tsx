'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Copy, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface SubmissionDataRendererProps {
  data: any
  title?: string
  className?: string
}

export function SubmissionDataRenderer({ data, title = "Submission Data", className }: SubmissionDataRendererProps) {
  const [showRaw, setShowRaw] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    toast.success('Copied to clipboard')
  }

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSections(newExpanded)
  }

  const renderValue = (value: any, key: string, depth: number = 0): React.ReactNode => {
    if (value === null) return <span className="text-muted-foreground italic">null</span>
    if (value === undefined) return <span className="text-muted-foreground italic">undefined</span>
    
    if (typeof value === 'boolean') {
      return <Badge variant={value ? "default" : "secondary"}>{value.toString()}</Badge>
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-600 font-mono">{value}</span>
    }
    
    if (typeof value === 'string') {
      if (value.length > 100) {
        return (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Long text ({value.length} chars)</div>
            <div className="p-2 bg-muted rounded text-sm max-h-32 overflow-y-auto">
              {value}
            </div>
          </div>
        )
      }
      return <span className="text-green-600">&quot;{value}&quot;</span>
    }
    
    if (Array.isArray(value)) {
      const sectionKey = `${key}-${depth}`
      const isExpanded = expandedSections.has(sectionKey)
      
      return (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSection(sectionKey)}
            className="h-auto p-1 text-left justify-start"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="ml-1">Array ({value.length} items)</span>
          </Button>
          {isExpanded && (
            <div className="ml-4 space-y-2 border-l-2 border-muted pl-3">
              {value.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-xs text-muted-foreground">[{index}]</div>
                  <div className="ml-2">
                    {renderValue(item, `${key}[${index}]`, depth + 1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    
    if (typeof value === 'object') {
      const sectionKey = `${key}-${depth}`
      const isExpanded = expandedSections.has(sectionKey)
      const keys = Object.keys(value)
      
      return (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSection(sectionKey)}
            className="h-auto p-1 text-left justify-start"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="ml-1">Object ({keys.length} properties)</span>
          </Button>
          {isExpanded && (
            <div className="ml-4 space-y-3 border-l-2 border-muted pl-3">
              {keys.map(objKey => (
                <div key={objKey} className="space-y-1">
                  <div className="font-medium text-sm text-foreground">{objKey}:</div>
                  <div className="ml-2">
                    {renderValue(value[objKey], `${key}.${objKey}`, depth + 1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    
    return <span className="text-muted-foreground">{String(value)}</span>
  }

  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-muted-foreground mb-2">No submission data</div>
            <div className="text-sm text-muted-foreground">This submission doesn&apos;t contain any data yet.</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRaw(!showRaw)}
            >
              {showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showRaw ? 'Pretty' : 'Raw'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showRaw ? (
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96 overflow-y-auto">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        ) : (
          <div className="space-y-4">
            {typeof data === 'object' && !Array.isArray(data) ? (
              Object.entries(data).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="font-medium text-foreground border-b pb-1">{key}:</div>
                  <div className="ml-2">
                    {renderValue(value, key)}
                  </div>
                </div>
              ))
            ) : (
              renderValue(data, 'root')
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 