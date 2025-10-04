'use client'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileForm } from '../ProfileForm'

describe('ProfileForm Component', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('프로필 필수 항목이 모두 입력되었는가 - 이름과 휴대폰번호 필드가 존재', () => {
    render(<ProfileForm value={{ name: '', phoneNumber: '' }} onChange={mockOnChange} />)

    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/휴대폰번호/i)).toBeInTheDocument()
  })

  test('이름 입력이 올바르게 동작하는가', async () => {
    const user = userEvent.setup()
    render(<ProfileForm value={{ name: '', phoneNumber: '' }} onChange={mockOnChange} />)

    const nameInput = screen.getByLabelText(/이름/i)
    await user.type(nameInput, '홍길동')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ name: '홍길동', phoneNumber: '' })
    })
  })

  test('휴대폰번호 입력이 올바르게 동작하는가', async () => {
    const user = userEvent.setup()
    render(<ProfileForm value={{ name: '', phoneNumber: '' }} onChange={mockOnChange} />)

    const phoneInput = screen.getByLabelText(/휴대폰번호/i)
    await user.type(phoneInput, '010-1234-5678')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({ name: '', phoneNumber: '010-1234-5678' })
    })
  })

  test('실시간 검증 - 휴대폰번호 형식 검증', async () => {
    const user = userEvent.setup()
    render(<ProfileForm value={{ name: '', phoneNumber: '' }} onChange={mockOnChange} />)

    const phoneInput = screen.getByLabelText(/휴대폰번호/i)

    // 잘못된 형식 입력
    await user.type(phoneInput, '123456')

    await waitFor(() => {
      // 에러 메시지가 표시되는지 확인
      expect(screen.queryByText(/올바른 휴대폰번호 형식이 아닙니다/i)).toBeInTheDocument()
    })
  })

  test('프로필 값이 올바르게 표시되는가', () => {
    const profileData = {
      name: '김철수',
      phoneNumber: '010-9876-5432'
    }

    render(<ProfileForm value={profileData} onChange={mockOnChange} />)

    expect(screen.getByDisplayValue('김철수')).toBeInTheDocument()
    expect(screen.getByDisplayValue('010-9876-5432')).toBeInTheDocument()
  })

  test('필수 항목 표시가 있는가', () => {
    render(<ProfileForm value={{ name: '', phoneNumber: '' }} onChange={mockOnChange} />)

    // 필수 표시 확인 (보통 * 또는 required 속성)
    const nameInput = screen.getByLabelText(/이름/i)
    const phoneInput = screen.getByLabelText(/휴대폰번호/i)

    expect(nameInput).toHaveAttribute('required')
    expect(phoneInput).toHaveAttribute('required')
  })
})