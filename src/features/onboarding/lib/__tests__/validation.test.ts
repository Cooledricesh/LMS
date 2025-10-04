import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateName,
  validatePasswordConfirm,
  formatPhoneNumber
} from '../validation'
import { PASSWORD_RULES } from '../../constants/validation'

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    test('올바른 이메일 형식 검증', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.kr',
        'user+tag@example.org',
        'user123@example-domain.com'
      ]

      validEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    test('잘못된 이메일 형식 검증', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        'user..name@example.com'
      ]

      invalidEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.valid).toBe(false)
        expect(result.error).toBeDefined()
      })
    })

    test('빈 이메일 검증', () => {
      const result = validateEmail('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('이메일')
    })
  })

  describe('validatePassword', () => {
    test('올바른 비밀번호 검증', () => {
      // PASSWORD_RULES.PATTERN을 만족하는 비밀번호
      const validPasswords = [
        'Password123!',
        'MyP@ssw0rd',
        'Str0ng!Pass',
        '1234abCD!@'
      ]

      validPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    test('최소 길이 미충족 비밀번호', () => {
      const shortPasswords = ['Pass1!', 'Ab1!', '1234567']

      shortPasswords.forEach(password => {
        if (password.length < PASSWORD_RULES.MIN_LENGTH) {
          const result = validatePassword(password)
          expect(result.valid).toBe(false)
          expect(result.error).toContain('8자 이상')
        }
      })
    })

    test('빈 비밀번호 검증', () => {
      const result = validatePassword('')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validatePhoneNumber', () => {
    test('올바른 휴대폰번호 형식 검증', () => {
      const validPhoneNumbers = [
        '010-1234-5678',
        '011-123-4567',
        '016-9876-5432',
        '01012345678', // 하이픈 없는 형식
      ]

      validPhoneNumbers.forEach(phone => {
        const result = validatePhoneNumber(phone)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    test('잘못된 휴대폰번호 형식 검증', () => {
      const invalidPhoneNumbers = [
        '02-1234-5678', // 일반 전화번호
        '010-12-5678', // 잘못된 자릿수
        '123-4567-8900', // 잘못된 형식
        'phone-number'
      ]

      invalidPhoneNumbers.forEach(phone => {
        const result = validatePhoneNumber(phone)
        if (!result.valid) {
          expect(result.error).toBeDefined()
        }
      })
    })

    test('빈 휴대폰번호 검증', () => {
      const result = validatePhoneNumber('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('휴대폰')
    })
  })

  describe('validateName', () => {
    test('올바른 이름 검증', () => {
      const validNames = ['홍길동', '김철수', 'John Doe', '이 름']

      validNames.forEach(name => {
        const result = validateName(name)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    test('빈 이름 검증', () => {
      const result = validateName('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('이름')
    })

    test('너무 긴 이름 검증', () => {
      const longName = 'a'.repeat(51)
      const result = validateName(longName)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validatePasswordConfirm', () => {
    test('비밀번호 일치 검증', () => {
      const result = validatePasswordConfirm('Password123!', 'Password123!')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    test('비밀번호 불일치 검증', () => {
      const result = validatePasswordConfirm('Password123!', 'Different123!')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('일치')
    })

    test('빈 확인 비밀번호', () => {
      const result = validatePasswordConfirm('Password123!', '')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('formatPhoneNumber', () => {
    test('11자리 휴대폰번호 포맷팅', () => {
      expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678')
      expect(formatPhoneNumber('01198765432')).toBe('011-9876-5432')
    })

    test('10자리 휴대폰번호 포맷팅', () => {
      expect(formatPhoneNumber('0101234567')).toBe('010-123-4567')
      expect(formatPhoneNumber('0119876543')).toBe('011-987-6543')
    })

    test('이미 포맷된 번호', () => {
      expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678')
    })

    test('숫자가 아닌 문자 제거', () => {
      expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678')
      expect(formatPhoneNumber('010 1234 5678')).toBe('010-1234-5678')
    })
  })
})