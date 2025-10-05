'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

const submissionFormSchema = z.object({
  content: z.string()
    .min(1, '제출 내용을 입력해주세요')
    .max(5000, '제출 내용은 5000자를 초과할 수 없습니다'),
  link: z.string()
    .url('유효한 URL을 입력해주세요')
    .or(z.literal(''))
    .optional(),
});

type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

interface SubmissionFormProps {
  assignmentId: string;
  canSubmit: boolean;
  hasSubmitted: boolean;
  allowResubmission: boolean;
  existingSubmission?: {
    content: string;
    link: string | null;
    status: 'submitted' | 'graded' | 'resubmission_required';
  } | null;
  onSubmit?: (values: { content: string; link?: string }) => Promise<void>;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  assignmentId,
  canSubmit,
  hasSubmitted,
  allowResubmission,
  existingSubmission,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      content: existingSubmission?.content || '',
      link: existingSubmission?.link || '',
    },
  });

  const handleSubmit = async (values: SubmissionFormValues) => {
    if (!onSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await onSubmit({
        content: values.content,
        link: values.link || undefined
      });
      setSubmitSuccess(true);
      if (!allowResubmission) {
        form.reset();
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : '제출 중 오류가 발생했습니다'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine button text and disabled state
  const getSubmitButtonText = () => {
    if (isSubmitting) return '제출 중...';
    if (!hasSubmitted) return '과제 제출';
    if (existingSubmission?.status === 'resubmission_required') return '재제출';
    if (allowResubmission) return '수정 제출';
    return '제출 완료';
  };

  const isFormDisabled = !canSubmit || (hasSubmitted && !allowResubmission && existingSubmission?.status !== 'resubmission_required');

  return (
    <div className="space-y-4">
      {!canSubmit && !hasSubmitted && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            과제를 제출하려면 먼저 코스에 등록해야 합니다.
          </AlertDescription>
        </Alert>
      )}

      {hasSubmitted && existingSubmission?.status === 'graded' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            이미 채점된 과제입니다. {allowResubmission ? '재제출이 허용되어 있습니다.' : '재제출이 허용되지 않습니다.'}
          </AlertDescription>
        </Alert>
      )}

      {existingSubmission?.status === 'resubmission_required' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            강사가 재제출을 요청했습니다. 피드백을 확인하고 다시 제출해주세요.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>제출 내용 *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="과제 답변을 입력해주세요"
                    rows={10}
                    disabled={isFormDisabled || isSubmitting}
                    className="resize-none"
                  />
                </FormControl>
                <FormDescription>
                  과제 내용을 작성해주세요 (최대 5000자)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>참고 링크 (선택)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="url"
                    placeholder="https://example.com"
                    disabled={isFormDisabled || isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  관련 링크가 있다면 입력해주세요
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert>
              <AlertDescription>
                과제가 성공적으로 제출되었습니다!
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isFormDisabled || isSubmitting}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getSubmitButtonText()}
          </Button>
        </form>
      </Form>
    </div>
  );
};