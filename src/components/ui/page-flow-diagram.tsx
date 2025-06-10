'use client'

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight,
  ArrowDown,
  GitBranch,
  Play,
  CheckCircle,
  AlertTriangle,
  Camera,
  FileText,
  MessageSquare,
  List,
  RotateCcw
} from "lucide-react"
import { QuestionnairePage } from "@/types/database"

interface PageFlowDiagramProps {
  pages: QuestionnairePage[]
  className?: string
}

interface FlowNode {
  id: string
  page: QuestionnairePage
  x: number
  y: number
  connections: string[]
  conditionalConnections: {
    targetId: string
    condition: string
    type: 'show_if' | 'skip_if'
  }[]
}

export function PageFlowDiagram({ pages, className }: PageFlowDiagramProps) {
  // Create flow nodes with positioning
  const createFlowNodes = (): FlowNode[] => {
    const nodes: FlowNode[] = []
    const baseY = 100
    const stepY = 150
    const baseX = 100
    
    pages.forEach((page, index) => {
      // Simple linear flow for now - can be enhanced with conditional branching
      const node: FlowNode = {
        id: page.id,
        page: page,
        x: baseX,
        y: baseY + (index * stepY),
        connections: index < pages.length - 1 ? [pages[index + 1].id] : [],
        conditionalConnections: []
      }
      
      // Add conditional connections based on page configuration
      if (page.auto_advance && index < pages.length - 1) {
        node.conditionalConnections.push({
          targetId: pages[index + 1].id,
          condition: 'auto_advance',
          type: 'show_if'
        })
      }
      
      nodes.push(node)
    })
    
    return nodes
  }

  const flowNodes = createFlowNodes()

  const getPageTypeIcon = (type: string) => {
    switch (type) {
      case 'intro': return MessageSquare
      case 'photo_upload': return Camera  
      case 'summary': return List
      default: return FileText
    }
  }

  const getPageTypeColor = (type: string) => {
    switch (type) {
      case 'intro': return 'bg-blue-100 border-blue-300 text-blue-700'
      case 'photo_upload': return 'bg-purple-100 border-purple-300 text-purple-700'
      case 'summary': return 'bg-green-100 border-green-300 text-green-700'
      default: return 'bg-gray-100 border-gray-300 text-gray-700'
    }
  }

  const FlowNode = ({ node }: { node: FlowNode }) => {
    const PageIcon = getPageTypeIcon(node.page.page_type)
    const pageColorClass = getPageTypeColor(node.page.page_type)
    
    return (
      <div 
        className="absolute"
        style={{ left: node.x, top: node.y }}
      >
        <div className={`w-64 p-4 border-2 rounded-lg bg-white shadow-sm ${pageColorClass}`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white border">
              <PageIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {node.page.page_number}
                </Badge>
                <span className="text-xs font-medium text-gray-600">
                  {node.page.page_type.replace('_', ' ')}
                </span>
              </div>
              <h4 className="font-medium text-sm truncate mb-1">
                {node.page.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {node.page.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {!node.page.allow_back_navigation && (
                  <Badge variant="outline" className="text-xs">No Back</Badge>
                )}
                {node.page.auto_advance && (
                  <Badge variant="default" className="text-xs">Auto</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const FlowConnection = ({ from, to, type = 'normal' }: { 
    from: FlowNode, 
    to: FlowNode, 
    type?: 'normal' | 'conditional' | 'skip'
  }) => {
    const startX = from.x + 128 // Center of from node
    const startY = from.y + 80  // Bottom of from node
    const endX = to.x + 128     // Center of to node  
    const endY = to.y           // Top of to node
    
    const pathLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
    const isVertical = Math.abs(endX - startX) < 50
    
    let strokeColor = '#94a3b8' // gray-400
    let strokeDasharray = 'none'
    
    if (type === 'conditional') {
      strokeColor = '#3b82f6' // blue-500
      strokeDasharray = '5,5'
    } else if (type === 'skip') {
      strokeColor = '#ef4444' // red-500
      strokeDasharray = '3,3'
    }
    
    return (
      <g>
        <defs>
          <marker
            id={`arrowhead-${type}`}
            markerWidth="10"
            markerHeight="7" 
            refX="9"
            refY="3.5"
            orient="auto"
            fill={strokeColor}
          >
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
        </defs>
        
        {isVertical ? (
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={strokeColor}
            strokeWidth="2"
            strokeDasharray={strokeDasharray}
            markerEnd={`url(#arrowhead-${type})`}
          />
        ) : (
          <path
            d={`M ${startX} ${startY} Q ${startX} ${(startY + endY) / 2} ${endX} ${endY}`}
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
            strokeDasharray={strokeDasharray}
            markerEnd={`url(#arrowhead-${type})`}
          />
        )}
        
        {/* Connection label for conditional flows */}
        {type !== 'normal' && (
          <text
            x={(startX + endX) / 2}
            y={(startY + endY) / 2}
            fontSize="10"
            fill={strokeColor}
            textAnchor="middle"
            className="font-medium"
          >
            {type === 'conditional' ? 'if' : 'skip'}
          </text>
        )}
      </g>
    )
  }

  const maxY = Math.max(...flowNodes.map(n => n.y)) + 150
  const maxX = Math.max(...flowNodes.map(n => n.x)) + 300

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Page Flow Diagram
        </CardTitle>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-400"></div>
            <span className="text-gray-600">Normal Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t border-blue-500"></div>
            <span className="text-gray-600">Conditional</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500 border-dashed border-t border-red-500"></div>
            <span className="text-gray-600">Skip Logic</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 bg-gray-50 overflow-auto">
          <div className="relative" style={{ width: maxX, height: maxY }}>
            {/* SVG for connections */}
            <svg 
              className="absolute inset-0 pointer-events-none"
              width={maxX}
              height={maxY}
            >
              {flowNodes.map((node) => {
                const connections: React.ReactElement[] = []
                
                // Normal connections
                node.connections.forEach(targetId => {
                  const targetNode = flowNodes.find(n => n.id === targetId)
                  if (targetNode) {
                    connections.push(
                      <FlowConnection
                        key={`${node.id}-${targetId}`}
                        from={node}
                        to={targetNode}
                        type="normal"
                      />
                    )
                  }
                })
                
                // Conditional connections
                node.conditionalConnections.forEach(conn => {
                  const targetNode = flowNodes.find(n => n.id === conn.targetId)
                  if (targetNode) {
                    connections.push(
                      <FlowConnection
                        key={`${node.id}-${conn.targetId}-${conn.type}`}
                        from={node}
                        to={targetNode}
                        type={conn.type === 'skip_if' ? 'skip' : 'conditional'}
                      />
                    )
                  }
                })
                
                return connections
              })}
            </svg>
            
            {/* Flow nodes */}
            {flowNodes.map((node) => (
              <FlowNode key={node.id} node={node} />
            ))}
            
            {/* Start indicator */}
            <div className="absolute" style={{ left: 50, top: 50 }}>
              <div className="flex items-center gap-2 text-green-600">
                <Play className="h-4 w-4" />
                <span className="text-sm font-medium">Start</span>
              </div>
            </div>
            
            {/* End indicator */}
            {flowNodes.length > 0 && (
              <div 
                className="absolute" 
                style={{ 
                  left: flowNodes[flowNodes.length - 1].x + 280, 
                  top: flowNodes[flowNodes.length - 1].y + 40 
                }}
              >
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Complete</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Flow Statistics */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{pages.length}</div>
            <div className="text-sm text-gray-600">Total Pages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {pages.filter(p => p.page_type === 'photo_upload').length}
            </div>
            <div className="text-sm text-gray-600">Photo Pages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {pages.filter(p => p.auto_advance).length}
            </div>
            <div className="text-sm text-gray-600">Auto Advance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {pages.filter(p => !p.allow_back_navigation).length}
            </div>
            <div className="text-sm text-gray-600">No Back Nav</div>
          </div>
        </div>
        
        {/* Flow Actions */}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm">
            <Play className="mr-2 h-4 w-4" />
            Test Flow
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Simulate User Journey
          </Button>
          <Button variant="outline" size="sm">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Validate Logic
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 