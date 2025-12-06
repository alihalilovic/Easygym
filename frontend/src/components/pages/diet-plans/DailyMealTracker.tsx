import { format } from 'date-fns';
import { useDailyMealProgress, useLogMeal, useUnlogMeal } from '@/hooks/useMealLog';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { MealMediaUpload } from './MealMediaUpload';

interface DailyMealTrackerProps {
  date?: Date;
  clientId?: number; // For trainers viewing client progress
  readOnly?: boolean; // For trainer view
}

export const DailyMealTracker = ({
  date = new Date(),
  clientId,
  readOnly = false,
}: DailyMealTrackerProps) => {
  const dateString = format(date, 'yyyy-MM-dd');
  const { data: progress, isLoading } = useDailyMealProgress(dateString, clientId);
  const logMeal = useLogMeal();
  const unlogMeal = useUnlogMeal();

  const isToday = format(new Date(), 'yyyy-MM-dd') === dateString;

  const handleMealToggle = async (mealId: number, isCurrentlyCompleted: boolean) => {
    if (readOnly || !isToday) return;

    try {
      if (isCurrentlyCompleted) {
        await unlogMeal.mutateAsync({ mealId, logDate: dateString });
        toast.success('Meal unchecked');
      } else {
        await logMeal.mutateAsync({ mealId, logDate: dateString });
        toast.success('Meal logged successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update meal log');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!progress || progress.totalMeals === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Meal Plan for {format(date, 'MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {readOnly
              ? 'This client does not have an active meal plan for this day.'
              : "You don't have an active meal plan for this day."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Meals for {format(date, 'MMMM d, yyyy')}</span>
          <span className="text-sm font-normal">
            {progress.completedMeals}/{progress.totalMeals} (
            {progress.adherencePercentage.toFixed(0)}%)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isToday && !readOnly && (
          <div className="mb-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            You can only log meals for today. Viewing historical data.
          </div>
        )}
        <div className="space-y-4">
          {progress.meals.map((meal) => (
            <div
              key={meal.mealId}
              className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`meal-${meal.mealId}`}
                  checked={meal.isCompleted}
                  onCheckedChange={() => handleMealToggle(meal.mealId, meal.isCompleted)}
                  disabled={
                    readOnly || !isToday || logMeal.isPending || unlogMeal.isPending
                  }
                />
                <div className="flex-1">
                  <label
                    htmlFor={`meal-${meal.mealId}`}
                    className={`text-sm font-medium leading-none cursor-pointer ${
                      !isToday || readOnly ? 'cursor-default' : ''
                    }`}
                  >
                    {meal.mealName}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">{meal.mealType}</p>
                  {meal.description && (
                    <p className="text-sm text-muted-foreground mt-1">{meal.description}</p>
                  )}
                  {meal.isCompleted && meal.completedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Completed at {format(new Date(meal.completedAt), 'h:mm a')}
                    </p>
                  )}
                  {meal.isCompleted && (
                    <MealMediaUpload
                      mealId={meal.mealId}
                      logDate={dateString}
                      currentMediaUrl={meal.mediaUrl}
                      disabled={readOnly || !isToday}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
