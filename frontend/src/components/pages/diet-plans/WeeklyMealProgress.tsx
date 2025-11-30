import { format, startOfWeek } from 'date-fns';
import { useWeeklyMealProgress } from '@/hooks/useMealLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WeeklyMealProgressProps {
  startDate?: Date;
  clientId?: number;
}

export const WeeklyMealProgress = ({
  startDate = startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
  clientId,
}: WeeklyMealProgressProps) => {
  const dateString = format(startDate, 'yyyy-MM-dd');
  const { data: weeklyProgress, isLoading } = useWeeklyMealProgress(dateString, clientId);

  if (isLoading) {
    return <div className="text-center py-8">Loading weekly progress...</div>;
  }

  if (!weeklyProgress) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weekly Progress</span>
          <span className="text-sm font-normal">
            {weeklyProgress.overallAdherencePercentage.toFixed(0)}% Overall
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weeklyProgress.dailyProgress.map((day) => (
            <div key={day.date} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{format(new Date(day.date), 'EEEE, MMM d')}</span>
                <span className="text-muted-foreground">
                  {day.completedMeals}/{day.totalMeals} meals
                </span>
              </div>
              <Progress value={day.adherencePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {day.adherencePercentage.toFixed(0)}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
