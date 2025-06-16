'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Star, Calendar, Globe, Hash, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  language: string
  order_index: number
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function FAQDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [faq, setFaq] = useState<FAQ | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchFaq = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/faqs/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('FAQ not found')
        }
        throw new Error('Failed to fetch FAQ')
      }

      const data: FAQ = await response.json()
      setFaq(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchFaq()
    }
  }, [params.id])

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!faq) {
      return
    }

    try {
      const response = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete FAQ')
      }

      // Redirect to FAQ list
      router.push('/admin/faqs')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete FAQ')
      setDeleteDialogOpen(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'en': 'English',
      'ka': 'Georgian',
      'ru': 'Russian',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian',
      'tr': 'Turkish',
      'ar': 'Arabic'
    }
    return languages[code] || code.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading FAQ...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/faqs">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-red-600">Error</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!faq) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/faqs">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">FAQ Not Found</h1>
            <p className="text-muted-foreground">The requested FAQ could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/faqs">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">FAQ Details</h1>
            <p className="text-muted-foreground">
              View and manage FAQ information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/faqs/${faq.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{faq.question}</CardTitle>
                  <CardDescription className="mt-2">
                    Category: <Badge variant="outline">{faq.category}</Badge>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {faq.is_featured && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  )}
                  {faq.is_active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h4 className="text-lg font-semibold mb-3">Answer</h4>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {faq.answer}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                  {faq.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Featured</span>
                <Badge variant={faq.is_featured ? 'default' : 'outline'}>
                  {faq.is_featured ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Language</div>
                  <div className="text-sm text-muted-foreground">
                    {getLanguageName(faq.language)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Order Index</div>
                  <div className="text-sm text-muted-foreground">
                    {faq.order_index}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(faq.created_at).toLocaleDateString()} at{' '}
                    {new Date(faq.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Last Updated</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(faq.updated_at).toLocaleDateString()} at{' '}
                    {new Date(faq.updated_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {faq && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">FAQ to be deleted:</h4>
                <p className="text-sm font-medium">{faq.question}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Category: {faq.category} • Language: {getLanguageName(faq.language)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 