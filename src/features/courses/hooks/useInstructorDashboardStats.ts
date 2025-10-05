"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import { InstructorDashboardStatsSchema, type InstructorDashboardStats } from "@/features/courses/lib/dto";

export const useInstructorDashboardStats = () => {
  return useQuery({
    queryKey: ["courses", "instructor", "dashboard", "stats"],
    queryFn: async (): Promise<InstructorDashboardStats> => {
      const response = await apiClient.get("/api/courses/instructor/dashboard/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch instructor dashboard stats");
      }

      const data = await response.json();
      return InstructorDashboardStatsSchema.parse(data);
    },
  });
};
