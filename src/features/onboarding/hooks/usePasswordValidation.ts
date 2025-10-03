"use client";

import { useState, useEffect, useCallback } from 'react';
import { PASSWORD_RULES } from '@/features/onboarding/constants/validation';

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumberOrSpecial: boolean;
  };
}

export function usePasswordValidation(password: string) {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: 'bg-slate-200',
    requirements: {
      minLength: false,
      hasLetter: false,
      hasNumberOrSpecial: false,
    },
  });

  const calculateStrength = useCallback((pwd: string): PasswordStrength => {
    const requirements = {
      minLength: pwd.length >= PASSWORD_RULES.MIN_LENGTH,
      hasLetter: /[a-zA-Z]/.test(pwd),
      hasNumberOrSpecial: /[\d!@#$%^&*]/.test(pwd),
    };

    let score = 0;
    if (requirements.minLength) score++;
    if (requirements.hasLetter) score++;
    if (requirements.hasNumberOrSpecial) score++;
    if (pwd.length >= 12) score++;

    let label = '';
    let color = 'bg-slate-200';

    switch (score) {
      case 0:
        label = '';
        color = 'bg-slate-200';
        break;
      case 1:
        label = '매우 약함';
        color = 'bg-rose-500';
        break;
      case 2:
        label = '약함';
        color = 'bg-orange-500';
        break;
      case 3:
        label = '보통';
        color = 'bg-yellow-500';
        break;
      case 4:
        label = '강함';
        color = 'bg-emerald-500';
        break;
    }

    return {
      score,
      label,
      color,
      requirements,
    };
  }, []);

  useEffect(() => {
    if (password) {
      setStrength(calculateStrength(password));
    } else {
      setStrength({
        score: 0,
        label: '',
        color: 'bg-slate-200',
        requirements: {
          minLength: false,
          hasLetter: false,
          hasNumberOrSpecial: false,
        },
      });
    }
  }, [password, calculateStrength]);

  return strength;
}