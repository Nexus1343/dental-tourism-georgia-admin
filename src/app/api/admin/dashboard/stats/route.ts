import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Execute all queries in parallel for better performance
    const [
      templatesResult,
      clinicsResult,
      doctorsResult,
      treatmentsResult,
      treatmentPackagesResult,
      faqsResult,
      reviewsResult,
      submissionsResult,
      blogPostsResult,
      beforeAfterResult,
      usersResult,
      recentActivityResult
    ] = await Promise.all([
      // Templates statistics
      supabase
        .from('questionnaire_templates')
        .select('id, is_active, created_at')
        .order('created_at', { ascending: false }),

      // Clinics statistics  
      supabase
        .from('clinics')
        .select('id, status, created_at')
        .order('created_at', { ascending: false }),

      // Doctors statistics
      supabase
        .from('doctors')
        .select('id, status, created_at')
        .order('created_at', { ascending: false }),

      // Treatments statistics
      supabase
        .from('treatments')
        .select('id, is_active, created_at')
        .order('created_at', { ascending: false }),

      // Treatment packages statistics
      supabase
        .from('treatment_packages')
        .select('id, is_active, created_at')
        .order('created_at', { ascending: false }),

      // FAQs statistics
      supabase
        .from('faqs')
        .select('id, is_active, created_at')
        .order('created_at', { ascending: false }),

      // Patient reviews statistics
      supabase
        .from('patient_reviews')
        .select('id, is_active, rating, created_at')
        .order('created_at', { ascending: false }),

      // Submissions statistics
      supabase
        .from('questionnaire_submissions')
        .select('id, created_at, is_complete')
        .order('created_at', { ascending: false }),

      // Blog posts statistics
      supabase
        .from('blog_posts')
        .select('id, status, created_at')
        .order('created_at', { ascending: false }),

      // Before & After cases statistics
      supabase
        .from('before_after_cases')
        .select('id, status, created_at')
        .order('created_at', { ascending: false }),

      // Users statistics
      supabase
        .from('users')
        .select('id, status, role, created_at')
        .order('created_at', { ascending: false }),

      // Recent activity across all entities (last 5 items)
      Promise.all([
        supabase
          .from('questionnaire_templates')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(2),
        supabase
          .from('questionnaire_submissions')
          .select('id, created_at')
          .order('created_at', { ascending: false })
          .limit(3)
      ])
    ]);

    // Check for errors
    const errors = [
      templatesResult.error,
      clinicsResult.error,
      doctorsResult.error,
      treatmentsResult.error,
      treatmentPackagesResult.error,
      faqsResult.error,
      reviewsResult.error,
      submissionsResult.error,
      blogPostsResult.error,
      beforeAfterResult.error,
      usersResult.error
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('Dashboard stats errors:', errors);
      return NextResponse.json(
        { error: 'Failed to fetch some statistics' },
        { status: 500 }
      );
    }

    // Process the data
    const templates = templatesResult.data || [];
    const clinics = clinicsResult.data || [];
    const doctors = doctorsResult.data || [];
    const treatments = treatmentsResult.data || [];
    const treatmentPackages = treatmentPackagesResult.data || [];
    const faqs = faqsResult.data || [];
    const reviews = reviewsResult.data || [];
    const submissions = submissionsResult.data || [];
    const blogPosts = blogPostsResult.data || [];
    const beforeAfterCases = beforeAfterResult.data || [];
    const users = usersResult.data || [];

    // Calculate statistics
    const stats = {
      // Primary metrics
      totalSubmissions: submissions.length,
      completedSubmissions: submissions.filter(s => s.is_complete).length,
      completionRate: submissions.length > 0 
        ? Math.round((submissions.filter(s => s.is_complete).length / submissions.length) * 100)
        : 0,
      
      // Entity counts
      entities: {
        templates: {
          total: templates.length,
          active: templates.filter(t => t.is_active).length,
          inactive: templates.filter(t => !t.is_active).length
        },
        clinics: {
          total: clinics.length,
          active: clinics.filter(c => c.status === 'active').length,
          inactive: clinics.filter(c => c.status === 'inactive').length,
          pending: clinics.filter(c => c.status === 'pending').length
        },
        doctors: {
          total: doctors.length,
          active: doctors.filter(d => d.status === 'active').length,
          inactive: doctors.filter(d => d.status === 'inactive').length
        },
        treatments: {
          total: treatments.length,
          active: treatments.filter(t => t.is_active).length,
          inactive: treatments.filter(t => !t.is_active).length
        },
        treatmentPackages: {
          total: treatmentPackages.length,
          active: treatmentPackages.filter(tp => tp.is_active).length,
          inactive: treatmentPackages.filter(tp => !tp.is_active).length
        },
        faqs: {
          total: faqs.length,
          active: faqs.filter(f => f.is_active).length,
          inactive: faqs.filter(f => !f.is_active).length
        },
        reviews: {
          total: reviews.length,
          active: reviews.filter(r => r.is_active).length,
          inactive: reviews.filter(r => !r.is_active).length,
          averageRating: reviews.length > 0 
            ? Math.round((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) * 10) / 10
            : 0
        },
        blogPosts: {
          total: blogPosts.length,
          published: blogPosts.filter(bp => bp.status === 'published').length,
          draft: blogPosts.filter(bp => bp.status === 'draft').length
        },
        beforeAfterCases: {
          total: beforeAfterCases.length,
          active: beforeAfterCases.filter(bac => bac.status === 'active').length,
          inactive: beforeAfterCases.filter(bac => bac.status === 'inactive').length
        },
        users: {
          total: users.length,
          active: users.filter(u => u.status === 'active').length,
          inactive: users.filter(u => u.status === 'inactive').length,
          superAdmins: users.filter(u => u.role === 'super_admin').length,
          clinicAdmins: users.filter(u => u.role === 'clinic_admin').length
        }
      },

      // Recent activity
      recentActivity: [
        ...recentActivityResult[0].data?.slice(0, 2).map(template => ({
          id: template.id,
          type: 'template',
          title: `Template "${template.name}" created`,
          timestamp: template.created_at
        })) || [],
        ...recentActivityResult[1].data?.slice(0, 3).map(submission => ({
          id: submission.id,
          type: 'submission',
          title: 'New questionnaire submission',
          timestamp: submission.created_at
        })) || []
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5),

      // Growth metrics (simplified - comparing recent vs older items)
      growth: {
        submissions: calculateGrowthRate(submissions, 30), // Last 30 days
        templates: calculateGrowthRate(templates, 30),
        clinics: calculateGrowthRate(clinics, 30)
      }
    };

    return NextResponse.json({ data: stats });

  } catch (error) {
    console.error('Unexpected error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate growth rate
function calculateGrowthRate(items: any[], days: number): string {
  if (!items || items.length === 0) return '+0%';
  
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const recentCount = items.filter(item => 
    new Date(item.created_at) >= cutoffDate
  ).length;
  
  const olderCount = items.length - recentCount;
  
  if (olderCount === 0) return '+100%';
  
  const growthRate = ((recentCount - olderCount) / olderCount) * 100;
  const sign = growthRate >= 0 ? '+' : '';
  
  return `${sign}${Math.round(growthRate)}%`;
} 