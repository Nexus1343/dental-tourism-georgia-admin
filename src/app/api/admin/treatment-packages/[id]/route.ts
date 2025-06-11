import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: treatmentPackage, error } = await supabase
      .from('treatment_packages')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching treatment package:', error);
      return NextResponse.json(
        { error: 'Treatment package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(treatmentPackage);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Basic validation
    const requiredFields = ['name', 'treatment_ids', 'total_base_price'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate treatment_ids is an array
    if (!Array.isArray(body.treatment_ids) || body.treatment_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one treatment must be selected' },
        { status: 400 }
      );
    }

    // Validate price is a positive number
    if (typeof body.total_base_price !== 'number' || body.total_base_price <= 0) {
      return NextResponse.json(
        { error: 'Total base price must be a positive number' },
        { status: 400 }
      );
    }

    // Prepare package data
    const packageData = {
      clinic_id: body.clinic_id || null,
      name: body.name,
      description: body.description || null,
      treatment_ids: body.treatment_ids,
      total_base_price: body.total_base_price,
      discount_percentage: body.discount_percentage || 0,
      min_duration_days: body.min_duration_days || null,
      max_duration_days: body.max_duration_days || null,
      includes_accommodation: body.includes_accommodation || false,
      includes_transportation: body.includes_transportation || false,
      includes_tourism: body.includes_tourism || false,
      package_benefits: body.package_benefits || [],
      terms_and_conditions: body.terms_and_conditions || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      updated_at: new Date().toISOString()
    };

    const { data: treatmentPackage, error } = await supabase
      .from('treatment_packages')
      .update(packageData)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating treatment package:', error);
      return NextResponse.json(
        { error: 'Failed to update treatment package' },
        { status: 500 }
      );
    }

    return NextResponse.json(treatmentPackage);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('treatment_packages')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting treatment package:', error);
      return NextResponse.json(
        { error: 'Failed to delete treatment package' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 