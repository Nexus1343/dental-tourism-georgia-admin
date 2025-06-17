import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: treatment, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching treatment:', error);
      return NextResponse.json(
        { error: 'Treatment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(treatment);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Basic validation
    const requiredFields = ['name', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Generate slug from name if not provided
    const slug = body.slug || body.name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Prepare treatment data
    const treatmentData = {
      name: body.name,
      slug: slug,
      category: body.category,
      description: body.description || null,
      procedure_details: body.procedure_details || null,
      duration_minutes: body.duration_minutes || null,
      recovery_time_days: body.recovery_time_days || null,
      anesthesia_required: body.anesthesia_required || false,
      requirements: body.requirements || [],
      contraindications: body.contraindications || [],
      benefits: body.benefits || [],
      risks: body.risks || [],
      aftercare_instructions: body.aftercare_instructions || null,
      images: body.images || [],
      base_price: body.base_price || null,
      currency: body.currency || 'USD',
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
      seo_keywords: body.seo_keywords || [],
      is_active: body.is_active !== undefined ? body.is_active : true,
      updated_at: new Date().toISOString()
    };

    const { data: treatment, error } = await supabase
      .from('treatments')
      .update(treatmentData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating treatment:', error);
      return NextResponse.json(
        { error: 'Failed to update treatment' },
        { status: 500 }
      );
    }

    return NextResponse.json(treatment);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('treatments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting treatment:', error);
      return NextResponse.json(
        { error: 'Failed to delete treatment' },
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