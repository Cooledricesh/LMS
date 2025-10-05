import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { getAuthUser } from '@/backend/middleware/auth';
import { getProfileById } from '@/features/profiles/backend/service';
import { profileErrorCodes } from '@/features/profiles/backend/error';

export const registerProfilesRoutes = (app: Hono<AppEnv>) => {
  // GET /api/profiles/me - Get current user's profile
  app.get('/api/profiles/me', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Get current user from auth middleware
    const user = getAuthUser(c);

    if (!user) {
      return respond(
        c,
        failure(
          401,
          profileErrorCodes.unauthorized,
          'Authorization token required'
        )
      );
    }

    logger.info('Fetching profile for current user', { userId: user.id });

    const result = await getProfileById(supabase, user.id);

    if (!result.ok) {
      logger.error('Failed to fetch profile', result);
    }

    return respond(c, result);
  });

  // GET /api/profiles/:id - Get profile by ID
  app.get('/api/profiles/:id', async (c) => {
    const userId = c.req.param('id');
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return respond(
        c,
        failure(
          400,
          profileErrorCodes.fetchError,
          'Invalid user ID format'
        )
      );
    }

    logger.info('Fetching profile', { userId });

    const result = await getProfileById(supabase, userId);

    if (!result.ok) {
      logger.error('Failed to fetch profile', result);
    }

    return respond(c, result);
  });
};