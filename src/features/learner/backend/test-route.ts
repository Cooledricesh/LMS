import { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';

export const testRoutes = new Hono<AppEnv>()
  .get('/test', async (c) => {
    return c.json({
      success: true,
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    });
  })
  .get('/test-auth', async (c) => {
    const supabase = c.get('supabase');
    const logger = c.get('logger');

    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      logger.info('Test auth:', { user: user?.email, error });

      return c.json({
        success: true,
        user: user ? {
          id: user.id,
          email: user.email
        } : null,
        error: error?.message
      });
    } catch (error) {
      logger.error('Test auth error:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  })
  .get('/test-enrollments', async (c) => {
    const supabase = c.get('supabase');
    const logger = c.get('logger');

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (!user) {
        return c.json({ error: 'Not authenticated' }, 401);
      }

      // 직접 enrollments 조회
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('learner_id', user.id);

      logger.info('Test enrollments:', {
        userId: user.id,
        count: enrollments?.length,
        error
      });

      return c.json({
        success: true,
        userId: user.id,
        enrollments: enrollments || [],
        error: error?.message
      });
    } catch (error) {
      logger.error('Test enrollments error:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  });

export function registerTestRoutes(app: Hono<AppEnv>) {
  app.route('/api/learner', testRoutes);
}