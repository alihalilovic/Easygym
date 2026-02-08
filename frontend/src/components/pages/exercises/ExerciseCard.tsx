import { useState } from 'react';
import { Exercise } from '@/types/Exercise';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Users } from 'lucide-react';
import ExerciseDialog from '@/components/pages/exercises/ExerciseDialog';
import DeleteExerciseDialog from '@/components/pages/exercises/DeleteExerciseDialog';
import { Badge } from '@/components/ui/badge';

interface ExerciseCardProps {
  exercise: Exercise;
  isOwnExercise: boolean;
}

const ExerciseCard = ({ exercise, isOwnExercise }: ExerciseCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{exercise.name}</CardTitle>
                {exercise.isPublic && (
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    Shared
                  </Badge>
                )}
              </div>
              {exercise.description && (
                <CardDescription className="mt-1">
                  {exercise.description}
                </CardDescription>
              )}
            </div>
            {isOwnExercise && (
              <div className="flex gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {exercise.muscleGroup && (
              <Badge variant="outline">{exercise.muscleGroup}</Badge>
            )}
          </div>
          {exercise.instructions && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
              {exercise.instructions}
            </p>
          )}
        </CardContent>
      </Card>
      <ExerciseDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        exercise={exercise}
      />
      <DeleteExerciseDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        exercise={exercise}
      />
    </>
  );
};

export default ExerciseCard;
