'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SubmissionStatusBadge } from '@/components/admin/questionnaire-submissions/SubmissionStatusBadge';
import { SubmissionTableSkeleton } from '@/components/admin/questionnaire-submissions/SubmissionTableSkeleton';
import { EmptySubmissionsState } from '@/components/admin/questionnaire-submissions/EmptySubmissionsState';
import { ClipboardList, Filter, AlertCircle } from 'lucide-react';

function buildQueryString(params: Record<string, any>) {
  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== '' && v !== 'all')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return query ? `?${query}` : '';
}

async function fetchSubmissions({ page, pageSize, is_complete, template_name }: any) {
  const query = buildQueryString({ page, pageSize, is_complete, template_name });
  const res = await fetch(`/api/admin/questionnaire-submissions${query}`);
  if (!res.ok) throw new Error('Failed to fetch submissions');
  const { data, count } = await res.json();
  return { data, count };
}

export default function QuestionnaireSubmissionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 20;
  const is_complete = searchParams.get('is_complete') || 'all';
  const template_name = searchParams.get('template_name') || '';

  const hasFilters = is_complete !== 'all' || template_name !== '';

  useEffect(() => {
    setLoading(true);
    fetchSubmissions({ page, pageSize, is_complete, template_name })
      .then(result => {
        setSubmissions(result.data);
        setCount(result.count);
        setError(null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, is_complete, template_name]);

  const totalPages = Math.ceil(count / pageSize);

  function buildPageUrl(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    return `/admin/questionnaire-submissions?${params.toString()}`;
  }

  function buildFilterUrl(newFilters: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([k, v]) => params.set(k, v));
    params.set('page', '1');
    return `/admin/questionnaire-submissions?${params.toString()}`;
  }

  function clearFilters() {
    router.push('/admin/questionnaire-submissions');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClipboardList className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Submissions</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {count} {count === 1 ? 'submission' : 'submissions'}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="is_complete">Status</Label>
              <Select value={is_complete} onValueChange={v => router.push(buildFilterUrl({ is_complete: v }))}>
                <SelectTrigger id="is_complete">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Complete</SelectItem>
                  <SelectItem value="false">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_name">Template Name</Label>
              <Input
                id="template_name"
                value={template_name}
                placeholder="Search by template name..."
                onChange={e => router.push(buildFilterUrl({ template_name: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Error loading submissions</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {loading ? (
        <SubmissionTableSkeleton />
      ) : submissions.length === 0 ? (
        <EmptySubmissionsState hasFilters={hasFilters} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-lg border-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead Reference</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Completion %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{s.lead_reference}</span>
                          {s.lead_source && (
                            <span className="text-xs text-muted-foreground">
                              from {s.lead_source}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{s.template_name}</span>
                          {s.template_language && (
                            <span className="text-xs text-muted-foreground">
                              {s.template_language}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{s.completion_percentage}%</span>
                          <span className="text-xs text-muted-foreground">
                            {s.progress_level} progress
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <SubmissionStatusBadge 
                          isComplete={s.is_complete} 
                          completionPercentage={s.completion_percentage} 
                        />
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{s.time_spent_formatted}</span>
                          <span className="text-xs text-muted-foreground">
                            {s.browser}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col">
                          <span>{new Date(s.created_at).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {s.submission_age}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/admin/questionnaire-submissions/${s.id}`} 
                          className="text-primary hover:underline font-medium"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && submissions.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, count)} of {count} submissions
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 1} 
              onClick={() => router.push(buildPageUrl(page - 1))}
            >
              Previous
            </Button>
            <span className="text-sm px-2">
              Page {page} of {totalPages || 1}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages} 
              onClick={() => router.push(buildPageUrl(page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 