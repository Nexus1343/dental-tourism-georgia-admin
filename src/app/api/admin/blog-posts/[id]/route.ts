import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: blogPost, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching blog post:', error);
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blogPost);

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
    if (!body.title || !body.main_text_body) {
      return NextResponse.json(
        { error: 'Title and main text body are required' },
        { status: 400 }
      );
    }

    // Check if blog post exists
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Generate slug if title changed and no slug provided
    let slug = body.slug;
    if (!slug && body.title !== existingPost.title) {
      slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    } else if (!slug) {
      slug = existingPost.slug;
    }

    // Check if slug is unique (excluding current post)
    if (slug !== existingPost.slug) {
      const { data: slugCheck } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (slugCheck) {
        return NextResponse.json(
          { error: 'A blog post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      title: body.title,
      slug: slug,
      short_description: body.short_description || null,
      main_text_body: body.main_text_body,
      images: body.images || existingPost.images,
      author_id: body.author_id || existingPost.author_id,
      status: body.status || existingPost.status,
      language: body.language || existingPost.language,
      tags: body.tags || existingPost.tags,
      featured_image_url: body.featured_image_url || existingPost.featured_image_url,
      is_featured: body.is_featured !== undefined ? body.is_featured : existingPost.is_featured,
      seo_title: body.seo_title || existingPost.seo_title,
      seo_description: body.seo_description || existingPost.seo_description,
      seo_keywords: body.seo_keywords || existingPost.seo_keywords,
      updated_at: new Date().toISOString()
    };

    // Update published_at if status changed to published
    if (body.status === 'published' && existingPost.status !== 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { data: updatedPost, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      return NextResponse.json(
        { error: 'Failed to update blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPost);

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

    // Check if blog post exists
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Blog post deleted successfully' });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 