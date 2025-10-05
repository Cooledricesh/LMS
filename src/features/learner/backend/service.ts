import type { SupabaseClient } from '@supabase/supabase-js';
import type { EnrolledCourse } from './schema';

export class LearnerService {
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * 사용자의 수강 중인 코스 목록 조회
   */
  async getEnrolledCourses(learnerId: string): Promise<EnrolledCourse[]> {
    const { data: enrollments, error } = await this.supabase
      .from('enrollments')
      .select(`
        id,
        learner_id,
        course_id,
        progress,
        enrolled_at,
        completed_at,
        last_accessed_at,
        courses (
          id,
          title,
          description,
          thumbnail,
          category,
          difficulty,
          instructor_id,
          profiles!courses_instructor_id_fkey (
            id,
            name,
            email
          )
        )
      `)
      .eq('learner_id', learnerId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch enrolled courses: ${error.message}`);
    }

    if (!enrollments) {
      return [];
    }

    // 데이터 형식 변환
    return enrollments.map((enrollment: any) => ({
      id: enrollment.id,
      learner_id: enrollment.learner_id,
      course_id: enrollment.course_id,
      progress: enrollment.progress || 0,
      enrolled_at: enrollment.enrolled_at,
      completed_at: enrollment.completed_at,
      last_accessed_at: enrollment.last_accessed_at,
      course: {
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        description: enrollment.courses.description,
        thumbnail: enrollment.courses.thumbnail,
        category: enrollment.courses.category,
        difficulty: enrollment.courses.difficulty,
        instructor: {
          id: enrollment.courses.profiles.id,
          name: enrollment.courses.profiles.name,
          email: enrollment.courses.profiles.email,
        },
      },
    }));
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