import { useQuery } from '@tanstack/react-query';
import adminService from '@/api/services/adminService';

export const useAdminWorkouts = (
  page: number,
  pageSize: number,
  search: string,
  isAdmin:boolean,
) => {
  return useQuery({
    queryKey: ['adminWorkouts', page, pageSize, search],
    queryFn: () =>
      adminService.getWorkouts(page, pageSize, search),
    placeholderData: (previousData) => previousData,
    enabled:isAdmin
  });
};