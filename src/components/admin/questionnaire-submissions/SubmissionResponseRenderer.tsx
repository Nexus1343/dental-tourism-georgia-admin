'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Image as ImageIcon, 
  Download,
  CheckCircle,
  Circle,
  Star,
  MessageSquare,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface QuestionResponse {
  questionId: string
  questionText: string
  questionType: string
  answer: any
  formattedAnswer?: string
  pageTitle: string
  pageOrder: number
  questionOrder: number
  answeredAt: string
  required: boolean
  options: any
}

interface SubmissionResponseRendererProps {
  submissionId: string
  templateName: string
  className?: string
}

export function SubmissionResponseRenderer({ 
  submissionId, 
  templateName, 
  className 
}: SubmissionResponseRendererProps) {
  const [responses, setResponses] = useState<QuestionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchResponses() {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/questionnaire-submissions/${submissionId}/responses`)
        if (!res.ok) {
          throw new Error('Failed to fetch responses')
        }
        const data = await res.json()
        setResponses(data.responses || [])
        
        // Auto-expand first page if responses exist
        if (data.responses && data.responses.length > 0) {
          setExpandedPages(new Set([data.responses[0].pageTitle]))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchResponses()
  }, [submissionId])

  const togglePage = (pageTitle: string) => {
    const newExpanded = new Set(expandedPages)
    if (newExpanded.has(pageTitle)) {
      newExpanded.delete(pageTitle)
    } else {
      newExpanded.add(pageTitle)
    }
    setExpandedPages(newExpanded)
  }

  const renderAnswer = (response: QuestionResponse) => {
    const { answer, formattedAnswer, questionType, options } = response

    if (!answer && answer !== 0 && answer !== false) {
      return <span className="text-muted-foreground italic">No answer provided</span>
    }

    // Use formatted answer if available (from the database view)
    if (formattedAnswer && formattedAnswer !== answer) {
      // Handle multiple choice specially
      if (questionType === 'multiple_choice' && formattedAnswer.includes(',')) {
        const choices = formattedAnswer.split(', ').map(choice => choice.trim())
        return (
          <div className="flex flex-wrap gap-2">
            {choices.map((choice, index) => (
              <Badge key={index} variant="outline">
                {choice.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        )
      }
      
      // Handle rating/scale specially
      if (questionType === 'rating' || questionType === 'slider' || questionType === 'pain_scale') {
        const [value, max] = formattedAnswer.split(' / ')
        const rating = parseInt(value) || 0
        const maxRating = parseInt(max) || 10
        return (
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: Math.min(maxRating, 10) }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({formattedAnswer})</span>
          </div>
        )
      }

      // Handle file uploads
      if (formattedAnswer === 'File uploaded') {
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <FileText className="h-4 w-4" />
            <span className="font-medium">File uploaded</span>
          </div>
        )
      }

      // Default formatted display
      return (
        <div className="space-y-2">
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="whitespace-pre-wrap">{formattedAnswer}</p>
          </div>
        </div>
      )
    }

    switch (questionType) {
      case 'text':
      case 'textarea':
        return (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="whitespace-pre-wrap">{String(answer)}</p>
          </div>
        )

      case 'number':
      case 'age':
        return (
          <Badge variant="outline" className="font-mono text-base px-3 py-1">
            {answer}
          </Badge>
        )

      case 'email':
        return (
          <a 
            href={`mailto:${answer}`} 
            className="text-blue-600 hover:underline font-medium"
          >
            {String(answer)}
          </a>
        )

      case 'phone':
        return (
          <a 
            href={`tel:${answer}`} 
            className="text-blue-600 hover:underline font-medium"
          >
            {String(answer)}
          </a>
        )

      case 'single_choice':
      case 'radio':
        return (
          <Badge variant="secondary" className="font-medium">
            {String(answer)}
          </Badge>
        )

      case 'multiple_choice':
      case 'checkbox':
        // Handle JSON string arrays
        if (typeof answer === 'string' && answer.startsWith('[')) {
          try {
            const parsed = JSON.parse(answer)
            if (Array.isArray(parsed)) {
              return (
                <div className="flex flex-wrap gap-2">
                  {parsed.map((item, index) => (
                    <Badge key={index} variant="outline">
                      {String(item).replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              )
            }
          } catch (e) {
            // Fall back to treating as string
          }
        }
        if (Array.isArray(answer)) {
          return (
            <div className="flex flex-wrap gap-2">
              {answer.map((item, index) => (
                <Badge key={index} variant="outline">
                  {String(item).replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )
        }
        return <Badge variant="outline">{String(answer)}</Badge>

      case 'boolean':
      case 'yes_no':
        const isYes = answer === true || answer === 'yes' || answer === 'Yes'
        return (
          <div className="flex items-center gap-2">
            {isYes ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">Yes</span>
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">No</span>
              </>
            )}
          </div>
        )

      case 'rating':
      case 'slider':
      case 'pain_scale':
        const rating = parseInt(String(answer)) || 0
        const maxRating = questionType === 'pain_scale' ? 10 : 5
        return (
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: Math.min(maxRating, 10) }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({rating}/{maxRating})</span>
          </div>
        )

      case 'file_upload':
      case 'photo_upload':
      case 'photo_grid':
        if (typeof answer === 'string' && answer.startsWith('http')) {
          return (
            <div className="flex items-center gap-3 p-3 border rounded-md">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Uploaded File</p>
                <p className="text-xs text-muted-foreground truncate">{answer}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={answer} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  View
                </a>
              </Button>
            </div>
          )
        }
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>File uploaded</span>
          </div>
        )

      case 'date':
      case 'date_picker':
        try {
          const date = new Date(answer)
          return (
            <Badge variant="outline" className="font-mono">
              {date.toLocaleDateString()}
            </Badge>
          )
        } catch {
          return <Badge variant="outline">{String(answer)}</Badge>
        }

      case 'budget_range':
        return (
          <Badge variant="secondary" className="font-medium text-green-700 bg-green-50">
            ${String(answer)}
          </Badge>
        )

      case 'tooth_chart':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="h-4 w-4 bg-blue-100 rounded border" />
            <span className="font-medium">Tooth selection: {String(answer)}</span>
          </div>
        )

      default:
        if (Array.isArray(answer)) {
          return (
            <div className="flex flex-wrap gap-2">
              {answer.map((item, index) => (
                <Badge key={index} variant="outline">
                  {String(item)}
                </Badge>
              ))}
            </div>
          )
        }
        
        if (typeof answer === 'object') {
          return (
            <div className="p-3 bg-muted/50 rounded-md">
              <pre className="text-sm">{JSON.stringify(answer, null, 2)}</pre>
            </div>
          )
        }

        return (
          <div className="p-3 bg-muted/50 rounded-md">
            <p>{String(answer)}</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-3 animate-spin" />
            <h3 className="font-medium mb-1">Loading Responses</h3>
            <p className="text-sm text-muted-foreground">
              Fetching patient responses...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Error Loading Responses</h3>
            <p className="text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (responses.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-1">No Responses Found</h3>
            <p className="text-sm text-muted-foreground">
              This submission doesn&apos;t contain any responses yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group responses by page
  const responsesByPage = responses.reduce((acc, response) => {
    if (!acc[response.pageTitle]) {
      acc[response.pageTitle] = []
    }
    acc[response.pageTitle].push(response)
    return acc
  }, {} as Record<string, QuestionResponse[]>)

  // Calculate some stats
  const pageCount = Object.keys(responsesByPage).length
  const answeredQuestions = responses.filter(r => r.answer && r.answer !== '').length
  const requiredQuestions = responses.filter(r => r.required).length
  const completionRate = responses.length > 0 ? Math.round((answeredQuestions / responses.length) * 100) : 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Patient Responses
          <Badge variant="secondary">{responses.length} questions</Badge>
        </CardTitle>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Responses from &quot;{templateName}&quot; questionnaire
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
              <span>{pageCount} pages</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>{answeredQuestions} answered</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-orange-500 rounded-full" />
              <span>{requiredQuestions} required</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-purple-500 rounded-full" />
              <span>{completionRate}% complete</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(responsesByPage)
          .sort(([, a], [, b]) => a[0].pageOrder - b[0].pageOrder)
          .map(([pageTitle, pageResponses]) => {
            const isExpanded = expandedPages.has(pageTitle)
            
            return (
              <div key={pageTitle} className="border rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => togglePage(pageTitle)}
                  className="w-full justify-between p-4 h-auto"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium text-left">
                      {pageTitle}
                    </span>
                    <Badge variant="outline">
                      {pageResponses.length} questions
                    </Badge>
                  </div>
                </Button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4">
                    {pageResponses
                      .sort((a, b) => a.questionOrder - b.questionOrder)
                      .map((response) => (
                                                 <div key={response.questionId} className="border-l-2 border-muted pl-4">
                           <div className="flex items-start justify-between mb-2">
                             <div className="flex-1">
                               <h4 className="font-medium text-sm mb-1">
                                 {response.questionText}
                               </h4>
                               <div className="flex items-center gap-2 mb-3">
                                 <Badge variant="outline" className="text-xs">
                                   {response.questionType.replace(/_/g, ' ')}
                                 </Badge>
                                 {response.required && (
                                   <Badge variant="destructive" className="text-xs">
                                     Required
                                   </Badge>
                                 )}
                                 {!response.answer && (
                                   <Badge variant="secondary" className="text-xs">
                                     No answer
                                   </Badge>
                                 )}
                                 {response.answeredAt && (
                                   <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                     <Clock className="h-3 w-3" />
                                     {new Date(response.answeredAt).toLocaleString()}
                                   </div>
                                 )}
                               </div>
                             </div>
                           </div>
                           <div className="ml-0">
                             {renderAnswer(response)}
                           </div>
                         </div>
                      ))}
                  </div>
                )}
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
} 