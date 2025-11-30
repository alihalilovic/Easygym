import { useState } from 'react';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
import { DailyMealTracker } from './DailyMealTracker';
import { WeeklyMealProgress } from './WeeklyMealProgress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MealTrackingSectionProps {
  clientId?: number; // For trainers viewing client progress
  readOnly?: boolean; // For trainer view
}

export const MealTrackingSection = ({
  clientId,
  readOnly = false,
}: MealTrackingSectionProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = new Date();
  const isToday =
    format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    if (!isToday) {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" size="sm" onClick={handlePreviousDay}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="font-medium text-lg">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </span>
          {isToday && (
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Today
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextDay}
          disabled={isToday}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <DailyMealTracker
          date={selectedDate}
          clientId={clientId}
          readOnly={readOnly}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Weekly Overview</h2>
        <WeeklyMealProgress
          startDate={startOfWeek(selectedDate, { weekStartsOn: 1 })}
          clientId={clientId}
        />
      </div>
    </div>
  );
};
