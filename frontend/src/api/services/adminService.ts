import { requests } from '../api';
import { User } from '@/types/User';
import { WorkoutAdmin, PagedResponse } from '@/types/AdminWorkout';
import { ExerciseAdmin, Pagedresponse } from '@/types/AdminExercise';
import { DietPlanAdmin } from '@/types/AdminDietPlan';

const adminService = {
  getClients: (): Promise<User[]> =>
    requests.get<User[]>('/admin/clients'),

  getTrainers: (): Promise<User[]> =>
    requests.get<User[]>('/admin/trainers'),

  getDeletedUsers: (): Promise<User[]> =>
    requests.get<User[]>('/admin/deleted-users'),

  deleteUser: (id: number): Promise<void> =>
    requests.delete<void>(`/admin/users/${id}`),

  restoreUser: (id: number): Promise<void> =>
    requests.post<void>(`/admin/users/${id}/restore`, {}),

  permanentlyDeleteUser: (id: number): Promise<void> =>
    requests.delete<void>(`/admin/users/${id}/permanent`),

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
  
  getBackups: (): Promise<string[]> =>
  requests.get<string[]>('/admin/backups'),

backupDatabase: (): Promise<void> =>
  requests.post<void>('/admin/backup', {}),

restoreDatabase: (file: string): Promise<void> =>
  requests.post<void>(`/admin/restore?file=${file}`, {})
};

export default adminService;