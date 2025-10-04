'use client'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from '../SignupForm'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('SignupForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('이메일 형식 검증이 올바르게 동작하는가', async () => {
    const user = userEvent.setup()
    render(<SignupForm />, { wrapper })

    const emailInput = screen.getByLabelText(/이메일/i)

    // 잘못된 이메일 형식 입력
    await user.type(emailInput, 'invalid-email')
    await user.tab() // focus 이동으로 검증 트리거

    await waitFor(() => {
      expect(screen.queryByText(/올바른 이메일 형식이 아닙니다/i)).toBeInTheDocument()
    })

    // 올바른 이메일 형식 입력
    await user.clear(emailInput)
    await user.type(emailInput, 'test@example.com')
    await user.tab()

    await waitFor(() => {
      expect(screen.queryByText(/올바른 이메일 형식이 아닙니다/i)).not.toBeInTheDocument()
    })
  })

  test('비밀번호 정책이 올바르게 적용되는가', async () => {
    const user = userEvent.setup()
    render(<SignupForm />, { wrapper })

    const passwordInput = screen.getByLabelText(/비밀번호/i)

    // 너무 짧은 비밀번호
    await user.type(passwordInput, 'short')
    await user.tab()

    await waitFor(() => {
      expect(screen.queryByText(/비밀번호는 8자 이상이어야 합니다/i)).toBeInTheDocument()
    })

    // 특수문자 없는 비밀번호
    await user.clear(passwordInput)
    await user.type(passwordInput, 'password123')
    await user.tab()

    await waitFor(() => {
      expect(screen.queryByText(/특수문자를 포함해야 합니다/i)).toBeInTheDocument()
    })

    // 올바른 비밀번호
    await user.clear(passwordInput)
    await user.type(passwordInput, 'Password123!')
    await user.tab()

    await waitFor(() => {
      expect(screen.queryByText(/비밀번호는 8자 이상이어야 합니다/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/특수문자를 포함해야 합니다/i)).not.toBeInTheDocument()
    })
  })

  test('역할 선택이 필수인가', async () => {
    const user = userEvent.setup()
    render(<SignupForm />, { wrapper })

    const submitButton = screen.getByRole('button', { name: /회원가입/i })

    // 역할 선택 없이 제출 시도
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText(/역할을 선택해주세요/i)).toBeInTheDocument()
    })
  })

  test('프로필 필수 항목이 모두 입력되었는가', async () => {
    const user = userEvent.setup()
    render(<SignupForm />, { wrapper })

    const submitButton = screen.getByRole('button', { name: /회원가입/i })

    // 프로필 정보 없이 제출 시도
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText(/이름을 입력해주세요/i)).toBeInTheDocument()
      expect(screen.queryByText(/휴대폰번호를 입력해주세요/i)).toBeInTheDocument()
    })
  })

  test('약관 동의 없이 제출이 차단되는가', async () => {
    const user = userEvent.setup()
    render(<SignupForm />, { wrapper })

    // 모든 필드 입력
    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password123!')

    const learnerRadio = screen.getByRole('radio', { name: /학습자/i })
    await user.click(learnerRadio)

    await user.type(screen.getByLabelText(/이름/i), '홍길동')
    await user.type(screen.getByLabelText(/휴대폰번호/i), '010-1234-5678')

    // 약관 동의 없이 제출 시도
    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText(/약관에 동의해주세요/i)).toBeInTheDocument()
    })
  })

  test('중복 이메일 에러가 올바르게 표시되는가', async () => {
    const user = userEvent.setup()

    // API 모킹
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: { code: 'EMAIL_ALREADY_EXISTS', message: '이미 사용중인 이메일입니다.' }
        })
      })
    ) as jest.Mock

    render(<SignupForm />, { wrapper })

    // 모든 필드 입력
    await user.type(screen.getByLabelText(/이메일/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password123!')

    const learnerRadio = screen.getByRole('radio', { name: /학습자/i })
    await user.click(learnerRadio)

    await user.type(screen.getByLabelText(/이름/i), '홍길동')
    await user.type(screen.getByLabelText(/휴대폰번호/i), '010-1234-5678')

    // 약관 동의
    const agreeCheckbox = screen.getByRole('checkbox', { name: /모두 동의합니다/i })
    await user.click(agreeCheckbox)

    // 제출
    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText(/이미 사용중인 이메일입니다/i)).toBeInTheDocument()
    })
  })

  test('네트워크 오류 시 재시도가 가능한가', async () => {
    const user = userEvent.setup()
    let callCount = 0

    // API 모킹 - 첫 번째는 실패, 두 번째는 성공
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.reject(new Error('Network error'))
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { userId: '123', role: 'learner' }
        })
      })
    }) as jest.Mock

    render(<SignupForm />, { wrapper })

    // 모든 필드 입력
    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password123!')

    const learnerRadio = screen.getByRole('radio', { name: /학습자/i })
    await user.click(learnerRadio)

    await user.type(screen.getByLabelText(/이름/i), '홍길동')
    await user.type(screen.getByLabelText(/휴대폰번호/i), '010-1234-5678')

    const agreeCheckbox = screen.getByRole('checkbox', { name: /모두 동의합니다/i })
    await user.click(agreeCheckbox)

    // 첫 번째 제출 (실패)
    const submitButton = screen.getByRole('button', { name: /회원가입/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText(/네트워크 오류가 발생했습니다/i)).toBeInTheDocument()
    })

    // 재시도
    await user.click(submitButton)

    await waitFor(() => {
      expect(callCount).toBe(2)
    })
  })

  test('모든 필수 필드가 표시되는가', () => {
    render(<SignupForm />, { wrapper })

    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /학습자/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /강사/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/휴대폰번호/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /모두 동의합니다/i })).toBeInTheDocument()
  })
})