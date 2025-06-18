import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/admin/clinics/[id] - Get a single clinic by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      )
    }

    const { data: clinic, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching clinic:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Clinic not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch clinic' },
        { status: 500 }
      )
    }

    return NextResponse.json(clinic)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/clinics/[id] - Update a clinic
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      )
    }

    // Remove id from the update data to prevent conflicts
    const { id: _, ...updateData } = body

    // Update the clinic
    const { data: clinic, error } = await supabase
      .from('clinics')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating clinic:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Clinic not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to update clinic' },
        { status: 500 }
      )
    }

    return NextResponse.json(clinic)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/clinics/[id] - Delete a clinic
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      )
    }

    // First check if clinic exists
    const { data: existingClinic, error: fetchError } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Clinic not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to verify clinic exists' },
        { status: 500 }
      )
    }

    // Delete the clinic
    const { error: deleteError } = await supabase
      .from('clinics')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting clinic:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete clinic' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Clinic deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 