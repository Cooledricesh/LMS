import {
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  TermsResponseSchema,
  type TermsResponse,
  type TermsContent,
} from '@/features/terms/backend/schema';

const CURRENT_TERMS_VERSION = '1.0.0';

// 약관 내용 (실제 서비스에서는 데이터베이스나 CMS에서 관리)
const termsData: TermsContent[] = [
  {
    type: 'service',
    title: '서비스 이용약관',
    content: `
제1조 (목적)
본 약관은 LMS 플랫폼(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
1. "서비스"란 회사가 제공하는 온라인 학습 관리 시스템을 의미합니다.
2. "이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.
3. "강사"란 서비스를 통해 교육 콘텐츠를 제공하는 이용자를 의미합니다.
4. "학습자"란 서비스를 통해 교육 콘텐츠를 수강하는 이용자를 의미합니다.

제3조 (약관의 효력 및 변경)
1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.
2. 회사는 필요시 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해 이용자에게 공지합니다.

제4조 (서비스의 제공)
1. 회사는 다음과 같은 서비스를 제공합니다:
   - 온라인 강의 개설 및 수강
   - 과제 제출 및 평가
   - 학습 진도 관리
2. 서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검 등 필요시 일시 중단될 수 있습니다.

제5조 (이용자의 의무)
1. 이용자는 본 약관 및 관련 법령을 준수해야 합니다.
2. 타인의 정보를 도용하거나 허위 정보를 입력해서는 안 됩니다.
3. 서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.

제6조 (개인정보보호)
회사는 관련 법령에 따라 이용자의 개인정보를 보호하며, 구체적인 사항은 개인정보처리방침에 따릅니다.

제7조 (면책조항)
회사는 천재지변 또는 이에 준하는 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.
    `.trim(),
    required: true,
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    type: 'privacy',
    title: '개인정보 처리방침',
    content: `
1. 개인정보의 수집 및 이용 목적
회사는 다음의 목적으로 개인정보를 수집 및 이용합니다:
- 회원 관리: 회원제 서비스 제공에 따른 본인 확인, 개인 식별
- 서비스 제공: 학습 콘텐츠 제공, 학습 이력 관리
- 마케팅 및 광고: 이벤트 및 광고성 정보 제공 (선택적)

2. 수집하는 개인정보 항목
- 필수 항목: 이메일, 비밀번호, 이름, 휴대폰번호
- 선택 항목: 프로필 사진, 자기소개
- 자동 수집 항목: IP 주소, 쿠키, 방문 일시, 서비스 이용 기록

3. 개인정보의 보유 및 이용 기간
- 회원 탈퇴 시까지 보유
- 관련 법령에 따른 보관 의무가 있는 경우 해당 기간까지 보유
  - 계약 또는 청약철회 등에 관한 기록: 5년
  - 소비자의 불만 또는 분쟁처리에 관한 기록: 3년

4. 개인정보의 제3자 제공
회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다:
- 이용자가 사전에 동의한 경우
- 법령의 규정에 의한 경우

5. 개인정보의 파기 절차 및 방법
- 파기 절차: 목적 달성 후 내부 방침에 따라 일정 기간 저장 후 파기
- 파기 방법: 전자적 파일은 복구 불가능한 방법으로 삭제

6. 이용자의 권리
- 개인정보 열람 요구
- 오류 정정 요구
- 삭제 요구
- 처리 정지 요구

7. 개인정보 보호책임자
- 성명: 홍길동
- 이메일: privacy@lms.com
- 전화: 02-1234-5678

8. 개인정보 처리방침 변경
본 개인정보 처리방침은 시행일로부터 적용되며, 변경사항은 서비스 내 공지를 통해 안내합니다.
    `.trim(),
    required: true,
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];

export const getLatestTerms = async (): Promise<HandlerResult<TermsResponse, never, unknown>> => {
  const response: TermsResponse = {
    version: CURRENT_TERMS_VERSION,
    terms: termsData,
  };

  const parsed = TermsResponseSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error('Terms data validation failed');
  }

  return success(parsed.data);
};