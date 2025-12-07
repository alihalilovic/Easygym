import { WorkoutSession } from '@/types/WorkoutSession';
import { format } from 'date-fns';
import { CalendarClock, Clock, BarChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WorkoutSessionCardProps {
  session: WorkoutSession;
  addSeparator?: boolean;
  onClick: () => void;
}

const WorkoutSessionCard = ({
  session,
  addSeparator,
  onClick,
}: WorkoutSessionCardProps) => {
  const { t } = useTranslation();
  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);
  const duration = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.round(duration / (1000 * 60));

  // Format date and time
  const formattedDate = format(startTime, 'PPP');
  const formattedStartTime = format(startTime, 'p');
  const formattedEndTime = format(endTime, 'p');

  const difficultyLevel = session.perceivedDifficulty
    ? `${session.perceivedDifficulty}/10`
    : t('workoutSessions.sessionItem.notRated');

  return (
    <div onClick={onClick} className="flex flex-col gap-2 cursor-pointer">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center justify-between rounded-lg p-2 hover:bg-card transition-all">
        <h3 className="font-semibold">
          {session.workout?.name || t('workoutSessions.sessionItem.workoutSession')}
        </h3>
        <div className="flex gap-1 items-center text-muted-foreground mt-1 text-sm">
          <CalendarClock className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex gap-1 items-center text-muted-foreground mt-1 text-sm">
          <Clock className="h-4 w-4" />
          <span>
            {formattedStartTime} - {formattedEndTime} ({durationMinutes} {t('workoutSessions.sessionItem.mins')})
          </span>
        </div>

        <div className="flex gap-1 items-center">
          <BarChart className="h-4 w-4" />
          <span>{t('workoutSessions.sessionItem.difficulty')}: {difficultyLevel}</span>
        </div>
      </div>
      {addSeparator && <div className="w-full h-0.5 bg-muted" />}
    </div>
  );
};

export default WorkoutSessionCard;
