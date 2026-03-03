export interface ExerciseAdmin {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface Pagedresponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}