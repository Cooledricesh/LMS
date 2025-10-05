'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  GradeSubmissionRequestSchema,
  type GradeSubmissionRequest,
  type SubmissionForGrading,
} from '../lib/dto';

interface GradingFormProps {
  submission: SubmissionForGrading;
  onSubmit: (data: GradeSubmissionRequest) => Promise<void>;
  onCancel: () => void;
}

export const GradingForm: React.FC<GradingFormProps> = ({
  submission,
  onSubmit,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const form = useForm<GradeSubmissionRequest>({
    resolver: zodResolver(GradeSubmissionRequestSchema),
    defaultValues: {
      score: submission.score ?? 0,
      feedback: submission.feedback ?? '',
      requestResubmission: false,
    },
  });

  const handleSubmit = async (values: GradeSubmissionRequest) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : '채점 처리 중 오류가 발생했습니다'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>점수 *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0-100"
                  disabled={isSubmitting}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>0~100 사이의 점수를 입력하세요</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>피드백 *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="학습자에게 전달할 피드백을 입력하세요"
                  rows={6}
                  disabled={isSubmitting}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>피드백은 필수 입력입니다</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requestResubmission"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>재제출 요청</FormLabel>
                <FormDescription>
                  체크 시 학습자가 과제를 다시 제출할 수 있습니다
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            저장
          </Button>
        </div>
      </form>
    </Form>
  );
};
