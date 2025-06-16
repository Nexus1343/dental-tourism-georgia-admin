'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

interface Options {
  categories: string[]
  languages: { code: string; name: string }[]
  statusOptions: { value: string; label: string }[]
}

export default function EditFAQPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<Options>({
    categories: [],
    languages: [],
    statusOptions: []
  })

  // Form data
  const [formData, setFormData] = useState({
    category: '',
    question: '',
    answer: '',
    language: 'en',
    order_index: 0,
    is_featured: false,
    is_active: true
  })

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/admin/faqs/options')
      if (response.ok) {
        const data = await response.json()
        setOptions(data)
      }
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

  const fetchFaq = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/admin/faqs/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('FAQ not found')
        }
        throw new Error('Failed to fetch FAQ')
      }

      const faq: FAQ = await response.json()
      setFormData({
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        language: faq.language,
        order_index: faq.order_index,
        is_featured: faq.is_featured,
        is_active: faq.is_active
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    fetchOptions()
    if (params.id) {
      fetchFaq()
    }
  }, [params.id])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.category.trim()) {
      setError('Category is required')
      return
    }
    
    if (!formData.question.trim()) {
      setError('Question is required')
      return
    }
    
    if (!formData.answer.trim()) {
      setError('Answer is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/faqs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update FAQ')
      }

      // Redirect to FAQ detail page
      router.push(`/admin/faqs/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading FAQ...</div>
      </div>
    )
  }

  if (error && fetchLoading) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/faqs/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit FAQ</h1>
          <p className="text-muted-foreground">
            Update the frequently asked question
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>FAQ Details</CardTitle>
            <CardDescription>
              Update the information for the FAQ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => handleInputChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.languages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => handleInputChange('question', e.target.value)}
                placeholder="Enter the question"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                placeholder="Enter the answer"
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_index">Order Index</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-sm text-muted-foreground">
                Lower numbers appear first in the list
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked: boolean) => handleInputChange('is_featured', checked)}
                />
                <Label htmlFor="is_featured">Featured FAQ</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked: boolean) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link href={`/admin/faqs/${params.id}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Updating...' : 'Update FAQ'}
          </Button>
        </div>
      </form>
    </div>
  )
} 