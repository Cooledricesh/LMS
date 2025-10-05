'use client'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ProfileForm } from '../ProfileForm'

describe('ProfileForm Component', () => {
  const mockOnNameChange = jest.fn()
  const mockOnPhoneNumberChange = jest.fn()
  const mockOnNameBlur = jest.fn()
  const mockOnPhoneNumberBlur = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('프로필 필수 항목이 모두 입력되었는가 - 이름과 휴대폰번호 필드가 존재', () => {
    render(
      <ProfileForm
        name=""
        phoneNumber=""
        onNameChange={mockOnNameChange}
        onPhoneNumberChange={mockOnPhoneNumberChange}
      />
    )

    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/휴대폰번호/i)).toBeInTheDocument()
  })

  test('이름 입력이 올바르게 동작하는가', async () => {
    const user = userEvent.setup()
    render(
      <ProfileForm
        name=""
        phoneNumber=""
        onNameChange={mockOnNameChange}
        onPhoneNumberChange={mockOnPhoneNumberChange}
      />
    )

    const nameInput = screen.getByLabelText(/이름/i)
    await user.type(nameInput, '홍길동')

    await waitFor(() => {
      // 각 문자 입력마다 onChange가 호출됨
      expect(mockOnNameChange).toHaveBeenCalled()
      const lastCall = mockOnNameChange.mock.calls[mockOnNameChange.mock.calls.length - 1]
      expect(lastCall[0]).toBe('홍길동')
    })
  })

  test('휴대폰번호 입력이 올바르게 동작하는가', async () => {
    const user = userEvent.setup()
    render(
      <ProfileForm
        name=""
        phoneNumber=""
        onNameChange={mockOnNameChange}
        onPhoneNumberChange={mockOnPhoneNumberChange}
      />
    )

    const phoneInput = screen.getByLabelText(/휴대폰번호/i)
    await user.type(phoneInput, '01012345678')

    await waitFor(() => {
      expect(mockOnPhoneNumberChange).toHaveBeenCalled()
      // formatPhoneNumber가 적용되어 하이픈이 추가됨
      const lastCall = mockOnPhoneNumberChange.mock.calls[mockOnPhoneNumberChange.mock.calls.length - 1]
      expect(lastCall[0]).toMatch(/\d{3}-\d{4}-\d{4}/)
    })
  })

  test('실시간 검증 - 휴대폰번호 형식 에러 표시', async () => {
    render(
      <ProfileForm
        name=""
        phoneNumber="123"
        onNameChange={mockOnNameChange}
        onPhoneNumberChange={mockOnPhoneNumberChange}
        errors={{
          phoneNumber: '올바른 휴대폰번호 형식이 아닙니다'
        }}
      />
    )

    expect(screen.getByText(/올바른 휴대폰번호 형식이 아닙니다/i)).toBeInTheDocument()
  })

  test('프로필 값이 올바르게 표시되는가', () => {
    render(
      <ProfileForm
        name="김철수"
        phoneNumber="010-9876-5432"
        onNameChange={mockOnNameChange}
        onPhoneNumberChange={mockOnPhoneNumberChange}
      />
    )

    expect(screen.getByDisplayValue('김철수')).toBeInTheDocument()
    expect(screen.getByDisplayValue('010-9876-5432')).toBeInTheDocument()
  })

  test('필수 항목 표시가 있는가', () => {
    render(
      <ProfileForm
        name=""
        phoneNumber=""
        onNameChange={mockOnNameChange}
        onPhoneNumberChange={mockOnPhoneNumberChange}
      />
    )

    // 필수 표시 확인 (보통 * 또는 required 속성)
    const nameInput = screen.getByLabelText(/이름/i)
    const phoneInput = screen.getByLabelText(/휴대폰번호/i)

    expect(nameInput).toHaveAttribute('required')
    expect(phoneInput).toHaveAttribute('required')
  })

  test('onBlur 이벤트가 올바르게 동작하는가', async () => {
    const user = userEvent.setup()
    render(
      <ProfileForm
        name=""
        phoneNumber=""
        onNameChange={mockOnNameChange}
        onPhoneNumberChange={mockOnPhoneNumberChange}
        onNameBlur={mockOnNameBlur}
        onPhoneNumberBlur={mockOnPhoneNumberBlur}
      />
    )

    const nameInput = screen.getByLabelText(/이름/i)
    const phoneInput = screen.getByLabelText(/휴대폰번호/i)

    await user.click(nameInput)
    await user.click(phoneInput)
    await user.click(document.body)

    await waitFor(() => {
      expect(mockOnNameBlur).toHaveBeenCalled()
      expect(mockOnPhoneNumberBlur).toHaveBeenCalled()
    })
  })

  test('에러 메시지가 올바르게 표시되는가', () => {
    render(
      <ProfileForm
        name=""
        phoneNumber=""
        onNameChange={mockOnNameChange}
        onPhoneNumberChange={mockOnPhoneNumberChange}
        errors={{
          name: '이름을 입력해주세요',
          phoneNumber: '휴대폰번호를 입력해주세요'
        }}
      />
    )

    expect(screen.getByText('이름을 입력해주세요')).toBeInTheDocument()
    expect(screen.getByText('휴대폰번호를 입력해주세요')).toBeInTheDocument()
  })
})