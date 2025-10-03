"use client";

import { useState, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { TermsContent } from '@/features/terms/lib/dto';

interface TermsAgreementProps {
  terms: TermsContent[];
  onAgreementChange: (agreed: { service: boolean; privacy: boolean }) => void;
}

export function TermsAgreement({ terms, onAgreementChange }: TermsAgreementProps) {
  const [agreed, setAgreed] = useState({
    service: false,
    privacy: false,
  });
  const [allAgreed, setAllAgreed] = useState(false);
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // 모든 필수 약관 동의 여부 확인
    const allRequired = terms
      .filter(term => term.required)
      .every(term => agreed[term.type as keyof typeof agreed]);

    setAllAgreed(allRequired);
    onAgreementChange(agreed);
  }, [agreed, terms, onAgreementChange]);

  const handleAllAgree = useCallback(() => {
    const newState = !allAgreed;
    const newAgreed = {
      service: newState,
      privacy: newState,
    };
    setAgreed(newAgreed);
  }, [allAgreed]);

  const handleIndividualAgree = useCallback((type: 'service' | 'privacy') => {
    setAgreed(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  }, []);

  const toggleExpand = useCallback((type: string) => {
    setExpandedTerms(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 rounded-lg p-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={allAgreed}
            onChange={handleAllAgree}
            className="h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
          />
          <span className="ml-2 text-sm font-medium text-slate-900">
            전체 약관에 동의합니다
          </span>
        </label>
      </div>

      <div className="space-y-3">
        {terms.map(term => (
          <div
            key={term.type}
            className="border border-slate-200 rounded-lg overflow-hidden"
          >
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={agreed[term.type as keyof typeof agreed]}
                    onChange={() => handleIndividualAgree(term.type as 'service' | 'privacy')}
                    className="h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">
                    {term.required && (
                      <span className="text-rose-500 mr-1">(필수)</span>
                    )}
                    {term.title}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => toggleExpand(term.type)}
                  className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                  aria-label={expandedTerms[term.type] ? '접기' : '펼치기'}
                >
                  {expandedTerms[term.type] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              {expandedTerms[term.type] && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="max-h-48 overflow-y-auto">
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans">
                      {term.content}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!allAgreed && (
        <p className="text-xs text-rose-500 mt-2">
          서비스 이용을 위해 필수 약관에 모두 동의해주세요.
        </p>
      )}
    </div>
  );
}