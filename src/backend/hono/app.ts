import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { optionalAuth } from '@/backend/middleware/auth';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerOnboardingRoutes } from '@/features/onboarding/backend/route';
import { registerTermsRoutes } from '@/features/terms/backend/route';
import { registerCoursesRoutes } from '@/features/courses/backend/route';
import { registerEnrollmentsRoutes } from '@/features/enrollments/backend/route';
import { registerProfilesRoutes } from '@/features/profiles/backend/route';
import { registerAssignmentRoutes } from '@/features/assignments/backend/route';
import { registerLearnerRoutes } from '@/features/learner/backend/route';
import { registerTestRoutes } from '@/features/learner/backend/test-route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());
  app.use('*', optionalAuth());

  registerExampleRoutes(app);
  registerOnboardingRoutes(app);
  registerTermsRoutes(app);
  registerCoursesRoutes(app);
  registerEnrollmentsRoutes(app);
  registerProfilesRoutes(app);
  registerAssignmentRoutes(app);
  registerLearnerRoutes(app);
  registerTestRoutes(app);

  singletonApp = app;

  return app;
};
