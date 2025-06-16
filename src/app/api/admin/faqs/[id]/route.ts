import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const { data: faq, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'FAQ not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching FAQ:', error);
      return NextResponse.json(
        { error: 'Failed to fetch FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json(faq);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Include only fields that are present in the request body
    const allowedFields = [
      'category', 'question', 'answer', 'language', 'order_index', 
      'is_featured', 'is_active'
    ];

    allowedFields.forEach(field => {
      if (body.hasOwnProperty(field)) {
        updateData[field] = body[field];
      }
    });

    const { data: faq, error } = await supabase
      .from('faqs')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'FAQ not found' },
          { status: 404 }
        );
      }
      console.error('Error updating FAQ:', error);
      return NextResponse.json(
        { error: 'Failed to update FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json(faq);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    // First check if the FAQ exists
    const { data: existingFaq, error: fetchError } = await supabase
      .from('faqs')
      .select('id, question')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'FAQ not found' },
          { status: 404 }
        );
      }
      console.error('Error checking FAQ existence:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check FAQ existence' },
        { status: 500 }
      );
    }

    // Delete the FAQ
    const { error: deleteError } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting FAQ:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'FAQ deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 