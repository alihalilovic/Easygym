import { requests } from '@/api/api';
import {
  CreateWorkoutSessionRequest,
  UpdateWorkoutSessionRequest,
  WorkoutSession,
  PagedResult,
  WorkoutSessionQueryParams,
} from '@/types/WorkoutSession';

const workoutSessionService = {
  getWorkoutSessionsForTrainee: async (traineeId: number) => {
    const sessions = await requests.get<WorkoutSession[]>(
      `/workoutsession/trainee/${traineeId}`,
    );
    return sessions;
  },
  getPagedWorkoutSessionsForTrainee: async (
    traineeId: number,
    queryParams: WorkoutSessionQueryParams,
  ) => {
    const params = new URLSearchParams();

    for (const param of Object.keys(queryParams)) {
      params.append(
        param,
        queryParams[param as keyof WorkoutSessionQueryParams]?.toString() ?? '',
      );
    }

    const pagedSessions = await requests.get<PagedResult<WorkoutSession>>(
      `/workoutsession/trainee/${traineeId}/paged?${params.toString()}`,
    );
    return pagedSessions;
  },
  getWorkoutSessionForTrainee: async (sessionId: number) => {
    const session = await requests.get<WorkoutSession>(
      `/workoutsession/${sessionId}`,
    );
    return session;
  },
  createWorkoutSession: async (session: CreateWorkoutSessionRequest) => {
    const newSession = await requests.post<WorkoutSession>(
      `/workoutsession`,
      session,
    );
    return newSession;
  },
  updateWorkoutSession: async (
    traineeId: number,
    sessionId: number,
    session: UpdateWorkoutSessionRequest,
  ) => {
    const updatedSession = await requests.put<WorkoutSession>(
      `/workoutsession/trainee/${traineeId}/${sessionId}`,
      session,
    );
    return updatedSession;
  },
  deleteWorkoutSession: async (sessionId: number) => {
    await requests.delete(`/workoutsession/${sessionId}`);
  },
};

export default workoutSessionService;
