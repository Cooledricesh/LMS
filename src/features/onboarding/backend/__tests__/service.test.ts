import { createUserProfile } from '../service'
import { onboardingErrorCodes } from '../error'
import type { SignupRequest } from '../schema'

// Mock Supabase client
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    admin: {
      deleteUser: jest.fn()
    }
  },
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn()
    }))
  }))
}

describe('createUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('약관 동의 검증 테스트', () => {
    test('필수 약관 미동의 시 에러 반환', async () => {
      const request: SignupRequest = {
        email: 'test@example.com',
        password: 'Password123!',
        role: 'learner',
        name: '홍길동',
        phoneNumber: '010-1234-5678',
        termsAgreed: {
          service: true,
          privacy: false // 필수 약관 미동의
        }
      }

      const result = await createUserProfile(mockSupabase as any, request)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(onboardingErrorCodes.termsNotAgreed)
      }
    })

    test('모든 필수 약관 동의 시 통과', async () => {
      // Mock: 회원가입 성공
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'new-user-id', email: 'test@example.com' },
          session: { access_token: 'token123' }
        },
        error: null
      })

      // Mock: 프로필 생성 성공
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'new-user-id',
                role: 'learner',
                name: '홍길동',
                phone_number: '01012345678',
                created_at: new Date().toISOString()
              },
              error: null
            }))
          }))
        }))
      })

      // Mock: 약관 동의 저장 성공
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => Promise.resolve({
          data: null,
          error: null
        }))
      })

      const request: SignupRequest = {
        email: 'test@example.com',
        password: 'Password123!',
        role: 'learner',
        name: '홍길동',
        phoneNumber: '010-1234-5678',
        termsAgreed: {
          service: true,
          privacy: true // 모든 필수 약관 동의
        }
      }

      const result = await createUserProfile(mockSupabase as any, request)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userId).toBe('new-user-id')
        expect(result.data.role).toBe('learner')
      }
    })
  })

  describe('이메일 중복 체크 테스트', () => {
    test('이메일이 이미 존재하는 경우 에러 반환', async () => {
      // Mock: 이메일이 이미 존재
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: null
        },
        error: {
          message: 'User already registered'
        }
      })

      const request: SignupRequest = {
        email: 'existing@example.com',
        password: 'Password123!',
        role: 'learner',
        name: '홍길동',
        phoneNumber: '010-1234-5678',
        termsAgreed: {
          service: true,
          privacy: true
        }
      }

      const result = await createUserProfile(mockSupabase as any, request)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(onboardingErrorCodes.emailAlreadyExists)
      }
    })
  })

  describe('프로필 생성 성공/실패 테스트', () => {
    beforeEach(() => {
      // Mock: 회원가입 성공
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'new-user-id', email: 'test@example.com' },
          session: { access_token: 'token123' }
        },
        error: null
      })
    })

    test('프로필 생성 성공', async () => {
      // Mock: 프로필 생성 성공
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'new-user-id',
                role: 'learner',
                name: '홍길동',
                phone_number: '01012345678',
                created_at: new Date().toISOString()
              },
              error: null
            }))
          }))
        }))
      })

      // Mock: 약관 동의 저장 성공
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => Promise.resolve({
          data: null,
          error: null
        }))
      })

      const request: SignupRequest = {
        email: 'test@example.com',
        password: 'Password123!',
        role: 'learner',
        name: '홍길동',
        phoneNumber: '010-1234-5678',
        termsAgreed: {
          service: true,
          privacy: true
        }
      }

      const result = await createUserProfile(mockSupabase as any, request)

      expect(result.success).toBe(true)
    })

    test('프로필 생성 실패 시 Auth 유저 삭제', async () => {
      // Mock: 프로필 생성 실패
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Profile creation failed' }
            }))
          }))
        }))
      })

      const request: SignupRequest = {
        email: 'test@example.com',
        password: 'Password123!',
        role: 'learner',
        name: '홍길동',
        phoneNumber: '010-1234-5678',
        termsAgreed: {
          service: true,
          privacy: true
        }
      }

      const result = await createUserProfile(mockSupabase as any, request)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(onboardingErrorCodes.profileCreationFailed)
      }
      // Auth 유저 삭제가 호출되었는지 확인
      expect(mockSupabase.auth.admin.deleteUser).toHaveBeenCalledWith('new-user-id')
    })
  })

  describe('역할 검증 테스트', () => {
    test('유효하지 않은 역할인 경우 에러 반환', async () => {
      const request: SignupRequest = {
        email: 'test@example.com',
        password: 'Password123!',
        role: 'admin' as any, // 유효하지 않은 역할
        name: '홍길동',
        phoneNumber: '010-1234-5678',
        termsAgreed: {
          service: true,
          privacy: true
        }
      }

      const result = await createUserProfile(mockSupabase as any, request)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe(onboardingErrorCodes.invalidInput)
      }
    })

    test('유효한 역할(learner, instructor)인 경우 통과', async () => {
      const roles: Array<'learner' | 'instructor'> = ['learner', 'instructor']

      for (const role of roles) {
        // Mock 재설정
        jest.clearAllMocks()

        mockSupabase.auth.signUp.mockResolvedValue({
          data: {
            user: { id: `user-${role}`, email: `${role}@example.com` },
            session: { access_token: 'token123' }
          },
          error: null
        })

        mockSupabase.from.mockReturnValueOnce({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: {
                  id: `user-${role}`,
                  role,
                  name: '홍길동',
                  phone_number: '01012345678',
                  created_at: new Date().toISOString()
                },
                error: null
              }))
            }))
          }))
        })

        mockSupabase.from.mockReturnValueOnce({
          insert: jest.fn(() => Promise.resolve({
            data: null,
            error: null
          }))
        })

        const request: SignupRequest = {
          email: `${role}@example.com`,
          password: 'Password123!',
          role: role,
          name: '홍길동',
          phoneNumber: '010-1234-5678',
          termsAgreed: {
            service: true,
            privacy: true
          }
        }

        const result = await createUserProfile(mockSupabase as any, request)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.role).toBe(role)
        }
      }
    })
  })

  describe('약관 동의 이력 저장 테스트', () => {
    test('약관 동의 이력이 저장되는지 확인', async () => {
      // Mock: 회원가입 성공
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'new-user-id', email: 'test@example.com' },
          session: { access_token: 'token123' }
        },
        error: null
      })

      // 프로필 생성 Mock
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'new-user-id',
                role: 'learner',
                name: '홍길동',
                phone_number: '01012345678',
                created_at: new Date().toISOString()
              },
              error: null
            }))
          }))
        }))
      })

      // 약관 동의 저장 Mock
      const insertMock = jest.fn(() => Promise.resolve({
        data: null,
        error: null
      }))

      mockSupabase.from.mockReturnValueOnce({
        insert: insertMock
      })

      const request: SignupRequest = {
        email: 'test@example.com',
        password: 'Password123!',
        role: 'learner',
        name: '홍길동',
        phoneNumber: '010-1234-5678',
        termsAgreed: {
          service: true,
          privacy: true,
          marketing: true
        }
      }

      const result = await createUserProfile(mockSupabase as any, request)

      expect(result.success).toBe(true)

      // 약관 동의 저장이 호출되었는지 확인
      expect(mockSupabase.from).toHaveBeenCalledWith('terms_agreements')
      expect(insertMock).toHaveBeenCalled()

      const insertCall = insertMock.mock.calls[0][0]
      expect(insertCall).toEqual(expect.arrayContaining([
        expect.objectContaining({
          user_id: 'new-user-id',
          terms_type: 'service',
          terms_version: expect.any(String),
          agreed_at: expect.any(String)
        }),
        expect.objectContaining({
          user_id: 'new-user-id',
          terms_type: 'privacy',
          terms_version: expect.any(String),
          agreed_at: expect.any(String)
        })
      ]))
    })
  })
})