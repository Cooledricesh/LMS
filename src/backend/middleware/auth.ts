import { createMiddleware } from 'hono/factory';
import type { User } from '@supabase/supabase-js';
import { contextKeys, type AppEnv } from '@/backend/hono/context';

/**
 * 인증 미들웨어 - JWT 토큰을 파싱하여 현재 사용자를 context에 저장
 * 인증이 필요한 route에서 사용
 */
export const requireAuth = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    const supabase = c.get('supabase');
    const logger = c.get('logger');

    // Authorization 헤더에서 토큰 추출
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('No authorization token provided');
      // 토큰이 없어도 다음 미들웨어로 진행 (각 route에서 처리)
      await next();
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Service role client를 사용할 때는 토큰을 명시적으로 전달해야 함
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error) {
        logger.warn('Invalid or expired token', { error: error.message });
        // 유효하지 않은 토큰이어도 다음 미들웨어로 진행
        await next();
        return;
      }

      if (user) {
        // 현재 사용자를 context에 저장
        c.set('user', user);
        logger.debug('User authenticated', { userId: user.id, email: user.email });
      }
    } catch (err) {
      logger.error('Error validating auth token', err);
    }

    await next();
  });

/**
 * 옵셔널 인증 미들웨어 - 토큰이 있으면 파싱하지만 없어도 에러 없이 진행
 */
export const optionalAuth = () => requireAuth();

/**
 * Context에서 현재 사용자 가져오기
 */
export const getAuthUser = (c: any): User | undefined => {
  return c.get('user');
};

/**
 * 인증된 사용자가 필요한 경우 사용하는 헬퍼
 */
export const requireAuthUser = (c: any): User => {
  const user = getAuthUser(c);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};