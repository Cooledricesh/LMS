-- 0007_complete_test_data.sql
-- 완전한 테스트 데이터 세트 생성

BEGIN;

-- ============================================
-- 1. 테스트 사용자 계정 생성 (auth.users)
-- ============================================
-- Supabase Auth에 직접 사용자를 추가할 수 없으므로
-- 기존 사용자를 확인하고 없으면 안내 메시지 출력

DO $$
DECLARE
    v_instructor_id UUID := 'a1111111-1111-1111-1111-111111111111'::UUID;
    v_instructor2_id UUID := 'a2222222-2222-2222-2222-222222222222'::UUID;
    v_learner1_id UUID := 'b1111111-1111-1111-1111-111111111111'::UUID;
    v_learner2_id UUID := 'b2222222-2222-2222-2222-222222222222'::UUID;
    v_learner3_id UUID := 'b3333333-3333-3333-3333-333333333333'::UUID;
    v_course_id UUID;
    v_assignment_id UUID;
    v_existing_instructor_id UUID;
    v_existing_learner_id UUID;
BEGIN
    -- ============================================
    -- 2. 테스트용 사용자 프로필 생성
    -- ============================================

    -- 기존 instructor 확인
    SELECT id INTO v_existing_instructor_id
    FROM profiles
    WHERE role = 'instructor'
    LIMIT 1;

    -- instructor가 없으면 테스트 instructor 생성 시도
    IF v_existing_instructor_id IS NULL THEN
        -- auth.users에 먼저 사용자가 생성되어야 하므로,
        -- 여기서는 더미 UUID로 프로필만 생성 (실제 로그인은 불가)
        RAISE NOTICE 'Creating test instructor profiles (login requires auth.users entry)';

        -- 테스트 강사 1
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            v_instructor_id,
            'instructor@test.com',
            crypt('Test1234!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO profiles (id, role, name, phone_number, terms_agreed_at)
        VALUES (
            v_instructor_id,
            'instructor',
            '김강사',
            '010-1111-1111',
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        -- 테스트 강사 2
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            v_instructor2_id,
            'instructor2@test.com',
            crypt('Test1234!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO profiles (id, role, name, phone_number, terms_agreed_at)
        VALUES (
            v_instructor2_id,
            'instructor',
            '이선생',
            '010-2222-2222',
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        v_existing_instructor_id := v_instructor_id;
    END IF;

    -- 기존 learner 확인
    SELECT id INTO v_existing_learner_id
    FROM profiles
    WHERE role = 'learner'
    LIMIT 1;

    -- learner가 없으면 테스트 learner 생성
    IF v_existing_learner_id IS NULL THEN
        RAISE NOTICE 'Creating test learner profiles';

        -- 테스트 학습자 1
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            v_learner1_id,
            'learner1@test.com',
            crypt('Test1234!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO profiles (id, role, name, phone_number, terms_agreed_at)
        VALUES (
            v_learner1_id,
            'learner',
            '박학생',
            '010-3333-3333',
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        -- 테스트 학습자 2
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            v_learner2_id,
            'learner2@test.com',
            crypt('Test1234!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO profiles (id, role, name, phone_number, terms_agreed_at)
        VALUES (
            v_learner2_id,
            'learner',
            '최학습',
            '010-4444-4444',
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        -- 테스트 학습자 3
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            v_learner3_id,
            'learner3@test.com',
            crypt('Test1234!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO profiles (id, role, name, phone_number, terms_agreed_at)
        VALUES (
            v_learner3_id,
            'learner',
            '정수강',
            '010-5555-5555',
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        v_existing_learner_id := v_learner1_id;
    END IF;

    -- ============================================
    -- 3. 기존 코스 업데이트 및 새 코스 추가
    -- ============================================

    -- 기존 코스에 썸네일 추가 (이미 마이그레이션 0006에서 처리됨)
    -- 하지만 instructor_id가 유효한지 확인하고 업데이트
    UPDATE courses
    SET instructor_id = v_existing_instructor_id,
        thumbnail = COALESCE(thumbnail, 'https://picsum.photos/seed/' || id || '/800/400')
    WHERE instructor_id NOT IN (SELECT id FROM profiles WHERE role = 'instructor');

    -- 추가 테스트 코스 생성
    INSERT INTO courses (instructor_id, title, description, thumbnail, category, difficulty, status)
    VALUES
        -- 김강사의 코스들
        (
            v_existing_instructor_id,
            'Node.js 백엔드 마스터 클래스',
            'Express, NestJS를 활용한 확장 가능한 백엔드 시스템 구축. RESTful API, GraphQL, 마이크로서비스 아키텍처를 다룹니다.',
            'https://picsum.photos/seed/nodejs-master/800/400',
            'backend',
            'advanced',
            'published'
        ),
        (
            v_existing_instructor_id,
            'Docker & Kubernetes 실전',
            '컨테이너화와 오케스트레이션을 통한 현대적인 애플리케이션 배포. CI/CD 파이프라인 구축까지 다룹니다.',
            'https://picsum.photos/seed/docker-k8s/800/400',
            'devops',
            'intermediate',
            'published'
        ),
        (
            v_existing_instructor_id,
            'TypeScript 완벽 가이드',
            '타입 시스템의 기초부터 고급 타입 조작, 제네릭, 데코레이터까지. 실무에서 바로 적용 가능한 TypeScript 활용법.',
            'https://picsum.photos/seed/typescript-guide/800/400',
            'programming',
            'intermediate',
            'published'
        )
    ON CONFLICT DO NOTHING;

    -- 이선생의 코스들 (instructor2가 있다면)
    IF EXISTS (SELECT 1 FROM profiles WHERE id = v_instructor2_id) THEN
        INSERT INTO courses (instructor_id, title, description, thumbnail, category, difficulty, status)
        VALUES
            (
                v_instructor2_id,
                'Vue.js 3 실무 프로젝트',
                'Composition API, Pinia, Vue Router를 활용한 대규모 SPA 개발. 실제 프로젝트 기반 학습.',
                'https://picsum.photos/seed/vuejs-project/800/400',
                'web-development',
                'intermediate',
                'published'
            ),
            (
                v_instructor2_id,
                'PostgreSQL 성능 최적화',
                '인덱싱, 쿼리 최적화, 파티셔닝 등 PostgreSQL 데이터베이스 성능 튜닝 전략.',
                'https://picsum.photos/seed/postgresql-opt/800/400',
                'database',
                'advanced',
                'published'
            )
        ON CONFLICT DO NOTHING;
    END IF;

    -- ============================================
    -- 4. 수강 신청 데이터 생성
    -- ============================================

    -- 각 학습자마다 몇 개의 코스 수강 신청
    FOR v_course_id IN (SELECT id FROM courses WHERE status = 'published' LIMIT 5)
    LOOP
        -- learner1은 모든 코스 수강
        IF EXISTS (SELECT 1 FROM profiles WHERE id = v_learner1_id) THEN
            INSERT INTO enrollments (course_id, learner_id, progress, enrolled_at)
            VALUES (v_course_id, v_learner1_id, floor(random() * 101)::int, NOW() - INTERVAL '30 days' * random())
            ON CONFLICT (course_id, learner_id) DO UPDATE
            SET progress = EXCLUDED.progress;
        END IF;

        -- learner2는 70% 확률로 수강
        IF EXISTS (SELECT 1 FROM profiles WHERE id = v_learner2_id) AND random() < 0.7 THEN
            INSERT INTO enrollments (course_id, learner_id, progress, enrolled_at)
            VALUES (v_course_id, v_learner2_id, floor(random() * 101)::int, NOW() - INTERVAL '20 days' * random())
            ON CONFLICT (course_id, learner_id) DO UPDATE
            SET progress = EXCLUDED.progress;
        END IF;

        -- learner3는 50% 확률로 수강
        IF EXISTS (SELECT 1 FROM profiles WHERE id = v_learner3_id) AND random() < 0.5 THEN
            INSERT INTO enrollments (course_id, learner_id, progress, enrolled_at)
            VALUES (v_course_id, v_learner3_id, floor(random() * 101)::int, NOW() - INTERVAL '15 days' * random())
            ON CONFLICT (course_id, learner_id) DO UPDATE
            SET progress = EXCLUDED.progress;
        END IF;
    END LOOP;

    -- ============================================
    -- 5. 과제 데이터 생성
    -- ============================================

    FOR v_course_id IN (SELECT id FROM courses WHERE status = 'published')
    LOOP
        -- 각 코스마다 3-5개의 과제 생성
        FOR i IN 1..3 + floor(random() * 3)::int
        LOOP
            INSERT INTO assignments (
                course_id,
                title,
                description,
                due_date,
                weight,
                allow_late,
                allow_resubmission,
                status
            ) VALUES (
                v_course_id,
                '과제 ' || i || ': ' ||
                CASE i
                    WHEN 1 THEN '기초 개념 이해'
                    WHEN 2 THEN '실습 프로젝트'
                    WHEN 3 THEN '코드 리뷰'
                    WHEN 4 THEN '최종 프로젝트'
                    ELSE '심화 과제'
                END,
                CASE i
                    WHEN 1 THEN '이번 챕터에서 배운 기초 개념을 정리하고 예제 코드를 작성하세요.'
                    WHEN 2 THEN '제시된 요구사항에 따라 실습 프로젝트를 완성하세요.'
                    WHEN 3 THEN '동료의 코드를 리뷰하고 개선사항을 제안하세요.'
                    WHEN 4 THEN '지금까지 배운 내용을 종합한 최종 프로젝트를 제출하세요.'
                    ELSE '추가 학습 자료를 참고하여 심화 과제를 수행하세요.'
                END,
                NOW() + INTERVAL '7 days' * i,
                CASE
                    WHEN i = 4 THEN 40.0  -- 최종 프로젝트는 40%
                    ELSE 20.0  -- 나머지는 20%
                END,
                true,  -- 지각 제출 허용
                CASE WHEN i < 4 THEN true ELSE false END,  -- 최종 프로젝트 외에는 재제출 허용
                'published'
            ) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    -- ============================================
    -- 6. 제출물 데이터 생성
    -- ============================================

    -- 수강 신청한 학습자들의 과제 제출물 생성
    FOR v_assignment_id IN (
        SELECT a.id
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        WHERE a.status = 'published'
        AND c.status = 'published'
        LIMIT 20
    )
    LOOP
        -- 각 과제에 대해 수강생들의 제출물 생성
        INSERT INTO submissions (
            assignment_id,
            learner_id,
            content,
            link,
            is_late,
            status,
            score,
            feedback,
            submitted_at,
            graded_at
        )
        SELECT
            v_assignment_id,
            e.learner_id,
            '과제 제출 내용입니다. ' ||
            CASE floor(random() * 3)::int
                WHEN 0 THEN '코드와 설명을 포함하여 제출합니다.'
                WHEN 1 THEN '요구사항에 따라 구현을 완료했습니다.'
                ELSE '프로젝트 결과물과 문서를 첨부합니다.'
            END,
            CASE WHEN random() < 0.5
                THEN 'https://github.com/testuser/assignment-' || v_assignment_id
                ELSE NULL
            END,
            random() < 0.2,  -- 20% 확률로 지각 제출
            CASE
                WHEN random() < 0.7 THEN 'graded'
                WHEN random() < 0.9 THEN 'submitted'
                ELSE 'resubmission_required'
            END,
            CASE
                WHEN random() < 0.7 THEN 60 + floor(random() * 41)::decimal  -- 60-100점
                ELSE NULL
            END,
            CASE
                WHEN random() < 0.7 THEN
                    CASE floor(random() * 3)::int
                        WHEN 0 THEN '잘 작성하셨습니다. 코드 구조가 깔끔합니다.'
                        WHEN 1 THEN '좋은 접근입니다. 몇 가지 개선사항을 참고하세요.'
                        ELSE '우수한 과제입니다. 추가 학습 자료를 확인해보세요.'
                    END
                ELSE NULL
            END,
            NOW() - INTERVAL '1 day' * floor(random() * 10),
            CASE
                WHEN random() < 0.7 THEN NOW() - INTERVAL '1 hour' * floor(random() * 24)
                ELSE NULL
            END
        FROM enrollments e
        JOIN assignments a ON a.id = v_assignment_id
        WHERE e.course_id = a.course_id
        AND random() < 0.8  -- 80% 확률로 과제 제출
        ON CONFLICT (assignment_id, learner_id) DO UPDATE
        SET
            score = EXCLUDED.score,
            feedback = EXCLUDED.feedback,
            status = EXCLUDED.status;
    END LOOP;

    -- ============================================
    -- 7. 통계 출력
    -- ============================================

    RAISE NOTICE '=== Test Data Creation Complete ===';
    RAISE NOTICE 'Instructors: %', (SELECT COUNT(*) FROM profiles WHERE role = 'instructor');
    RAISE NOTICE 'Learners: %', (SELECT COUNT(*) FROM profiles WHERE role = 'learner');
    RAISE NOTICE 'Courses: %', (SELECT COUNT(*) FROM courses WHERE status = 'published');
    RAISE NOTICE 'Enrollments: %', (SELECT COUNT(*) FROM enrollments);
    RAISE NOTICE 'Assignments: %', (SELECT COUNT(*) FROM assignments);
    RAISE NOTICE 'Submissions: %', (SELECT COUNT(*) FROM submissions);

    RAISE NOTICE '';
    RAISE NOTICE '=== Test Accounts ===';
    RAISE NOTICE 'Instructor: instructor@test.com / Test1234!';
    RAISE NOTICE 'Learner 1: learner1@test.com / Test1234!';
    RAISE NOTICE 'Learner 2: learner2@test.com / Test1234!';
    RAISE NOTICE 'Learner 3: learner3@test.com / Test1234!';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
        RAISE NOTICE 'Some test data may not have been created.';
        RAISE NOTICE 'You may need to create auth.users entries manually through Supabase Dashboard.';
END $$;

-- ============================================
-- 8. 추가 샘플 데이터 (카테고리별 코스)
-- ============================================

-- 다양한 카테고리의 코스 추가
INSERT INTO courses (instructor_id, title, description, thumbnail, category, difficulty, status)
SELECT
    (SELECT id FROM profiles WHERE role = 'instructor' ORDER BY random() LIMIT 1),
    title,
    description,
    thumbnail,
    category,
    difficulty,
    'published'
FROM (VALUES
    ('Flutter 모바일 앱 개발', 'Dart 언어와 Flutter 프레임워크로 iOS/Android 앱을 동시에 개발하는 방법을 배웁니다.', 'https://picsum.photos/seed/flutter-dev/800/400', 'mobile-development', 'intermediate'),
    ('AWS 솔루션 아키텍트 준비', 'AWS 서비스 전반에 대한 이해와 솔루션 아키텍트 자격증 준비 과정', 'https://picsum.photos/seed/aws-sa/800/400', 'cloud', 'advanced'),
    ('Git과 GitHub 마스터하기', '버전 관리의 기초부터 고급 Git 워크플로우, GitHub Actions를 활용한 자동화까지', 'https://picsum.photos/seed/git-github/800/400', 'tools', 'beginner'),
    ('Clean Code 작성법', '읽기 쉽고 유지보수가 용이한 코드 작성 원칙과 리팩토링 기법', 'https://picsum.photos/seed/clean-code/800/400', 'programming', 'intermediate'),
    ('Redis를 활용한 캐싱 전략', '고성능 애플리케이션을 위한 Redis 캐싱 패턴과 최적화 기법', 'https://picsum.photos/seed/redis-cache/800/400', 'database', 'advanced'),
    ('Tailwind CSS 실전 활용', '유틸리티 퍼스트 CSS 프레임워크로 빠르게 UI 구축하기', 'https://picsum.photos/seed/tailwind-css/800/400', 'web-development', 'beginner'),
    ('Nginx 웹서버 구축과 운영', '웹서버 설정, 리버스 프록시, 로드 밸런싱 구현', 'https://picsum.photos/seed/nginx-server/800/400', 'devops', 'intermediate'),
    ('GraphQL API 설계와 구현', 'REST API의 한계를 극복하는 GraphQL 서버 구축', 'https://picsum.photos/seed/graphql-api/800/400', 'backend', 'advanced'),
    ('Svelte로 시작하는 웹 개발', '컴파일 타임 최적화로 빠른 웹 애플리케이션 만들기', 'https://picsum.photos/seed/svelte-web/800/400', 'web-development', 'intermediate'),
    ('Kafka 스트림 처리', '대용량 실시간 데이터 처리를 위한 Apache Kafka 활용법', 'https://picsum.photos/seed/kafka-stream/800/400', 'data-engineering', 'advanced')
) AS sample_courses(title, description, thumbnail, category, difficulty)
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'instructor')
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================
-- 9. 마이그레이션 실행 안내
-- ============================================
-- 이 마이그레이션을 실행하려면:
-- 1. Supabase CLI: supabase migration up
-- 2. Supabase Dashboard: SQL Editor에서 직접 실행
--
-- 주의: auth.users 테이블에 직접 삽입하는 부분은
-- Supabase Cloud에서는 제한될 수 있습니다.
-- 이 경우 Supabase Dashboard의 Authentication 섹션에서
-- 수동으로 사용자를 생성해야 합니다.