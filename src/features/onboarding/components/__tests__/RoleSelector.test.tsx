'use client'

import { render, screen, fireEvent } from '@testing-library/react'
import { RoleSelector } from '../RoleSelector'
import { USER_ROLES } from '../../constants/roles'

describe('RoleSelector Component', () => {
  const mockOnRoleChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('역할 선택이 필수인가 - 초기에는 아무것도 선택되지 않음', () => {
    render(<RoleSelector value="" onChange={mockOnRoleChange} />)

    const learnerRadio = screen.getByRole('radio', { name: /학습자/i })
    const instructorRadio = screen.getByRole('radio', { name: /강사/i })

    expect(learnerRadio).not.toBeChecked()
    expect(instructorRadio).not.toBeChecked()
  })

  test('Learner/Instructor 선택이 올바르게 동작하는가', () => {
    render(<RoleSelector value="" onChange={mockOnRoleChange} />)

    const learnerRadio = screen.getByRole('radio', { name: /학습자/i })
    fireEvent.click(learnerRadio)

    expect(mockOnRoleChange).toHaveBeenCalledWith(USER_ROLES.LEARNER)
  })

  test('역할 설명이 표시되는가', () => {
    render(<RoleSelector value="" onChange={mockOnRoleChange} />)

    expect(screen.getByText(/강의를 수강하고 학습을 진행합니다/i)).toBeInTheDocument()
    expect(screen.getByText(/강의를 생성하고 관리합니다/i)).toBeInTheDocument()
  })

  test('선택된 역할이 올바르게 표시되는가', () => {
    const { rerender } = render(
      <RoleSelector value={USER_ROLES.LEARNER} onChange={mockOnRoleChange} />
    )

    const learnerRadio = screen.getByRole('radio', { name: /학습자/i })
    expect(learnerRadio).toBeChecked()

    rerender(
      <RoleSelector value={USER_ROLES.INSTRUCTOR} onChange={mockOnRoleChange} />
    )

    const instructorRadio = screen.getByRole('radio', { name: /강사/i })
    expect(instructorRadio).toBeChecked()
  })

  test('역할 변경이 올바르게 동작하는가', () => {
    const { rerender } = render(
      <RoleSelector value={USER_ROLES.LEARNER} onChange={mockOnRoleChange} />
    )

    const instructorRadio = screen.getByRole('radio', { name: /강사/i })
    fireEvent.click(instructorRadio)

    expect(mockOnRoleChange).toHaveBeenCalledWith(USER_ROLES.INSTRUCTOR)
  })
})