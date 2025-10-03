"use client";

import { memo } from 'react';
import { GraduationCap, Users } from 'lucide-react';
import {
  USER_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  type UserRole,
} from '@/features/onboarding/constants/roles';

interface RoleSelectorProps {
  value: UserRole | '';
  onChange: (role: UserRole) => void;
  error?: string;
}

export const RoleSelector = memo(function RoleSelector({
  value,
  onChange,
  error,
}: RoleSelectorProps) {
  const roles = [
    {
      value: USER_ROLES.LEARNER,
      label: ROLE_LABELS[USER_ROLES.LEARNER],
      description: ROLE_DESCRIPTIONS[USER_ROLES.LEARNER],
      icon: GraduationCap,
    },
    {
      value: USER_ROLES.INSTRUCTOR,
      label: ROLE_LABELS[USER_ROLES.INSTRUCTOR],
      description: ROLE_DESCRIPTIONS[USER_ROLES.INSTRUCTOR],
      icon: Users,
    },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        역할 선택 <span className="text-rose-500">*</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map(role => {
          const Icon = role.icon;
          const isSelected = value === role.value;

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value as UserRole)}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`
                    p-2 rounded-lg
                    ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{role.label}</h3>
                  <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                </div>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="h-2 w-2 bg-slate-900 rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-rose-500 mt-1">{error}</p>}
    </div>
  );
});