import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import {
  GradeItemSchema,
  CourseSummarySchema,
  GradesResponseSchema,
  ProfileRowSchema,
  EnrollmentRowSchema,
  CourseRowSchema,
  AssignmentRowSchema,
  SubmissionRowSchema,
  type GradeItem,
  type CourseSummary,
  type GradesResponse,
} from './schema';
import { gradesErrorCodes, type GradesServiceError } from './error';

const PROFILES_TABLE = 'profiles';
const ENROLLMENTS_TABLE = 'enrollments';
const COURSES_TABLE = 'courses';
const ASSIGNMENTS_TABLE = 'assignments';
const SUBMISSIONS_TABLE = 'submissions';

/**
 * 학습자 성적 조회 및 코스별 총점 계산
 */
export const getLearnerGrades = async (
  client: SupabaseClient,
  learnerId: string
): Promise<HandlerResult<GradesResponse, GradesServiceError, unknown>> => {
  try {
    // 1. learner 프로필 조회 및 권한 검증
    const { data: profileData, error: profileError } = await client
      .from(PROFILES_TABLE)
      .select('id, name, role')
      .eq('id', learnerId)
      .single();

    if (profileError || !profileData) {
      return failure(401, gradesErrorCodes.unauthorized, '인증이 필요합니다');
    }

    const profileValidation = ProfileRowSchema.safeParse(profileData);
    if (!profileValidation.success || profileValidation.data.role !== 'learner') {
      return failure(403, gradesErrorCodes.invalidRole, '학습자 권한이 필요합니다');
    }

    // 2. 학습자가 등록한 코스 목록 조회
    const { data: enrollmentsData, error: enrollmentsError } = await client
      .from(ENROLLMENTS_TABLE)
      .select('id, course_id, learner_id')
      .eq('learner_id', learnerId);

    if (enrollmentsError) {
      console.error('Enrollments query error:', enrollmentsError);
      return failure(500, gradesErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
    }

    if (!enrollmentsData || enrollmentsData.length === 0) {
      return success({ grades: [], courseSummaries: [] });
    }

    const enrollments = enrollmentsData
      .map(e => EnrollmentRowSchema.safeParse(e))
      .filter(v => v.success)
      .map(v => v.data);

    const courseIds = enrollments.map(e => e.course_id);

    // 3. 등록한 코스 정보 조회
    const { data: coursesData, error: coursesError } = await client
      .from(COURSES_TABLE)
      .select('id, title, instructor_id')
      .in('id', courseIds);

    if (coursesError || !coursesData) {
      console.error('Courses query error:', coursesError);
      return failure(500, gradesErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
    }

    const courses = coursesData
      .map(c => CourseRowSchema.safeParse(c))
      .filter(v => v.success)
      .map(v => v.data);

    // 4. 코스별 과제 조회 (published, closed만)
    const { data: assignmentsData, error: assignmentsError } = await client
      .from(ASSIGNMENTS_TABLE)
      .select('id, course_id, title, weight, status')
      .in('course_id', courseIds)
      .in('status', ['published', 'closed']);

    if (assignmentsError) {
      console.error('Assignments query error:', assignmentsError);
      return failure(500, gradesErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
    }

    const assignments = (assignmentsData || [])
      .map(a => AssignmentRowSchema.safeParse(a))
      .filter(v => v.success)
      .map(v => v.data);

    if (assignments.length === 0) {
      return success({ grades: [], courseSummaries: [] });
    }

    const assignmentIds = assignments.map(a => a.id);

    // 5. 학습자의 제출물 조회
    const { data: submissionsData, error: submissionsError } = await client
      .from(SUBMISSIONS_TABLE)
      .select('id, assignment_id, learner_id, status, score, feedback, is_late, submitted_at, graded_at')
      .eq('learner_id', learnerId)
      .in('assignment_id', assignmentIds);

    if (submissionsError) {
      console.error('Submissions query error:', submissionsError);
      return failure(500, gradesErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
    }

    const submissions = (submissionsData || [])
      .map(s => SubmissionRowSchema.safeParse(s))
      .filter(v => v.success)
      .map(v => v.data);

    // 6. 성적 데이터 구성
    const grades: GradeItem[] = [];
    const courseSummaryMap = new Map<string, { courseTitle: string; totalScore: number; totalWeight: number; gradedCount: number; totalCount: number }>();

    for (const assignment of assignments) {
      const course = courses.find(c => c.id === assignment.course_id);
      if (!course) continue;

      const submission = submissions.find(s => s.assignment_id === assignment.id);

      const gradeItem: GradeItem = {
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        assignmentWeight: assignment.weight,
        courseId: course.id,
        courseTitle: course.title,
        submissionId: submission?.id || null,
        status: submission ? submission.status : 'not_submitted',
        score: submission?.score || null,
        feedback: submission?.feedback || null,
        isLate: submission?.is_late || false,
        submittedAt: submission?.submitted_at || null,
        gradedAt: submission?.graded_at || null,
      };

      const validatedGradeItem = GradeItemSchema.safeParse(gradeItem);
      if (validatedGradeItem.success) {
        grades.push(validatedGradeItem.data);

        // 코스별 총점 계산 준비
        if (!courseSummaryMap.has(course.id)) {
          courseSummaryMap.set(course.id, {
            courseTitle: course.title,
            totalScore: 0,
            totalWeight: 0,
            gradedCount: 0,
            totalCount: 0,
          });
        }

        const summary = courseSummaryMap.get(course.id)!;
        summary.totalCount += 1;

        if (submission && submission.status === 'graded' && submission.score !== null) {
          summary.totalScore += submission.score * assignment.weight;
          summary.totalWeight += assignment.weight;
          summary.gradedCount += 1;
        }
      }
    }

    // 7. 코스별 총점 요약 생성
    const courseSummaries: CourseSummary[] = [];
    for (const [courseId, summary] of courseSummaryMap.entries()) {
      const totalScore = summary.totalWeight > 0 ? summary.totalScore / summary.totalWeight : null;

      const courseSummary: CourseSummary = {
        courseId,
        courseTitle: summary.courseTitle,
        totalScore,
        gradedCount: summary.gradedCount,
        totalCount: summary.totalCount,
      };

      const validatedSummary = CourseSummarySchema.safeParse(courseSummary);
      if (validatedSummary.success) {
        courseSummaries.push(validatedSummary.data);
      }
    }

    // 8. 응답 생성
    const response: GradesResponse = {
      grades,
      courseSummaries,
    };

    const responseValidation = GradesResponseSchema.safeParse(response);
    if (!responseValidation.success) {
      console.error('Response validation failed:', responseValidation.error);
      return failure(500, gradesErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
    }

    return success(responseValidation.data);
  } catch (error) {
    console.error('성적 조회 중 오류:', error);
    return failure(500, gradesErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
  }
};
