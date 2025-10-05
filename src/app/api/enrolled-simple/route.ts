import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Enrolled Simple API ===');

    // Authorization 헤더 확인
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'No authorization token'
      }, { status: 401 });
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('User:', user?.email, 'Error:', authError?.message);

    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 });
    }

    // Enrollments 조회
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('learner_id', user.id);

    console.log('Enrollments count:', enrollments?.length, 'Error:', enrollError?.message);

    if (enrollError) {
      throw enrollError;
    }

    // Courses 조회
    if (enrollments && enrollments.length > 0) {
      const courseIds = enrollments.map(e => e.course_id);
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds);

      console.log('Courses count:', courses?.length, 'Error:', coursesError?.message);

      // 결과 매핑
      const result = enrollments.map(enrollment => {
        const course = courses?.find(c => c.id === enrollment.course_id);
        return {
          id: enrollment.id,
          learner_id: enrollment.learner_id,
          course_id: enrollment.course_id,
          progress: enrollment.progress || 0,
          enrolled_at: enrollment.enrolled_at,
          course: course ? {
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            category: course.category,
            difficulty: course.difficulty,
            instructor: {
              id: course.instructor_id,
              name: 'Instructor Name',
              email: 'instructor@example.com'
            }
          } : null
        };
      }).filter(e => e.course !== null);

      return NextResponse.json(result);
    }

    return NextResponse.json([]);

  } catch (error) {
    console.error('Enrolled Simple error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}