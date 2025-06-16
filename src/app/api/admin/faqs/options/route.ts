import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch existing categories from the database
    const { data: categories, error: categoriesError } = await supabase
      .from('faqs')
      .select('category')
      .eq('is_active', true);

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    }

    // Get unique categories
    const uniqueCategories = [...new Set(categories?.map(faq => faq.category) || [])];

    // Language options
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'ka', name: 'Georgian' },
      { code: 'ru', name: 'Russian' },
      { code: 'de', name: 'German' },
      { code: 'fr', name: 'French' },
      { code: 'es', name: 'Spanish' },
      { code: 'it', name: 'Italian' },
      { code: 'tr', name: 'Turkish' },
      { code: 'ar', name: 'Arabic' }
    ];

    // Status options
    const statusOptions = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ];

    // Common FAQ categories (in case the database is empty)
    const commonCategories = [
      'General',
      'Treatments',
      'Booking',
      'Payment',
      'Travel',
      'Accommodation',
      'Insurance',
      'Recovery',
      'Costs',
      'Clinic Information'
    ];

    // Combine existing categories with common ones
    const allCategories = [...new Set([...uniqueCategories, ...commonCategories])];

    return NextResponse.json({
      categories: allCategories,
      languages,
      statusOptions,
      success: true
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
} 