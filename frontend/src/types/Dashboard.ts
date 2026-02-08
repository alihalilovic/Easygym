import { WorkoutSession } from './WorkoutSession';

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface DashboardStatsResponse {
  totalWorkouts: number;
  averageWeightLifted: number;
  streakDays: number;
  progressChart: ChartDataPoint[];
  upcomingSessions: WorkoutSession[];
  recentActivities: WorkoutSession[];
}
