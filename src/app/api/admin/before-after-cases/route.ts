import { NextRequest, NextResponse } from 'next/server'
import { BeforeAfterCaseService } from '@/lib/database'
import { BeforeAfterCaseFilters, CreateBeforeAfterCase } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: BeforeAfterCaseFilters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as any || undefined,
      treatment_name: searchParams.get('treatment_name') || undefined,
      sortBy: searchParams.get('sortBy') || 'display_order',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    }

    const result = await BeforeAfterCaseService.getAll(filters)
    
    return NextResponse.json({
      cases: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching before-after cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch before-after cases' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['title', 'treatment_name', 'treatment_description', 'before_image_url', 'after_image_url']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    const caseData: CreateBeforeAfterCase = {
      title: body.title,
      treatment_name: body.treatment_name,
      treatment_description: body.treatment_description,
      before_image_url: body.before_image_url,
      after_image_url: body.after_image_url,
      status: body.status || 'active',
      display_order: body.display_order
    }

    const newCase = await BeforeAfterCaseService.create(caseData)
    
    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error('Error creating before-after case:', error)
    return NextResponse.json(
      { error: 'Failed to create before-after case' },
      { status: 500 }
    )
  }
} 