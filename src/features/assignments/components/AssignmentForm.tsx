'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
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
import { useCreateAssignment } from '../hooks/useCreateAssignment';
import { useUpdateAssignment } from '../hooks/useUpdateAssignment';
import type { AssignmentManagementResponse } from '../lib/dto';

// Form schema
const assignmentFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자를 초과할 수 없습니다'),
  description: z.string().min(1, '설명을 입력해주세요').max(5000, '설명은 5000자를 초과할 수 없습니다'),
  dueDate: z.string().min(1, '마감일을 입력해주세요'),
  weight: z.coerce.number().int().min(0, '점수 비중은 0 이상이어야 합니다').max(100, '점수 비중은 100 이하여야 합니다'),
  allowLate: z.boolean().default(false),
  allowResubmission: z.boolean().default(false),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface AssignmentFormProps {
  mode: 'create' | 'edit';
  courseId: string;
  initialData?: AssignmentManagementResponse;
  onSuccess?: () => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  mode,
  courseId,
  initialData,
  onSuccess,
}) => {
  const router = useRouter();
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      weight: 0,
      allowLate: false,
      allowResubmission: false,
    },
  });

  // 수정 모드일 때 초기값 설정
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // ISO string을 datetime-local 형식으로 변환
      const dueDateLocal = initialData.dueDate
        ? new Date(initialData.dueDate).toISOString().slice(0, 16)
        : '';

      form.reset({
        title: initialData.title,
        description: initialData.description,
        dueDate: dueDateLocal,
        weight: initialData.weight,
        allowLate: initialData.allowLate,
        allowResubmission: initialData.allowResubmission,
      });
    }
  }, [mode, initialData, form]);

  const handleSubmit = async (values: AssignmentFormValues) => {
    try {
      // datetime-local을 ISO string으로 변환
      const dueDateISO = new Date(values.dueDate).toISOString();

      if (mode === 'create') {
        await createMutation.mutateAsync({
          courseId,
          title: values.title,
          description: values.description,
          dueDate: dueDateISO,
          weight: values.weight,
          allowLate: values.allowLate,
          allowResubmission: values.allowResubmission,
        });
      } else {
        if (!initialData?.id) {
          throw new Error('과제 ID가 필요합니다');
        }
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: {
            title: values.title,
            description: values.description,
            dueDate: dueDateISO,
            weight: values.weight,
            allowLate: values.allowLate,
            allowResubmission: values.allowResubmission,
          },
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/instructor/courses/${courseId}/assignments`);
      }
    } catch (error) {
      console.error('과제 저장 실패:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>제목 *</FormLabel>
                <FormControl>
                  <Input placeholder="과제 제목을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>설명 *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="과제 설명을 입력하세요"
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>마감일 *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    미래 날짜를 선택해주세요
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>점수 비중 (%) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0-100"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    전체 성적에서 차지하는 비중 (0-100%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="allowLate"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <div className="space-y-0">
                    <FormLabel className="font-normal cursor-pointer">
                      지각 제출 허용
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowResubmission"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <div className="space-y-0">
                    <FormLabel className="font-normal cursor-pointer">
                      재제출 허용
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? '생성' : '저장'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              취소
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
