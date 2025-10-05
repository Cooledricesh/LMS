'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

export default function TestPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // 1. Supabase 인증 확인
      const supabase = getSupabaseBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      testResults.auth = { user: user?.email, id: user?.id, error: authError?.message };

      // 2. 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      testResults.session = {
        hasToken: !!session?.access_token,
        tokenPreview: session?.access_token?.substring(0, 20) + '...'
      };

      // 3. 프로필 확인
      const profileResponse = await apiClient.get('/api/profiles/me');
      const profileData = await profileResponse.json();
      testResults.profile = profileData;

      // 4. Enrollments 테이블 직접 조회
      if (user) {
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('learner_id', user.id);
        testResults.directEnrollments = {
          count: enrollments?.length || 0,
          data: enrollments,
          error: enrollError?.message
        };
      }

      // 5. Enrolled courses API 호출
      const enrolledResponse = await apiClient.get('/api/learner/enrolled-courses');
      const enrolledData = await enrolledResponse.json();
      testResults.enrolledCoursesAPI = {
        status: enrolledResponse.status,
        data: enrolledData,
        isArray: Array.isArray(enrolledData),
        count: Array.isArray(enrolledData) ? enrolledData.length : 0
      };

      // 6. Courses 테이블 확인 (enrollments에 있는 course_id들이 실제로 존재하는지)
      if (testResults.directEnrollments?.data?.length > 0) {
        const courseIds = testResults.directEnrollments.data.map((e: any) => e.course_id);
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);
        testResults.courses = {
          requestedIds: courseIds,
          foundCount: courses?.length || 0,
          data: courses,
          error: coursesError?.message
        };
      }

    } catch (error) {
      testResults.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">API 디버깅 테스트</h1>

      <Button onClick={runTests} disabled={loading} className="mb-6">
        {loading ? '테스트 실행 중...' : '테스트 실행'}
      </Button>

      <div className="space-y-4">
        {Object.entries(results).map(([key, value]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-lg">{key}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
                {JSON.stringify(value, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}