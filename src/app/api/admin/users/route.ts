import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'
import type { CreateUserData, UserFilters } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: UserFilters = {
      role: searchParams.get('role') as any || undefined,
      status: searchParams.get('status') as any || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 20
    }

    const result = await UserService.getUsers(filters)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Basic validation
    if (!body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    const userData: CreateUserData = {
      email: body.email,
      password: body.password,
      role: body.role,
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      preferred_language: body.preferred_language || 'en',
      clinic_id: body.clinic_id
    }

    const result = await UserService.createUser(userData)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 