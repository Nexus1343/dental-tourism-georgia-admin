'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FileText, Search } from 'lucide-react'

interface EmptySubmissionsStateProps {
  hasFilters?: boolean
}

export function EmptySubmissionsState({ hasFilters = false }: EmptySubmissionsStateProps) {
  if (hasFilters) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-3 bg-muted rounded-full mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            No questionnaire submissions match your current filters. Try adjusting your search criteria or clearing the filters.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="p-3 bg-muted rounded-full mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          No questionnaire submissions have been created yet. Submissions will appear here once patients start filling out questionnaires.
        </p>
      </CardContent>
    </Card>
  )
} 