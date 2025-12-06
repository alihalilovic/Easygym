export interface MealLogResponse {
  id: number;
  mealId: number;
  mealName: string;
  logDate: string; // ISO date string (YYYY-MM-DD)
  completedAt: string; // ISO datetime string
  isCompleted: boolean;
  mediaUrl?: string;
}

export interface MealProgressItem {
  mealId: number;
  mealName: string;
  mealType: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  mediaUrl?: string;
}

export interface DailyMealProgressResponse {
  date: string; // ISO date string
  totalMeals: number;
  completedMeals: number;
  adherencePercentage: number;
  meals: MealProgressItem[];
}

export interface WeeklyMealProgressResponse {
  clientId: number;
  startDate: string;
  endDate: string;
  dailyProgress: DailyMealProgressResponse[];
  overallAdherencePercentage: number;
}

export interface LogMealRequest {
  mealId: number;
  logDate: string; // YYYY-MM-DD format
}

export interface UnlogMealRequest {
  mealId: number;
  logDate: string; // YYYY-MM-DD format
}

export interface DeleteMealMediaRequest {
  mealId: number;
  logDate: string; // YYYY-MM-DD format
  mediaUrl?: string;
}
