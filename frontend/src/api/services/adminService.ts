import { requests } from '../api';
import { User } from '@/types/User';
import { WorkoutAdmin,PagedResponse } from '@/types/AdminWorkout';
import { ExerciseAdmin,Pagedresponse } from '@/types/AdminExercise';
import { DietPlanAdmin } from '@/types/AdminDietPlan';

const adminService = {
  getClients: (): Promise<User[]> =>
    requests.get<User[]>('/admin/clients'),

  getTrainers: (): Promise<User[]> =>
    requests.get<User[]>('/admin/trainers'),

  deleteUser: (id: number): Promise<void> =>
    requests.delete<void>(`/admin/users/${id}`),

  updateUser: (id: number, data: { name: string; email: string }): Promise<void> =>
    requests.put<void>(`/admin/users/${id}`, data),

  getWorkouts: (
    page: number,
    pageSize: number,
    search: string
  ): Promise<PagedResponse<WorkoutAdmin>> =>
    requests.get(
      `/admin/workouts?page=${page}&pageSize=${pageSize}&search=${search}`
    ),
    getExercises: (
    page: number,
    pageSize: number,
    search: string
  ): Promise<Pagedresponse<ExerciseAdmin>> =>
    requests.get(
      `/admin/exercises?page=${page}&pageSize=${pageSize}&search=${search}`
    ),
    getDietPlans: (
    page: number,
    pageSize: number,
    search: string
  ): Promise<PagedResponse<DietPlanAdmin>> =>
    requests.get(
      `/admin/dietplans?page=${page}&pageSize=${pageSize}&search=${search}`
    ),

  deleteDietPlan: (id: number): Promise<void> =>
    requests.delete(`/admin/dietplans/${id}`),

};

export default adminService;