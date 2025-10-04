'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, User } from 'lucide-react';
import type { CourseResponse } from '@/features/courses/lib/dto';
import Link from 'next/link';

interface CourseCardProps {
  course: CourseResponse;
  href?: string;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const difficultyLabels = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

export function CourseCard({ course, href }: CourseCardProps) {
  const cardContent = (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
          {course.difficulty && (
            <Badge className={`ml-2 ${difficultyColors[course.difficulty]}`}>
              {difficultyLabels[course.difficulty]}
            </Badge>
          )}
        </div>
        {course.category && (
          <Badge variant="outline" className="w-fit">
            {course.category}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3 mb-4">
          {course.description || '코스 설명이 없습니다.'}
        </CardDescription>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>강사: {course.instructorName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>수강생: {course.enrollmentCount}명</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}