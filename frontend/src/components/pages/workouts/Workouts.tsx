import { useState } from 'react';
import WorkoutCard from '@/components/pages/workouts/WorkoutCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { routes } from '@/lib/constants';
import { PlusCircleIcon, Search } from 'lucide-react';
import EmptyState from '@/components/ui/widgets/EmptyState';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useAdminWorkouts } from '@/hooks/useAdminWorkouts';
import { useAuth } from '@/components/auth/AuthProvider';

const Workouts = () => {
  const navigate = useNavigate();
  const { isUserAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { data: userWorkouts = [], isLoading: userLoading } = useWorkouts();

  const {
    data: adminResponse,
    isLoading: adminLoading,
  } = useAdminWorkouts(page, pageSize, search,isUserAdmin);

  const workouts = isUserAdmin
    ? adminResponse?.items ?? []
    : userWorkouts;

  const totalCount = isUserAdmin
    ? adminResponse?.totalCount ?? 0
    : 0;

  const totalPages = isUserAdmin
    ? Math.ceil(totalCount / pageSize)
    : 0;

  const isLoading = isUserAdmin ? adminLoading : userLoading;

  const handleCreateWorkout = () => {
    navigate(routes.CreateWorkout);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading workouts...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Workouts</h2>

        {!isUserAdmin && (
          <Button onClick={handleCreateWorkout}>
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Create Workout
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={
            isUserAdmin
              ? 'Search by workout, trainer or client...'
              : 'Search workouts...'
          }
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {workouts.length > 0 ? (
        isUserAdmin ? (
          <>
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left">Workout</th>
                    <th className="px-6 py-3 text-left">Trainer</th>
                    <th className="px-6 py-3 text-left">Client</th>
                    <th className="px-6 py-3 text-left">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {workouts.map((w: any) => (
                    <tr key={w.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-medium">{w.name}</td>
                      <td className="px-6 py-4">{w.trainerName}</td>
                      <td className="px-6 py-4">{w.clientName}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="workout-card-wrapper">
            {userWorkouts.map((workout: any) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )
      ) : (
        <>
          {isUserAdmin ? (
            <EmptyState
              title="No workouts found"
              description="No workouts match your search."
            />
          ) : (
            <EmptyState
              title="No workouts yet"
              description="Create your first workout to get started."
              buttonText="Create Your First Workout"
              buttonAction={handleCreateWorkout}
              buttonIcon={<PlusCircleIcon className="h-4 w-4" />}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Workouts;