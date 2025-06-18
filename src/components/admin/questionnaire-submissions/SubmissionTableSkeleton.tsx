'use client'

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

export function SubmissionTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border">
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
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="h-4 bg-muted rounded animate-pulse w-32" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded animate-pulse w-32" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded animate-pulse w-32" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded animate-pulse w-12" />
              </TableCell>
              <TableCell>
                <div className="h-6 bg-muted rounded-full animate-pulse w-20" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded animate-pulse w-24" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded animate-pulse w-12" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 