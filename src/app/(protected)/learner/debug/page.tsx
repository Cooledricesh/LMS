'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // Supabase 세션에서 토큰 가져오기
      const { getSupabaseBrowserClient } = await import('@/lib/supabase/browser-client');
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      testResults.session = {
        hasToken: !!session?.access_token,
        tokenPreview: session?.access_token ? session.access_token.substring(0, 30) + '...' : null
      };

      // 1. Raw fetch with Authorization header
      const rawResponse = await fetch('/api/learner/enrolled-courses', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
          'Content-Type': 'application/json',
        },
      });

      testResults.rawFetch = {
        status: rawResponse.status,
        statusText: rawResponse.statusText,
        headers: Object.fromEntries(rawResponse.headers.entries()),
        contentType: rawResponse.headers.get('content-type'),
      };

      // Response body 읽기 시도
      const responseText = await rawResponse.text();
      testResults.responseText = responseText;

      // JSON 파싱 시도
      try {
        const jsonData = JSON.parse(responseText);
        testResults.parsedJson = jsonData;
      } catch (parseError) {
        testResults.jsonParseError = {
          error: parseError instanceof Error ? parseError.message : 'Parse failed',
          responsePreview: responseText.substring(0, 200),
        };
      }

      // 2. Simple enrolled API 호출
      const simpleResponse = await fetch('/api/enrolled-simple', {
        headers: {
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
          'Content-Type': 'application/json'
        }
      });

      const simpleText = await simpleResponse.text();
      testResults.simpleEnrolled = {
        status: simpleResponse.status,
        contentType: simpleResponse.headers.get('content-type'),
        responseText: simpleText.length > 500 ? simpleText.substring(0, 500) + '...' : simpleText
      };

      try {
        const simpleData = JSON.parse(simpleText);
        testResults.simpleEnrolledData = simpleData;
      } catch (e) {
        testResults.simpleEnrolledParseError = e instanceof Error ? e.message : 'Parse error';
      }

    } catch (error) {
      testResults.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">API Response 디버깅</h1>

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
                {typeof value === 'string'
                  ? value
                  : JSON.stringify(value, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}