-- Add progress and additional fields to enrollments table
-- These fields are needed for tracking learner progress in courses

-- Add progress field (0-100)
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);

-- Add completed_at field
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add last_accessed_at field
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN enrollments.progress IS '수강 진행률 (0-100)';
COMMENT ON COLUMN enrollments.completed_at IS '수료 완료 시각';
COMMENT ON COLUMN enrollments.last_accessed_at IS '마지막 접속 시각';

-- Create index for finding in-progress courses
CREATE INDEX IF NOT EXISTS idx_enrollments_progress ON enrollments(progress) WHERE progress > 0 AND progress < 100;

-- Create index for completed courses
CREATE INDEX IF NOT EXISTS idx_enrollments_completed ON enrollments(completed_at) WHERE completed_at IS NOT NULL;