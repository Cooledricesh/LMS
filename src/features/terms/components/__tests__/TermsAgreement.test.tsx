'use client'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { TermsAgreement } from '../TermsAgreement'

describe('TermsAgreement Component', () => {
  const mockOnAgreementChange = jest.fn()

  const defaultTerms = [
    {
      type: 'service' as const,
      title: '서비스 이용약관',
      content: '서비스 이용약관 내용...',
      required: true,
      updatedAt: '2024-01-01'
    },
    {
      type: 'privacy' as const,
      title: '개인정보 처리방침',
      content: '개인정보 처리방침 내용...',
      required: true,
      updatedAt: '2024-01-01'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('약관 내용이 올바르게 표시되는가', () => {
    render(
      <TermsAgreement
        terms={defaultTerms}
        onAgreementChange={mockOnAgreementChange}
      />
    )

    expect(screen.getByText('서비스 이용약관')).toBeInTheDocument()
    expect(screen.getByText('개인정보 처리방침')).toBeInTheDocument()
  })

  test('필수 약관이 구분되어 표시되는가', () => {
    render(
      <TermsAgreement
        terms={defaultTerms}
        onAgreementChange={mockOnAgreementChange}
      />
    )

    // 필수 표시 확인
    const serviceLabel = screen.getByText(/서비스 이용약관/i)
    const privacyLabel = screen.getByText(/개인정보 처리방침/i)

    expect(serviceLabel).toBeInTheDocument()
    expect(privacyLabel).toBeInTheDocument()

    // 필수 표시는 별도로 표시될 수 있음
    const requiredIndicators = screen.getAllByText('(필수)')
    expect(requiredIndicators).toHaveLength(2)
  })

  test('전체 동의가 올바르게 동작하는가', async () => {
    const user = userEvent.setup()

    render(
      <TermsAgreement
        terms={defaultTerms}
        onAgreementChange={mockOnAgreementChange}
      />
    )

    const allAgreeCheckbox = screen.getByRole('checkbox', { name: /전체 약관에 동의합니다/i })
    await user.click(allAgreeCheckbox)

    await waitFor(() => {
      expect(mockOnAgreementChange).toHaveBeenCalledWith({
        service: true,
        privacy: true
      })
    })
  })

  test('개별 약관 동의가 올바르게 동작하는가', async () => {
    const user = userEvent.setup()

    render(
      <TermsAgreement
        terms={defaultTerms}
        onAgreementChange={mockOnAgreementChange}
      />
    )

    // 서비스 이용약관 체크박스 찾기
    const checkboxes = screen.getAllByRole('checkbox')
    // 첫 번째는 전체 동의, 두 번째가 서비스 이용약관
    const serviceCheckbox = checkboxes[1]

    await user.click(serviceCheckbox)

    await waitFor(() => {
      expect(mockOnAgreementChange).toHaveBeenCalled()
      // 마지막 호출의 인자 확인
      const lastCall = mockOnAgreementChange.mock.calls[mockOnAgreementChange.mock.calls.length - 1]
      expect(lastCall[0]).toEqual(expect.objectContaining({
        service: true,
        privacy: false
      }))
    })
  })

  test('약관 내용 펼치기/접기가 동작하는가', async () => {
    const user = userEvent.setup()

    render(
      <TermsAgreement
        terms={defaultTerms}
        onAgreementChange={mockOnAgreementChange}
      />
    )

    // 약관 내용이 초기에는 숨겨져 있음
    expect(screen.queryByText('서비스 이용약관 내용...')).not.toBeInTheDocument()

    // 펼치기 버튼 클릭
    const expandButtons = screen.getAllByRole('button')
    const firstExpandButton = expandButtons[0] // 첫 번째 약관의 펼치기 버튼

    await user.click(firstExpandButton)

    await waitFor(() => {
      expect(screen.getByText('서비스 이용약관 내용...')).toBeInTheDocument()
    })

    // 다시 클릭하여 접기
    await user.click(firstExpandButton)

    await waitFor(() => {
      expect(screen.queryByText('서비스 이용약관 내용...')).not.toBeInTheDocument()
    })
  })

  test('전체 동의 체크박스 상태가 개별 동의 상태를 반영하는가', async () => {
    const user = userEvent.setup()

    render(
      <TermsAgreement
        terms={defaultTerms}
        onAgreementChange={mockOnAgreementChange}
      />
    )

    const allAgreeCheckbox = screen.getByRole('checkbox', { name: /전체 약관에 동의합니다/i })

    // 초기 상태: 체크되지 않음
    expect(allAgreeCheckbox).not.toBeChecked()

    // 전체 동의 클릭
    await user.click(allAgreeCheckbox)

    await waitFor(() => {
      expect(allAgreeCheckbox).toBeChecked()
    })

    // 개별 약관 하나를 해제
    const checkboxes = screen.getAllByRole('checkbox')
    const serviceCheckbox = checkboxes[1]

    await user.click(serviceCheckbox)

    await waitFor(() => {
      expect(allAgreeCheckbox).not.toBeChecked()
    })
  })

  test('모든 필수 약관 동의시 onAgreementChange가 올바른 값으로 호출되는가', async () => {
    const user = userEvent.setup()

    render(
      <TermsAgreement
        terms={defaultTerms}
        onAgreementChange={mockOnAgreementChange}
      />
    )

    // 모든 개별 약관 체크
    const checkboxes = screen.getAllByRole('checkbox')
    const serviceCheckbox = checkboxes[1]
    const privacyCheckbox = checkboxes[2]

    await user.click(serviceCheckbox)
    await user.click(privacyCheckbox)

    await waitFor(() => {
      const lastCall = mockOnAgreementChange.mock.calls[mockOnAgreementChange.mock.calls.length - 1]
      expect(lastCall[0]).toEqual({
        service: true,
        privacy: true
      })
    })
  })
})