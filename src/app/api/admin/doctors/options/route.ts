import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch users that can be linked to doctors
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        status
      `)
      .eq('status', 'active')
      .order('first_name', { ascending: true });

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    // Fetch active clinics
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select(`
        id,
        name,
        city,
        country,
        status
      `)
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (clinicsError) {
      console.error('Error fetching clinics:', clinicsError);
    }

    // Specializations based on database enum values
    const specializations = [
      { value: 'general_dentist', label: 'General Dentistry' },
      { value: 'orthodontist', label: 'Orthodontics' },
      { value: 'oral_surgeon', label: 'Oral Surgery' },
      { value: 'endodontist', label: 'Endodontics' },
      { value: 'periodontist', label: 'Periodontics' },
      { value: 'prosthodontist', label: 'Prosthodontics' },
      { value: 'pediatric_dentist', label: 'Pediatric Dentistry' },
      { value: 'oral_pathologist', label: 'Oral Pathology' },
      { value: 'implantologist', label: 'Dental Implants' },
      { value: 'cosmetic_dentist', label: 'Cosmetic Dentistry' }
    ];

    // Doctor status options (from the enum)
    const statusOptions = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'on_leave', label: 'On Leave' },
      { value: 'suspended', label: 'Suspended' }
    ];

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

    // Professional titles
    const titles = [
      'Dr.',
      'Prof.',
      'Prof. Dr.',
      'DDS',
      'DMD',
      'BDS',
      'DDS, MS',
      'DMD, PhD'
    ];

    return NextResponse.json({
      users: users || [],
      clinics: clinics || [],
      specializations,
      statusOptions,
      languages,
      titles,
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