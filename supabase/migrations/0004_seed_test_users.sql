-- 0004_seed_test_users.sql
-- 테스트용 사용자 및 데이터 생성

BEGIN;

-- ============================================
-- 1. 테스트용 강사 계정 10개 생성
-- ============================================
DO $$
DECLARE
    instructor_uuids UUID[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    i INT;
    hashed_password TEXT;
BEGIN
    -- bcrypt로 암호화된 비밀번호 (password123)
    -- Supabase Auth에서 사용하는 bcrypt 해시
    hashed_password := '$2a$10$N9qo8uLOickgx2ZMRZoMye7I62Qkz9r0uF5VUm5RWiZqG0zPQKVtq';

    -- auth.users 테이블에 강사 계정 추가
    FOR i IN 1..10 LOOP
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role
        ) VALUES (
            instructor_uuids[i],
            '00000000-0000-0000-0000-000000000000',
            'instructor' || i || '@test.com',
            hashed_password,
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            'authenticated',
            'authenticated'
        )
        ON CONFLICT (id) DO NOTHING;

        -- profiles 테이블에 강사 프로필 추가
        INSERT INTO profiles (
            id,
            role,
            name,
            phone_number,
            terms_agreed_at,
            created_at,
            updated_at
        ) VALUES (
            instructor_uuids[i],
            'instructor',
            '강사' || i || '님',
            '010-' || LPAD((1000 + i)::TEXT, 4, '0') || '-' || LPAD((i * 1111)::TEXT, 4, '0'),
            NOW(),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- ============================================
-- 2. 테스트용 학습자 계정 10개 생성
-- ============================================
DO $$
DECLARE
    learner_uuids UUID[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    i INT;
    hashed_password TEXT;
BEGIN
    -- bcrypt로 암호화된 비밀번호 (password123)
    hashed_password := '$2a$10$N9qo8uLOickgx2ZMRZoMye7I62Qkz9r0uF5VUm5RWiZqG0zPQKVtq';

    -- auth.users 테이블에 학습자 계정 추가
    FOR i IN 1..10 LOOP
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role
        ) VALUES (
            learner_uuids[i],
            '00000000-0000-0000-0000-000000000000',
            'learner' || i || '@test.com',
            hashed_password,
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            'authenticated',
            'authenticated'
        )
        ON CONFLICT (id) DO NOTHING;

        -- profiles 테이블에 학습자 프로필 추가
        INSERT INTO profiles (
            id,
            role,
            name,
            phone_number,
            terms_agreed_at,
            created_at,
            updated_at
        ) VALUES (
            learner_uuids[i],
            'learner',
            '학습자' || i || '님',
            '010-' || LPAD((2000 + i)::TEXT, 4, '0') || '-' || LPAD((i * 2222)::TEXT, 4, '0'),
            NOW(),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- ============================================
-- 3. 각 강사별 2~3개 강의 생성 (총 약 25개 강의)
-- ============================================
DO $$
DECLARE
    instructor_record RECORD;
    course_count INT;
    i INT := 0;
    j INT;
    course_idx INT;
    category_idx INT;
    title TEXT;
BEGIN
    FOR instructor_record IN
        SELECT id FROM profiles WHERE role = 'instructor' ORDER BY created_at
    LOOP
        -- 각 강사별로 2~3개 랜덤하게 생성
        course_count := 2 + (random() * 2)::INT; -- 2 또는 3
        category_idx := (i % 6) + 1;

        FOR j IN 1..course_count LOOP
            course_idx := (i * 3 + j - 1) % 18 + 1;

            -- 카테고리별 강의 제목 선택
            CASE category_idx
                WHEN 1 THEN -- 프로그래밍
                    title := CASE (course_idx % 3)
                        WHEN 1 THEN 'Python 기초'
                        WHEN 2 THEN 'Python 중급'
                        ELSE 'Python 고급 프로젝트'
                    END;
                WHEN 2 THEN -- 디자인
                    title := CASE (course_idx % 3)
                        WHEN 1 THEN '웹 디자인 입문'
                        WHEN 2 THEN 'UI/UX 디자인'
                        ELSE '브랜드 디자인'
                    END;
                WHEN 3 THEN -- 비즈니스
                    title := CASE (course_idx % 3)
                        WHEN 1 THEN '스타트업 창업'
                        WHEN 2 THEN '경영 전략'
                        ELSE '조직 관리'
                    END;
                WHEN 4 THEN -- 마케팅
                    title := CASE (course_idx % 3)
                        WHEN 1 THEN '디지털 마케팅'
                        WHEN 2 THEN 'SNS 마케팅'
                        ELSE '콘텐츠 마케팅'
                    END;
                WHEN 5 THEN -- 데이터 과학
                    title := CASE (course_idx % 3)
                        WHEN 1 THEN '데이터 분석 기초'
                        WHEN 2 THEN '머신러닝 입문'
                        ELSE '딥러닝 심화'
                    END;
                ELSE -- 인문학
                    title := CASE (course_idx % 3)
                        WHEN 1 THEN '철학 입문'
                        WHEN 2 THEN '역사의 이해'
                        ELSE '문학의 세계'
                    END;
            END CASE;

            INSERT INTO courses (
                instructor_id,
                title,
                description,
                category,
                difficulty,
                status,
                created_at,
                updated_at
            ) VALUES (
                instructor_record.id,
                title,
                title || '에 대한 체계적인 강의입니다. 실무 경험을 바탕으로 한 실용적인 내용을 다룹니다.',
                CASE category_idx
                    WHEN 1 THEN '프로그래밍'
                    WHEN 2 THEN '디자인'
                    WHEN 3 THEN '비즈니스'
                    WHEN 4 THEN '마케팅'
                    WHEN 5 THEN '데이터 과학'
                    ELSE '인문학'
                END,
                CASE ((j-1) % 3)
                    WHEN 0 THEN 'beginner'
                    WHEN 1 THEN 'intermediate'
                    ELSE 'advanced'
                END,
                'published',
                NOW() - ((i + 1) || ' days')::INTERVAL,
                NOW() - ((i + 1) || ' days')::INTERVAL
            );
        END LOOP;

        i := i + 1;
    END LOOP;
END $$;

-- ============================================
-- 4. 학습자들의 랜덤 수강신청
-- ============================================
DO $$
DECLARE
    learner_record RECORD;
    course_record RECORD;
    enrollment_count INT;
    enrolled_courses UUID[];
BEGIN
    FOR learner_record IN
        SELECT id FROM profiles WHERE role = 'learner' ORDER BY created_at
    LOOP
        -- 각 학습자는 3~7개 강의에 랜덤하게 수강신청
        enrollment_count := 3 + (random() * 5)::INT;
        enrolled_courses := ARRAY[]::UUID[];

        FOR course_record IN
            SELECT id FROM courses
            WHERE status = 'published'
            ORDER BY random()
            LIMIT enrollment_count
        LOOP
            -- 중복 수강신청 방지
            IF NOT (course_record.id = ANY(enrolled_courses)) THEN
                INSERT INTO enrollments (
                    course_id,
                    learner_id,
                    enrolled_at,
                    created_at,
                    updated_at
                ) VALUES (
                    course_record.id,
                    learner_record.id,
                    NOW() - (random() * 30 || ' days')::INTERVAL, -- 최근 30일 내 랜덤 수강신청
                    NOW(),
                    NOW()
                )
                ON CONFLICT (course_id, learner_id) DO NOTHING;

                enrolled_courses := array_append(enrolled_courses, course_record.id);
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- 생성된 데이터 확인용 주석
-- ============================================
-- 강사 계정: instructor1@test.com ~ instructor10@test.com (비밀번호: password123)
-- 학습자 계정: learner1@test.com ~ learner10@test.com (비밀번호: password123)
-- 각 강사별 2~3개 강의 생성
-- 각 학습자별 3~7개 강의에 랜덤 수강신청

COMMIT;
