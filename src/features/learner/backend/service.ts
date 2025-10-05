import type { SupabaseClient } from '@supabase/supabase-js';
import type { EnrolledCourse } from './schema';

export class LearnerService {
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * 사용자의 수강 중인 코스 목록 조회
   */
  async getEnrolledCourses(learnerId: string): Promise<EnrolledCourse[]> {
    // 먼저 enrollments 조회
    const { data: enrollments, error: enrollmentError } = await this.supabase
      .from('enrollments')
      .select('*')
      .eq('learner_id', learnerId)
      .order('enrolled_at', { ascending: false });

    if (enrollmentError) {
      throw new Error(`Failed to fetch enrollments: ${enrollmentError.message}`);
    }

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    // 각 enrollment에 대해 course 정보 조회
    const courseIds = enrollments.map(e => e.course_id);

    // 먼저 courses만 조회
    const { data: courses, error: coursesError } = await this.supabase
      .from('courses')
      .select('*')
      .in('id', courseIds);

    if (coursesError) {
      throw new Error(`Failed to fetch courses: ${coursesError.message}`);
    }

    if (!courses || courses.length === 0) {
      return [];
    }

    // instructor 정보 조회
    const instructorIds = [...new Set(courses.map(c => c.instructor_id))];
    const { data: instructors, error: instructorsError } = await this.supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', instructorIds);

    // enrollments와 courses, instructors 매핑
    const result = enrollments.map(enrollment => {
      const course = courses?.find(c => c.id === enrollment.course_id);

      if (!course) {
        return null;
      }

      const instructor = instructors?.find(i => i.id === course.instructor_id);

      return {
        id: enrollment.id,
        learner_id: enrollment.learner_id,
        course_id: enrollment.course_id,
        progress: enrollment.progress ?? 0,
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at ?? null,
        last_accessed_at: enrollment.last_accessed_at ?? null,
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail ?? null,
          category: course.category,
          difficulty: course.difficulty,
          instructor: instructor ? {
            id: instructor.id,
            name: instructor.name,
            email: instructor.email,
          } : {
            id: course.instructor_id,
            name: 'Unknown Instructor',
            email: 'unknown@example.com',
          },
        },
      };
    }).filter(Boolean) as EnrolledCourse[];

    return result;
  }

  /**
   * 수강 신청 상태 확인
   */
  async checkEnrollment(learnerId: string, courseId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('enrollments')
      .select('id')
      .eq('learner_id', learnerId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check enrollment: ${error.message}`);
    }

    return !!data;
  }

  /**
   * 수강 신청
   */
  async enrollCourse(learnerId: string, courseId: string): Promise<void> {
    const { error } = await this.supabase
      .from('enrollments')
      .insert({
        learner_id: learnerId,
        course_id: courseId,
        progress: 0,
        enrolled_at: new Date().toISOString(),
      });

    if (error) {
      if (error.code === '23505') {
        throw new Error('Already enrolled in this course');
      }
      throw new Error(`Failed to enroll course: ${error.message}`);
    }
  }

  /**
   * 수강 진행률 업데이트
   */
  async updateProgress(
    learnerId: string,
    courseId: string,
    progress: number
  ): Promise<void> {
    const updateData: any = {
      progress,
      last_accessed_at: new Date().toISOString(),
    };

    // 100% 완료 시 completed_at 설정
    if (progress === 100) {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from('enrollments')
      .update(updateData)
      .eq('learner_id', learnerId)
      .eq('course_id', courseId);

    if (error) {
      throw new Error(`Failed to update progress: ${error.message}`);
    }
  }
}