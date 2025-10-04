"use client";

import { memo, useCallback } from 'react';
import { formatPhoneNumber } from '@/features/onboarding/lib/validation';

interface ProfileFormProps {
  name: string;
  phoneNumber: string;
  onNameChange: (name: string) => void;
  onPhoneNumberChange: (phoneNumber: string) => void;
  onNameBlur?: () => void;
  onPhoneNumberBlur?: () => void;
  errors?: {
    name?: string;
    phoneNumber?: string;
  };
}

export const ProfileForm = memo(function ProfileForm({
  name,
  phoneNumber,
  onNameChange,
  onPhoneNumberChange,
  onNameBlur,
  onPhoneNumberBlur,
  errors = {},
}: ProfileFormProps) {
  const handlePhoneNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      onPhoneNumberChange(formatted);
    },
    [onPhoneNumberChange]
  );

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          이름 <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={onNameBlur}
          placeholder="실명을 입력해주세요"
          className={`
            w-full rounded-md border px-3 py-2
            focus:outline-none focus:ring-2
            ${
              errors.name
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'
            }
          `}
          maxLength={50}
        />
        {errors.name && (
          <p className="text-sm text-rose-500 mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          휴대폰번호 <span className="text-rose-500">*</span>
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          onBlur={onPhoneNumberBlur}
          placeholder="010-1234-5678"
          className={`
            w-full rounded-md border px-3 py-2
            focus:outline-none focus:ring-2
            ${
              errors.phoneNumber
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'
            }
          `}
          maxLength={13}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-rose-500 mt-1">{errors.phoneNumber}</p>
        )}
        <p className="text-xs text-slate-500 mt-1">
          하이픈(-)은 자동으로 추가됩니다
        </p>
      </div>
    </div>
  );
});