import { useQuery } from '@tanstack/react-query';
import adminService from '@/api/services/adminService';
import { ExerciseAdmin, Pagedresponse } from '@/types/AdminExercise';

export const useAdminExercises = (
  page: number,
  pageSize: number,
  search: string
) => {
  return useQuery<Pagedresponse<ExerciseAdmin>>({
    queryKey: ['adminExercises', page, pageSize, search],
    queryFn: () =>
      adminService.getExercises(page, pageSize, search),
    placeholderData: (prev) => prev,
  });
};