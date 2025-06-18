'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SubmissionStatusBadge } from '@/components/admin/questionnaire-submissions/SubmissionStatusBadge'
import { SubmissionResponseRenderer } from '@/components/admin/questionnaire-submissions/SubmissionResponseRenderer'
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  Globe, 
  Monitor, 
  User, 
  Calendar,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react'

interface SubmissionData {
  id: string
  status: string
  completion_percentage: number
  is_complete: boolean
  submission_data: any
  template_name: string
  template_description: string
  template_version: number
  template_language: string
  template_total_pages: number
  template_estimated_minutes: number
  template_introduction: string
  template_completion_message: string
  template_created_by: string
  lead_reference: string
  lead_status: string
  lead_priority: string
  lead_source: string
  preferred_contact_method: string
  preferred_treatment_date: string
  budget_range: string
  travel_group_size: number
  accommodation_preference: string
  special_requirements: string
  marketing_consent: boolean
  ai_analysis_summary: string
  ai_completeness_score: number
  created_at: string
  updated_at: string | null
  completed_at: string | null
  time_spent_seconds: number | null
  time_spent_formatted: string
  total_completion_time: string
  ip_address: string | null
  user_agent: string | null
  submission_token: string | null
  browser: string
  device_type: string
  progress_description: string
  submission_quality: string
}

async function fetchSubmission(id: string): Promise<SubmissionData> {
  const res = await fetch(`/api/admin/questionnaire-submissions/${id}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to fetch submission: ${res.status}`)
  }
  return await res.json()
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return 'Unknown'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

function formatUserAgent(userAgent: string | null): string {
  if (!userAgent) return 'Unknown'
  
  // Simple user agent parsing for display
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  
  return userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent
}

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [submission, setSubmission] = useState<SubmissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submissionId, setSubmissionId] = useState<string>('')

  useEffect(() => {
    params.then(resolvedParams => {
      setSubmissionId(resolvedParams.id)
      return fetchSubmission(resolvedParams.id)
    })
      .then(data => {
        setSubmission(data)
        setError(null)
      })
      .catch(err => {
        setError(err.message)
        setSubmission(null)
      })
      .finally(() => setLoading(false))
  }, [params])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-48" />
            <div className="h-6 bg-muted rounded animate-pulse w-64" />
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded animate-pulse w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-muted rounded animate-pulse w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading submission details...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="text-sm text-muted-foreground">Questionnaire Submissions</div>
            <h1 className="text-2xl font-bold">Submission Details</h1>
          </div>
        </div>
        
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-8">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">Error Loading Submission</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/admin/questionnaire-submissions')}>
                  Back to List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="text-sm text-muted-foreground">Questionnaire Submissions</div>
            <h1 className="text-2xl font-bold">Submission Not Found</h1>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Submission Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The submission with ID &quot;{submissionId}&quot; could not be found.
              </p>
              <Button onClick={() => router.push('/admin/questionnaire-submissions')}>
                Back to Submissions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">
            <Link href="/admin/questionnaire-submissions" className="hover:underline">
              Questionnaire Submissions
            </Link>
            {' / '}
            <span className="font-mono">{submission.id.slice(0, 8)}...</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Submission Details</h1>
            <SubmissionStatusBadge 
              isComplete={submission.is_complete} 
              completionPercentage={submission.completion_percentage} 
            />
          </div>
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Submission ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm break-all">{submission.id}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Lead Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium text-sm">{submission.lead_reference}</div>
              {submission.lead_status && (
                <div className="text-xs text-muted-foreground">
                  Status: {submission.lead_status}
                </div>
              )}
              {submission.lead_source && (
                <div className="text-xs text-muted-foreground">
                  Source: {submission.lead_source}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Template Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium text-sm">{submission.template_name}</div>
              {submission.template_language && (
                <div className="text-xs text-muted-foreground">
                  Language: {submission.template_language}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Version: {submission.template_version}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium text-sm">{submission.time_spent_formatted}</div>
              {submission.total_completion_time !== 'Not completed' && (
                <div className="text-xs text-muted-foreground">
                  Total: {submission.total_completion_time}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {submission.progress_description}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              IP Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm">
              {submission.ip_address || 'Unknown'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium text-sm">{submission.browser}</div>
              <div className="text-xs text-muted-foreground">
                Device: {submission.device_type}
              </div>
              <div className="text-xs text-muted-foreground">
                Quality: {submission.submission_quality}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(submission.created_at).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {submission.completed_at 
                ? new Date(submission.completed_at).toLocaleString()
                : <span className="text-muted-foreground">Not completed</span>
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Responses */}
      <SubmissionResponseRenderer 
        submissionId={submission.id} 
        templateName={submission.template_name}
      />

      {/* Template Details */}
      {submission.template_description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Template Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Description</div>
                <div className="text-sm mt-1">{submission.template_description}</div>
              </div>
              
              {submission.template_introduction && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Introduction</div>
                  <div className="text-sm mt-1 p-3 bg-muted/50 rounded">
                    {submission.template_introduction}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Pages</div>
                  <div className="font-medium">{submission.template_total_pages}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Est. Time</div>
                  <div className="font-medium">{submission.template_estimated_minutes} min</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Created By</div>
                  <div className="font-medium">{submission.template_created_by}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Language</div>
                  <div className="font-medium">{submission.template_language}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lead Details */}
      {(submission.budget_range || submission.special_requirements || submission.ai_analysis_summary) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Lead Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submission.budget_range && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Budget Range</div>
                  <div className="text-sm mt-1 font-medium">{submission.budget_range}</div>
                </div>
              )}
              
              {submission.preferred_treatment_date && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Preferred Treatment Date</div>
                  <div className="text-sm mt-1">{submission.preferred_treatment_date}</div>
                </div>
              )}
              
              {submission.special_requirements && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Special Requirements</div>
                  <div className="text-sm mt-1 p-3 bg-muted/50 rounded">
                    {submission.special_requirements}
                  </div>
                </div>
              )}
              
              {submission.ai_analysis_summary && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">AI Analysis Summary</div>
                  <div className="text-sm mt-1 p-3 bg-blue-50 rounded border border-blue-200">
                    {submission.ai_analysis_summary}
                  </div>
                  {submission.ai_completeness_score && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Completeness Score: {submission.ai_completeness_score}/100
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {submission.travel_group_size && (
                  <div>
                    <div className="text-muted-foreground">Group Size</div>
                    <div className="font-medium">{submission.travel_group_size} people</div>
                  </div>
                )}
                {submission.accommodation_preference && (
                  <div>
                    <div className="text-muted-foreground">Accommodation</div>
                    <div className="font-medium">{submission.accommodation_preference}</div>
                  </div>
                )}
                {submission.preferred_contact_method && (
                  <div>
                    <div className="text-muted-foreground">Contact Method</div>
                    <div className="font-medium">{submission.preferred_contact_method}</div>
                  </div>
                )}
                <div>
                  <div className="text-muted-foreground">Marketing Consent</div>
                  <div className="font-medium">{submission.marketing_consent ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Additional Information */}
      {submission.submission_token && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Technical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Submission Token</div>
                <div className="font-mono text-sm mt-1 p-2 bg-muted rounded">
                  {submission.submission_token}
                </div>
              </div>
              
              {submission.updated_at && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                  <div className="text-sm mt-1">
                    {new Date(submission.updated_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 