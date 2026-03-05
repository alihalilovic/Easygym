import { useState } from 'react';
import ExerciseDialog from '@/components/pages/exercises/ExerciseDialog';
import DeleteExerciseDialog from '@/components/pages/exercises/DeleteExerciseDialog';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon, Search, Pencil, Trash2, Users } from 'lucide-react';
import EmptyState from '@/components/ui/widgets/EmptyState';
import { useExercises } from '@/hooks/useExercises';
import { useAdminExercises } from '@/hooks/useAdminExercise';
import { useAuth } from '@/components/auth/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { SortableTable, Column } from '@/components/ui/widgets/SortableTable';
import { Exercise } from '@/types/Exercise';

const Exercises = () => {
  const { isUserAdmin, userId } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 5;

  const { data: userExercises = [], isLoading: userLoading } = useExercises();

  const { data: adminResponse, isLoading: adminLoading } =
    useAdminExercises(page, pageSize, search,isUserAdmin);

  const exercises = isUserAdmin ? adminResponse?.items ?? [] : userExercises;

  const totalPages = isUserAdmin
    ? Math.ceil((adminResponse?.totalCount ?? 0) / pageSize)
    : 0;

  const isLoading = isUserAdmin ? adminLoading : userLoading;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  const handleCreateExercise = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsEditDialogOpen(true);
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<Exercise>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (exercise) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{exercise.name}</span>
          {exercise.isPublic && (
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              Shared
            </Badge>
          )}
        </div>
      ),
      className: 'max-w-[200px]',
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (exercise) => (
        <div className="max-w-md overflow-hidden">
          <span className="text-muted-foreground line-clamp-2 break-words">
            {exercise.description || '-'}
          </span>
        </div>
      ),
      className: 'max-w-[300px] truncate',
    },
    {
      key: 'muscleGroup',
      label: 'Muscle Group',
      sortable: true,
      render: (exercise) =>
        exercise.muscleGroup ? (
          <Badge variant="outline">{exercise.muscleGroup}</Badge>
        ) : (
          '-'
        ),
      className: 'w-[150px]',
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (exercise) => {
        const isOwnExercise = exercise.createdById === userId;
        return isOwnExercise ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleEditExercise(exercise);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteExercise(exercise);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">View only</span>
        );
      },
      className: 'w-[120px]',
    },
  ];

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {!isUserAdmin && (
        <Button className="self-start" onClick={handleCreateExercise}>
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Create Exercise
        </Button>
      )}

      {isUserAdmin && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or creator..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {exercises.length > 0 ? (
        isUserAdmin ? (
          <>
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Created By</th>
                    <th className="px-6 py-3 text-left">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {exercises.map((e: any) => (
                    <tr key={e.id} className="hover:bg-muted/40">
                      <td className="px-6 py-4 font-medium">{e.name}</td>
                      <td className="px-6 py-4">{e.createdBy}</td>
                      <td className="px-6 py-4">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <SortableTable
            data={userExercises}
            columns={columns}
            emptyMessage="No exercises found"
          />
        )
      ) : (
        <EmptyState
          title="No exercises found"
          description={
            isUserAdmin
              ? 'No exercises match your search.'
              : 'Create your first exercise to build your library.'
          }
          buttonText={!isUserAdmin ? 'Create Exercise' : undefined}
          buttonAction={!isUserAdmin ? handleCreateExercise : undefined}
          buttonIcon={!isUserAdmin ? <PlusCircleIcon /> : undefined}
        />
      )}

      <ExerciseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />

      {selectedExercise && (
        <>
          <ExerciseDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            mode="edit"
            exercise={selectedExercise}
          />
          <DeleteExerciseDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            exercise={selectedExercise}
          />
        </>
      )}
    </div>
  );
};

export default Exercises;