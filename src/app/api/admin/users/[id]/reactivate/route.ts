import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const result = await UserService.reactivateUser(params.id)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in POST /api/admin/users/[id]/reactivate:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate user' },
      { status: 500 }
    )
  }
} 