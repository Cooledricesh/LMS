-- Add thumbnail column to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- Update existing courses with sample thumbnails
UPDATE courses
SET thumbnail = 'https://picsum.photos/seed/' || id || '/800/400'
WHERE thumbnail IS NULL;

COMMENT ON COLUMN courses.thumbnail IS 'Course thumbnail image URL';