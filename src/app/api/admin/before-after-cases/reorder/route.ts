import { NextRequest, NextResponse } from 'next/server'
import { BeforeAfterCaseService } from '@/lib/database'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!Array.isArray(body.cases)) {
      return NextResponse.json(
        { error: 'Cases array is required' },
        { status: 400 }
      )
    }

    // Validate the cases array structure
    for (const caseUpdate of body.cases) {
      if (!caseUpdate.id || typeof caseUpdate.display_order !== 'number') {
        return NextResponse.json(
          { error: 'Each case must have id and display_order' },
          { status: 400 }
        )
      }
    }

    await BeforeAfterCaseService.reorder(body.cases)
    
    return NextResponse.json({ message: 'Cases reordered successfully' })
  } catch (error) {
    console.error('Error reordering before-after cases:', error)
    return NextResponse.json(
      { error: 'Failed to reorder before-after cases' },
      { status: 500 }
    )
  }
} 