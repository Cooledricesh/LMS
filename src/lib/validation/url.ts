/**
 * URL 검증 유틸리티
 */

/**
 * URL 유효성 검사
 * @param url - 검사할 URL 문자열
 * @returns 유효한 URL 여부
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * URL 정규화
 * @param url - 정규화할 URL
 * @returns 정규화된 URL 또는 null
 */
export const normalizeUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    const trimmedUrl = url.trim();

    // 프로토콜이 없으면 https 추가
    const urlWithProtocol = trimmedUrl.match(/^https?:\/\//)
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    const urlObj = new URL(urlWithProtocol);
    return urlObj.href;
  } catch {
    return null;
  }
};

/**
 * URL에서 도메인 추출
 * @param url - URL 문자열
 * @returns 도메인 또는 null
 */
export const extractDomain = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
};

/**
 * 안전한 URL인지 검사 (보안 검증)
 * @param url - 검사할 URL
 * @returns 안전한 URL 여부
 */
export const isSafeUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;

  try {
    const urlObj = new URL(url);

    // javascript: 프로토콜 차단
    if (urlObj.protocol === 'javascript:') return false;

    // data: 프로토콜 차단
    if (urlObj.protocol === 'data:') return false;

    // file: 프로토콜 차단
    if (urlObj.protocol === 'file:') return false;

    return true;
  } catch {
    return false;
  }
};