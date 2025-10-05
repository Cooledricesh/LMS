-- 0003_seed_test_courses.sql
-- 테스트용 강좌 데이터 생성

BEGIN;

-- ============================================
-- 테스트용 강사 프로필 생성
-- ============================================
-- 기존 instructor가 없을 경우를 대비하여 테스트 instructor 생성
-- 실제 auth.users에 존재하는 instructor_id를 사용해야 하므로
-- 여기서는 임시로 UUID를 생성하되, 실제로는 기존 instructor_id를 사용하도록 안내

DO $$
DECLARE
    test_instructor_id UUID;
BEGIN
    -- 기존 instructor 찾기
    SELECT id INTO test_instructor_id
    FROM profiles
    WHERE role = 'instructor'
    LIMIT 1;

    -- instructor가 없으면 오류 메시지 출력
    IF test_instructor_id IS NULL THEN
        RAISE NOTICE 'Warning: No instructor found in profiles table. Please create an instructor profile first.';
        RAISE NOTICE 'You can create test instructor by signing up with instructor role.';
        RETURN;
    END IF;

    -- 테스트 강좌 10개 생성
    INSERT INTO courses (instructor_id, title, description, category, difficulty, status, created_at)
    VALUES
        -- 1. 프로그래밍 - 초급
        (
            test_instructor_id,
            'Python 프로그래밍 입문',
            '프로그래밍을 처음 배우는 분들을 위한 Python 기초 강좌입니다. 변수, 조건문, 반복문 등 프로그래밍의 기본 개념을 학습합니다.',
            'programming',
            'beginner',
            'published',
            NOW() - INTERVAL '30 days'
        ),

        -- 2. 프로그래밍 - 중급
        (
            test_instructor_id,
            'JavaScript 심화 과정',
            '비동기 프로그래밍, 클로저, 프로토타입 등 JavaScript의 핵심 개념을 깊이 있게 다룹니다.',
            'programming',
            'intermediate',
            'published',
            NOW() - INTERVAL '25 days'
        ),

        -- 3. 웹 개발 - 초급
        (
            test_instructor_id,
            'HTML/CSS 기초부터 반응형 웹까지',
            '웹 개발의 기초인 HTML과 CSS를 배우고, 모바일 친화적인 반응형 웹사이트를 만들어봅니다.',
            'web-development',
            'beginner',
            'published',
            NOW() - INTERVAL '20 days'
        ),

        -- 4. 웹 개발 - 고급
        (
            test_instructor_id,
            'React로 구축하는 현대적인 웹 애플리케이션',
            'React Hooks, Context API, React Query 등을 활용하여 실무 수준의 웹 애플리케이션을 개발합니다.',
            'web-development',
            'advanced',
            'published',
            NOW() - INTERVAL '15 days'
        ),

        -- 5. 데이터 사이언스 - 초급
        (
            test_instructor_id,
            '데이터 분석 첫걸음 with Pandas',
            'Python의 Pandas 라이브러리를 사용하여 데이터를 수집, 정제, 분석하는 방법을 배웁니다.',
            'data-science',
            'beginner',
            'published',
            NOW() - INTERVAL '12 days'
        ),

        -- 6. 데이터 사이언스 - 중급
        (
            test_instructor_id,
            '머신러닝 실전 프로젝트',
            'scikit-learn을 활용한 지도학습, 비지도학습 알고리즘 구현 및 실제 데이터셋 분석 프로젝트를 진행합니다.',
            'data-science',
            'intermediate',
            'published',
            NOW() - INTERVAL '10 days'
        ),

        -- 7. 디자인 - 초급
        (
            test_instructor_id,
            'UI/UX 디자인 기초',
            '사용자 중심 디자인 원칙과 Figma를 활용한 UI 디자인 기초를 학습합니다.',
            'design',
            'beginner',
            'published',
            NOW() - INTERVAL '8 days'
        ),

        -- 8. 비즈니스 - 초급
        (
            test_instructor_id,
            '스타트업 창업 가이드',
            '아이디어 검증부터 MVP 개발, 투자 유치까지 스타트업 창업의 전 과정을 배웁니다.',
            'business',
            'beginner',
            'published',
            NOW() - INTERVAL '5 days'
        ),

        -- 9. 모바일 개발 - 중급
        (
            test_instructor_id,
            'React Native로 만드는 크로스 플랫폼 앱',
            'React Native를 사용하여 iOS와 Android 앱을 동시에 개발하는 방법을 학습합니다.',
            'mobile-development',
            'intermediate',
            'published',
            NOW() - INTERVAL '3 days'
        ),

        -- 10. 클라우드 - 고급
        (
            test_instructor_id,
            'AWS 아키텍처 설계 및 운영',
            'AWS의 주요 서비스를 활용한 확장 가능하고 안정적인 클라우드 인프라 구축 방법을 배웁니다.',
            'cloud',
            'advanced',
            'published',
            NOW() - INTERVAL '1 day'
        )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Successfully created 10 test courses for instructor: %', test_instructor_id;

END $$;

COMMIT;
