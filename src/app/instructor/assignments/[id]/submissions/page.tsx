'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { SubmissionsTable } from '@/features/grading/components/SubmissionsTable';
import { GradingDialog } from '@/features/grading/components/GradingDialog';
import type { SubmissionForGrading } from '@/features/grading/lib/dto';

export default function SubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [selectedSubmission, setSelectedSubmission] = React.useState<SubmissionForGrading | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleGradeClick = (submission: SubmissionForGrading) => {
    setSelectedSubmission(submission);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSubmission(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">제출물 관리</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>제출물 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionsTable assignmentId={assignmentId} onGradeClick={handleGradeClick} />
          </CardContent>
        </Card>
      </main>

      {/* Grading Dialog */}
      <GradingDialog
        submission={selectedSubmission}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
