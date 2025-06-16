import { NextRequest, NextResponse } from 'next/server'
import { BeforeAfterCaseService } from '@/lib/database'
import { UpdateBeforeAfterCase } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const beforeAfterCase = await BeforeAfterCaseService.getById(params.id)
    
    if (!beforeAfterCase) {
      return NextResponse.json(
        { error: 'Before-after case not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(beforeAfterCase)
  } catch (error) {
    console.error('Error fetching before-after case:', error)
    return NextResponse.json(
      { error: 'Failed to fetch before-after case' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updateData: UpdateBeforeAfterCase = {
      title: body.title,
      treatment_name: body.treatment_name,
      treatment_description: body.treatment_description,
      before_image_url: body.before_image_url,
      after_image_url: body.after_image_url,
      status: body.status,
      display_order: body.display_order
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof UpdateBeforeAfterCase] === undefined) {
        delete updateData[key as keyof UpdateBeforeAfterCase]
      }
    })

    const updatedCase = await BeforeAfterCaseService.update(params.id, updateData)
    
    return NextResponse.json(updatedCase)
  } catch (error) {
    console.error('Error updating before-after case:', error)
    return NextResponse.json(
      { error: 'Failed to update before-after case' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await BeforeAfterCaseService.delete(params.id)
    
    return NextResponse.json({ message: 'Before-after case deleted successfully' })
  } catch (error) {
    console.error('Error deleting before-after case:', error)
    return NextResponse.json(
      { error: 'Failed to delete before-after case' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Handle status updates
    if (body.status) {
      const updatedCase = await BeforeAfterCaseService.updateStatus(params.id, body.status)
      return NextResponse.json(updatedCase)
    }
    
    // Handle other partial updates
    const updateData: UpdateBeforeAfterCase = body
    const updatedCase = await BeforeAfterCaseService.update(params.id, updateData)
    
    return NextResponse.json(updatedCase)
  } catch (error) {
    console.error('Error updating before-after case:', error)
    return NextResponse.json(
      { error: 'Failed to update before-after case' },
      { status: 500 }
    )
  }
} 