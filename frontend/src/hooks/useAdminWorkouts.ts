import { useQuery } from '@tanstack/react-query';
import adminService from '@/api/services/adminService';
import { PagedResponse, WorkoutAdmin } from '@/types/AdminWorkout';

export const useAdminWorkouts = (
  page: number,
  pageSize: number,
  search: string,
  isAdmin:boolean,
) => {
  return useQuery<PagedResponse<WorkoutAdmin>>({
    queryKey: ['adminWorkouts', page, pageSize, search],
    queryFn: () =>
      adminService.getWorkouts(page, pageSize, search),
    placeholderData: (previousData) => previousData,
    enabled:isAdmin
  });
};
