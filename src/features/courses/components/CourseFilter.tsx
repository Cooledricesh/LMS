'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from 'react-use';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import type { CourseFilters } from '@/lib/filters';

interface CourseFilterProps {
  filters: CourseFilters;
  onFiltersChange: (filters: CourseFilters) => void;
}

const categories = [
  { value: '', label: '모든 카테고리' },
  { value: 'programming', label: '프로그래밍' },
  { value: 'design', label: '디자인' },
  { value: 'business', label: '비즈니스' },
  { value: 'marketing', label: '마케팅' },
  { value: 'language', label: '언어' },
  { value: 'other', label: '기타' },
];

const difficulties = [
  { value: '', label: '모든 난이도' },
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
];

const sortOptions = [
  { value: 'created_at', label: '최신순' },
  { value: 'popularity', label: '인기순' },
  { value: 'title', label: '제목순' },
];

export function CourseFilter({ filters, onFiltersChange }: CourseFilterProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      onFiltersChange({
        ...filters,
        search: debouncedSearchTerm || undefined,
      });
    }
  }, [debouncedSearchTerm, filters, onFiltersChange]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        category: value || undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleDifficultyChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        difficulty: value as CourseFilters['difficulty'],
      });
    },
    [filters, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    onFiltersChange({});
  }, [onFiltersChange]);

  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.difficulty
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="코스명, 강사명, 설명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex gap-4 flex-wrap items-center">
        <Select value={filters.category || ''} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.difficulty || ''} onValueChange={handleDifficultyChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="난이도 선택" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-1" />
            필터 초기화
          </Button>
        )}
      </div>
    </div>
  );
}