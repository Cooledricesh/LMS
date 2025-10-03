"use client";

import { useState, useCallback, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { RoleSelector } from './RoleSelector';
import { ProfileForm } from './ProfileForm';
import { TermsAgreement } from '@/features/terms/components/TermsAgreement';
import { validateSignupForm } from '@/features/onboarding/lib/validation';
import { useSignup } from '@/features/onboarding/hooks/useSignup';
import { useTerms } from '@/features/terms/hooks/useTerms';
import type { UserRole } from '@/features/onboarding/constants/roles';
import type { SignupRequest } from '@/features/onboarding/lib/dto';

interface SignupFormProps {
  onSuccess?: (data: { role: UserRole; email: string }) => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    name: '',
    phoneNumber: '',
    termsAgreed: {
      service: false,
      privacy: false,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { mutate: signup, isPending: isSigningUp } = useSignup();
  const { data: termsData, isLoading: isLoadingTerms } = useTerms();

  // 실시간 검증
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const validation = validateSignupForm(formData);
      setErrors(validation.errors);
    }
  }, [formData, touched]);

  const handleInputChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      setTouched(prev => ({ ...prev, [field]: true }));
    },
    []
  );

  const handleRoleChange = useCallback((role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
    setTouched(prev => ({ ...prev, role: true }));
  }, []);

  const handleProfileChange = useCallback(
    (field: 'name' | 'phoneNumber') => (value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setTouched(prev => ({ ...prev, [field]: true }));
    },
    []
  );

  const handleTermsChange = useCallback(
    (agreed: { service: boolean; privacy: boolean }) => {
      setFormData(prev => ({ ...prev, termsAgreed: agreed }));
      setTouched(prev => ({ ...prev, terms: true }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // 모든 필드 터치 처리
      const allTouched = Object.keys(formData).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // 최종 검증
      const validation = validateSignupForm(formData);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      if (!formData.role) {
        return;
      }

      // 회원가입 요청
      const signupData: SignupRequest = {
        email: formData.email,
        password: formData.password,
        role: formData.role as UserRole,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        termsAgreed: formData.termsAgreed,
      };

      signup(signupData, {
        onSuccess: () => {
          onSuccess?.({
            role: formData.role as UserRole,
            email: formData.email,
          });
        },
      });
    },
    [formData, signup, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 이메일 & 비밀번호 */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            이메일 <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="example@email.com"
            autoComplete="email"
            className={`
              w-full rounded-md border px-3 py-2
              focus:outline-none focus:ring-2
              ${
                errors.email && touched.email
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'
              }
            `}
          />
          {errors.email && touched.email && (
            <p className="text-sm text-rose-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            비밀번호 <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder="8자 이상, 영문/숫자/특수문자 포함"
              autoComplete="new-password"
              className={`
                w-full rounded-md border px-3 py-2 pr-10
                focus:outline-none focus:ring-2
                ${
                  errors.password && touched.password
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && touched.password && (
            <p className="text-sm text-rose-500 mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            비밀번호 확인 <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              placeholder="비밀번호를 다시 입력해주세요"
              autoComplete="new-password"
              className={`
                w-full rounded-md border px-3 py-2 pr-10
                focus:outline-none focus:ring-2
                ${
                  errors.confirmPassword && touched.confirmPassword
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="text-sm text-rose-500 mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* 역할 선택 */}
      <RoleSelector
        value={formData.role}
        onChange={handleRoleChange}
        error={errors.role && touched.role ? errors.role : undefined}
      />

      {/* 프로필 정보 */}
      <ProfileForm
        name={formData.name}
        phoneNumber={formData.phoneNumber}
        onNameChange={handleProfileChange('name')}
        onPhoneNumberChange={handleProfileChange('phoneNumber')}
        errors={{
          name: errors.name && touched.name ? errors.name : undefined,
          phoneNumber: errors.phoneNumber && touched.phoneNumber ? errors.phoneNumber : undefined,
        }}
      />

      {/* 약관 동의 */}
      {!isLoadingTerms && termsData && (
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            약관 동의 <span className="text-rose-500">*</span>
          </h3>
          <TermsAgreement
            terms={termsData.terms}
            onAgreementChange={handleTermsChange}
          />
          {errors.terms && touched.terms && (
            <p className="text-sm text-rose-500 mt-2">{errors.terms}</p>
          )}
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isSigningUp || isLoadingTerms}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSigningUp ? '회원가입 중...' : '회원가입'}
      </button>
    </form>
  );
}