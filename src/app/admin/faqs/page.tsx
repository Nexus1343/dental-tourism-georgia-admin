'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Edit, Eye, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

interface FAQsResponse {
  faqs: FAQ[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

interface Options {
  categories: string[]
  languages: { code: string; name: string }[]
  statusOptions: { value: string; label: string }[]
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [languageFilter, setLanguageFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [featuredFilter, setFeaturedFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [options, setOptions] = useState<Options>({
    categories: [],
    languages: [],
    statusOptions: []
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    faq: FAQ | null
  }>({
    isOpen: false,
    faq: null
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

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter }),
        ...(languageFilter && languageFilter !== 'all' && { language: languageFilter }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(featuredFilter && featuredFilter !== 'all' && { is_featured: featuredFilter })
      })

      const response = await fetch(`/api/admin/faqs?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch FAQs')
      }

      const data: FAQsResponse = await response.json()
      setFaqs(data.faqs)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [])

  useEffect(() => {
    fetchFAQs()
  }, [page, search, categoryFilter, languageFilter, statusFilter, featuredFilter])

  const handleDeleteClick = (faq: FAQ) => {
    setDeleteDialog({
      isOpen: true,
      faq: faq
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.faq) {
      return
    }

    try {
      const response = await fetch(`/api/admin/faqs/${deleteDialog.faq.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete FAQ')
      }

      // Close dialog and refresh the list
      setDeleteDialog({ isOpen: false, faq: null })
      fetchFAQs()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete FAQ')
      setDeleteDialog({ isOpen: false, faq: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, faq: null })
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    )
  }

  const getLanguageName = (code: string) => {
    const language = options.languages.find(lang => lang.code === code)
    return language ? language.name : code.toUpperCase()
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions on the platform
          </p>
        </div>
        <Link href="/admin/faqs/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search questions, answers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {options.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All languages</SelectItem>
                  {options.languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {options.statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Featured</label>
              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Featured</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>FAQs List</CardTitle>
              <CardDescription>
                {pagination.total} total FAQs
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading FAQs...</div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-32 flex items-center justify-center">
              Error: {error}
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center text-muted-foreground h-32 flex items-center justify-center">
              No FAQs found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq) => (
                  <TableRow key={faq.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {truncateText(faq.question, 60)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {truncateText(faq.answer, 80)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{faq.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {getLanguageName(faq.language)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{faq.order_index}</span>
                    </TableCell>
                    <TableCell>
                      {faq.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(faq.is_active)}
                    </TableCell>
                    <TableCell>
                      {new Date(faq.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin/faqs/${faq.id}`}>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/admin/faqs/${faq.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(faq)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!loading && !error && faqs.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} FAQs
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={handleDeleteCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deleteDialog.faq && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">FAQ to be deleted:</h4>
                <p className="text-sm font-medium">{deleteDialog.faq.question}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Category: {deleteDialog.faq.category} • Language: {getLanguageName(deleteDialog.faq.language)}
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