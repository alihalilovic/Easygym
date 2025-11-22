import { useState } from 'react';
import WorkoutSessionListItem from '@/components/pages/workouts/WorkoutSessionListItem';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { routes } from '@/lib/constants';
import { PlayCircle, PlusCircle, Loader2 } from 'lucide-react';
import EmptyState from '@/components/ui/widgets/EmptyState';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePagedWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { WorkoutSessionQueryParams } from '@/types/WorkoutSession';
import { Pagination } from '@/components/ui/pagination';
import { WorkoutSessionFilters } from './WorkoutSessionFilters';

const WorkoutSessions = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [queryParams, setQueryParams] = useState<WorkoutSessionQueryParams>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'StartTime',
    sortOrder: 'desc',
  });

  const {
    data: pagedData,
    isLoading,
    isFetching,
  } = usePagedWorkoutSessions(userId, queryParams);

  const handleCreateSession = () => {
    navigate(routes.CreateWorkoutSession);
  };

  const handleOpenSession = (sessionId: number) => {
    navigate(routes.ViewWorkoutSession(sessionId));
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const handleFiltersChange = (newFilters: WorkoutSessionQueryParams) => {
    setQueryParams(newFilters);
  };

  const workoutSessions = pagedData?.items || [];
  const totalCount = pagedData?.totalCount || 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workout Sessions</h2>
        <Button onClick={handleCreateSession}>
          <PlusCircle className="h-4 w-4" />
          Start New Session
        </Button>
      </div>

      <WorkoutSessionFilters
        filters={queryParams}
        onFiltersChange={handleFiltersChange}
        disabled={totalCount === 0}
      />

      {totalCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {workoutSessions.length} of {totalCount} sessions
          </span>
          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      <div className="min-h-[400px] relative">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {workoutSessions.length > 0 && (
          <div className="flex flex-col gap-2">
            {workoutSessions.map((session, index) => (
              <WorkoutSessionListItem
                key={session.id}
                session={session}
                addSeparator={
                  index !== workoutSessions.length - 1 ||
                  workoutSessions.length === 1
                }
                onClick={() => handleOpenSession(session.id)}
              />
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {workoutSessions.length === 0 && !isLoading && (
          <EmptyState
            title="No workout sessions found"
            description={
              queryParams.searchTerm ||
              queryParams.workoutId ||
              queryParams.startDateFrom ||
              queryParams.startDateTo
                ? 'Try adjusting your filters to see more results.'
                : 'Complete your first workout to track your progress and performance.'
            }
            buttonText="Start Your First Session"
            buttonAction={handleCreateSession}
            buttonIcon={<PlayCircle className="h-4 w-4" />}
          />
        )}
      </div>

      {pagedData && (
        <Pagination
          currentPage={pagedData.pageNumber}
          totalPages={pagedData.totalPages}
          onPageChange={handlePageChange}
          hasNext={pagedData.hasNext}
          hasPrevious={pagedData.hasPrevious}
        />
      )}
    </div>
  );
};

export default WorkoutSessions;
