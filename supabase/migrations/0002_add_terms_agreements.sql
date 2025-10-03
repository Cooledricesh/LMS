-- 0002_add_terms_agreements.sql
-- 약관 동의 이력 테이블 생성

BEGIN;

-- ============================================
-- Terms Agreements 테이블 (약관 동의 이력)
-- ============================================
CREATE TABLE IF NOT EXISTS terms_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    terms_version TEXT NOT NULL,
    terms_type TEXT NOT NULL CHECK (terms_type IN ('service', 'privacy')),
    agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Terms Agreements 인덱스
CREATE INDEX IF NOT EXISTS idx_terms_agreements_user ON terms_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_agreements_type ON terms_agreements(terms_type);
CREATE INDEX IF NOT EXISTS idx_terms_agreements_agreed_at ON terms_agreements(agreed_at);

-- RLS 비활성화 (프로젝트 요구사항)
ALTER TABLE terms_agreements DISABLE ROW LEVEL SECURITY;

-- 테이블 및 컬럼 설명 추가
COMMENT ON TABLE terms_agreements IS 'LMS 사용자 약관 동의 이력';
COMMENT ON COLUMN terms_agreements.user_id IS '사용자 ID';
COMMENT ON COLUMN terms_agreements.terms_version IS '약관 버전';
COMMENT ON COLUMN terms_agreements.terms_type IS '약관 유형: service(서비스 이용약관), privacy(개인정보 처리방침)';
COMMENT ON COLUMN terms_agreements.agreed_at IS '약관 동의 시각';
COMMENT ON COLUMN terms_agreements.ip_address IS '동의 시 IP 주소';
COMMENT ON COLUMN terms_agreements.user_agent IS '동의 시 User Agent';

COMMIT;