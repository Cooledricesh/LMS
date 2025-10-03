import type { Hono } from 'hono';
import { respond } from '@/backend/http/response';
import { getLogger, type AppEnv } from '@/backend/hono/context';
import { getLatestTerms } from './service';

export const registerTermsRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/terms/latest', async (c) => {
    const logger = getLogger(c);

    try {
      const result = await getLatestTerms();

      logger.info('Terms fetched successfully');

      return respond(c, result);
    } catch (error) {
      logger.error('Failed to fetch terms', error);

      return c.json(
        {
          ok: false,
          error: {
            code: 'TERMS_FETCH_ERROR',
            message: 'Failed to fetch terms',
          }
        },
        500
      );
    }
  });
};