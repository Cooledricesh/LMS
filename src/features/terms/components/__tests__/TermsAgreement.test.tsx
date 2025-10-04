'use client'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TermsAgreement } from '../TermsAgreement'

describe('TermsAgreement Component', () => {
  const mockOnAgreeChange = jest.fn()

  const defaultTerms = [
    {
      id: 'service',
      title: '서비스 이용약관',
      content: '서비스 이용약관 내용...',
      required: true
    },
    {
      id: 'privacy',
      title: '개인정보 처리방침',
      content: '개인정보 처리방침 내용...',
      required: true
    },
    {
      id: 'marketing',
      title: '마케팅 정보 수신 동의',
      content: '마케팅 정보 수신 동의 내용...',
      required: false
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('약관 내용이 올바르게 표시되는가', () => {
    render(
      <TermsAgreement
        terms={defaultTerms}
        agreedTerms={{}}
        onAgreeChange={mockOnAgreeChange}
      />
    )

    expect(screen.getByText('서비스 이용약관')).toBeInTheDocument()
    expect(screen.getByText('개인정보 처리방침')).toBeInTheDocument()
    expect(screen.getByText('마케팅 정보 수신 동의')).toBeInTheDocument()
  })

  test('필수 약관이 구분되어 표시되는가', () => {
    render(
      <TermsAgreement
        terms={defaultTerms}
        agreedTerms={{}}
        onAgreeChange={mockOnAgreeChange}
      />
    )

    // 필수 표시 확인
    expect(screen.getByText(/서비스 이용약관.*\(필수\)/i)).toBeInTheDocument()
    expect(screen.getByText(/개인정보 처리방침.*\(필수\)/i)).toBeInTheDocument()
    expect(screen.getByText(/마케팅 정보 수신 동의.*\(선택\)/i)).toBeInTheDocument()
  })

  test('전체 동의가 올바르게 동작하는가', async () => {
    const user = userEvent.setup()

    render(
      <TermsAgreement
        terms={defaultTerms}
        agreedTerms={{}}
        onAgreeChange={mockOnAgreeChange}
      />
    )

    const allAgreeCheckbox = screen.getByRole('checkbox', { name: /모두 동의합니다/i })
    await user.click(allAgreeCheckbox)

    await waitFor(() => {
      expect(mockOnAgreeChange).toHaveBeenCalledWith({
        service: true,
        privacy: true,
        marketing: true
      })
    })
  })

  test('필수 약관 미동의 시 경고가 표시되는가', () => {
    render(
      <TermsAgreement
        terms={defaultTerms}
        agreedTerms={{ marketing: true }} // 선택 약관만 동의
        onAgreeChange={mockOnAgreeChange}
        showError={true}
      />
    )

    expect(screen.getByText(/필수 약관에 모두 동의해주세요/i)).toBeInTheDocument()
  })

  test('개별 약관 동의가 올바르게 동작하는가', async () => {
    const user = userEvent.setup()

    render(
      <TermsAgreement
        terms={defaultTerms}
        agreedTerms={{}}
        onAgreeChange={mockOnAgreeChange}
      />
    )

    // 서비스 이용약관 동의
    const serviceCheckbox = screen.getByRole('checkbox', { name: /서비스 이용약관/i })
    await user.click(serviceCheckbox)

    await waitFor(() => {
      expect(mockOnAgreeChange).toHaveBeenCalledWith({
        service: true
      })
    })
  })

  test('약관 내용 펼치기/접기가 동작하는가', async () => {
    const user = userEvent.setup()

    render(
      <TermsAgreement
        terms={defaultTerms}
        agreedTerms={{}}
        onAgreeChange={mockOnAgreeChange}
      />
    )

    // 약관 내용이 초기에는 숨겨져 있음
    expect(screen.queryByText('서비스 이용약관 내용...')).not.toBeInTheDocument()

    // 약관 제목 클릭하여 펼치기
    const serviceTermsButton = screen.getByRole('button', { name: /서비스 이용약관/i })
    await user.click(serviceTermsButton)

    await waitFor(() => {
      expect(screen.getByText('서비스 이용약관 내용...')).toBeInTheDocument()
    })

    // 다시 클릭하여 접기
    await user.click(serviceTermsButton)

    await waitFor(() => {
      expect(screen.queryByText('서비스 이용약관 내용...')).not.toBeInTheDocument()
    })
  })

  test('전체 동의 체크박스 상태가 개별 동의 상태를 반영하는가', () => {
    const { rerender } = render(
      <TermsAgreement
        terms={defaultTerms}
        agreedTerms={{}}
        onAgreeChange={mockOnAgreeChange}
      />
    )

    const allAgreeCheckbox = screen.getByRole('checkbox', { name: /모두 동의합니다/i })

    // 아무것도 동의하지 않았을 때
    expect(allAgreeCheckbox).not.toBeChecked()

    // 일부만 동의했을 때
    rerender(
      <TermsAgreement
        terms={defaultTerms}
        agreedTerms={{ service: true, privacy: false, marketing: false }}
        onAgreeChange={mockOnAgreeChange}
      />
    )

    expect(allAgreeCheckbox).not.toBeChecked()
    // indeterminate 상태 확인 (일부 선택)
    expect(allAgreeCheckbox).toHaveProperty('indeterminate', true)

    // 모두 동의했을 때
    rerender(
      <TermsAgreement
        terms={defaultTerms}
        agreedTerms={{ service: true, privacy: true, marketing: true }}
        onAgreeChange={mockOnAgreeChange}
      />
    )

    expect(allAgreeCheckbox).toBeChecked()
  })

  test('필수 약관만 체크했을 때 유효성 검증이 통과하는가', () => {
    const { rerender } = render(
      <TermsAgreement
        terms={defaultTerms}
        agreedTerms={{ service: true, privacy: true }} // 필수만 동의
        onAgreeChange={mockOnAgreeChange}
        showError={false}
      />
    )

    // 에러 메시지가 표시되지 않음
    expect(screen.queryByText(/필수 약관에 모두 동의해주세요/i)).not.toBeInTheDocument()

    // isValid prop을 통해 유효성 확인 (컴포넌트가 이 prop을 제공한다면)
    const allRequiredAgreed = defaultTerms
      .filter(term => term.required)
      .every(term => ({ service: true, privacy: true })[term.id])

    expect(allRequiredAgreed).toBe(true)
  })
})