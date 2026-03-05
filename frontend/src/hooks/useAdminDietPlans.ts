import { useQuery } from '@tanstack/react-query';
import adminService from '@/api/services/adminService';
import { DietPlanAdmin, PagedResponse } from '@/types/AdminDietPlan';

export const useAdminDietPlans = (
  page: number,
  pageSize: number,
  search: string,
  isAdmin:boolean
) => {
  return useQuery<PagedResponse<DietPlanAdmin>>({
    queryKey: ['adminDietPlans', page, pageSize, search],
    queryFn: () => adminService.getDietPlans(page, pageSize, search),
    placeholderData: (prev) => prev,
    enabled: isAdmin
  });
};