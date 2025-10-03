"use client";

import { useState, useCallback } from 'react';

interface TermsAgreementState {
  service: boolean;
  privacy: boolean;
}

export function useTermsAgreement(initialState: TermsAgreementState = { service: false, privacy: false }) {
  const [agreed, setAgreed] = useState<TermsAgreementState>(initialState);

  const setAllAgreed = useCallback((value: boolean) => {
    setAgreed({
      service: value,
      privacy: value,
    });
  }, []);

  const setIndividualAgreed = useCallback((type: keyof TermsAgreementState, value: boolean) => {
    setAgreed(prev => ({
      ...prev,
      [type]: value,
    }));
  }, []);

  const toggleIndividualAgreed = useCallback((type: keyof TermsAgreementState) => {
    setAgreed(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  }, []);

  const isAllAgreed = agreed.service && agreed.privacy;
  const isRequiredAgreed = agreed.service && agreed.privacy; // 현재는 모두 필수

  const reset = useCallback(() => {
    setAgreed({ service: false, privacy: false });
  }, []);

  return {
    agreed,
    isAllAgreed,
    isRequiredAgreed,
    setAllAgreed,
    setIndividualAgreed,
    toggleIndividualAgreed,
    reset,
  };
}