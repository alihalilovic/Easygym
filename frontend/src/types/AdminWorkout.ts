export interface WorkoutAdmin {
  id: number;
  name: string;
  trainerName: string;
  clientName: string;
  createdAt: string;
}
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}