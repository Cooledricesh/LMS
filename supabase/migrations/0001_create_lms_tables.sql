-- 0001_create_lms_tables.sql
-- LMS 시스템 핵심 테이블 생성

BEGIN;

-- ============================================
-- 1. Profiles 테이블 (Supabase Auth 확장)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('learner', 'instructor')),
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    terms_agreed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- 2. Courses 테이블 (코스)
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses 인덱스
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- ============================================
-- 3. Enrollments 테이블 (수강신청)
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_enrollment UNIQUE(course_id, learner_id)
);

-- Enrollments 인덱스
CREATE INDEX IF NOT EXISTS idx_enrollments_learner ON enrollments(learner_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- ============================================
-- 4. Assignments 테이블 (과제)
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight >= 0 AND weight <= 100),
    allow_late BOOLEAN DEFAULT FALSE,
    allow_resubmission BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments 인덱스
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

-- ============================================
-- 5. Submissions 테이블 (제출물)
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    link TEXT,
    is_late BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmission_required')),
    score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_submission UNIQUE(assignment_id, learner_id)
);

-- Submissions 인덱스
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_learner ON submissions(learner_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- ============================================
-- Updated_at 자동 업데이트 함수
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 각 테이블에 Updated_at 트리거 적용
-- ============================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assignments_updated_at ON assignments;
CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS 비활성화 (프로젝트 요구사항)
-- ============================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 테이블 및 컬럼 설명 추가
-- ============================================
COMMENT ON TABLE profiles IS 'LMS 사용자 프로필 정보';
COMMENT ON COLUMN profiles.role IS '사용자 역할: learner(학습자) 또는 instructor(강사)';
COMMENT ON COLUMN profiles.terms_agreed_at IS '서비스 약관 동의 시각';

COMMENT ON TABLE courses IS '강사가 개설한 코스 정보';
COMMENT ON COLUMN courses.status IS '코스 상태: draft(초안), published(게시됨), archived(보관됨)';
COMMENT ON COLUMN courses.difficulty IS '코스 난이도: beginner(초급), intermediate(중급), advanced(고급)';

COMMENT ON TABLE enrollments IS '학습자의 코스 수강신청 정보';
COMMENT ON COLUMN enrollments.enrolled_at IS '수강신청 시각';

COMMENT ON TABLE assignments IS '코스별 과제 정보';
COMMENT ON COLUMN assignments.weight IS '전체 성적에서 차지하는 비중 (0-100%)';
COMMENT ON COLUMN assignments.allow_late IS '마감일 이후 지각 제출 허용 여부';
COMMENT ON COLUMN assignments.allow_resubmission IS '재제출 허용 여부';
COMMENT ON COLUMN assignments.status IS '과제 상태: draft(초안), published(게시됨), closed(마감됨)';

COMMENT ON TABLE submissions IS '학습자의 과제 제출물';
COMMENT ON COLUMN submissions.content IS '제출 내용 (텍스트, 필수)';
COMMENT ON COLUMN submissions.link IS '제출 링크 (URL, 선택)';
COMMENT ON COLUMN submissions.is_late IS '지각 제출 여부';
COMMENT ON COLUMN submissions.status IS '제출물 상태: submitted(제출됨), graded(채점완료), resubmission_required(재제출요청)';
COMMENT ON COLUMN submissions.score IS '획득 점수 (0-100)';
COMMENT ON COLUMN submissions.feedback IS '강사 피드백';

COMMIT;