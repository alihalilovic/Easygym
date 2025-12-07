import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WorkoutSessionQueryParams } from '@/types/WorkoutSession';
import {
  Filter,
  X,
  Search,
  Calendar,
  TrendingUp,
  SortAsc,
  List,
  ChevronDown,
  ChevronUp,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslation } from 'react-i18next';

interface WorkoutSessionFiltersProps {
  filters: WorkoutSessionQueryParams;
  onFiltersChange: (filters: WorkoutSessionQueryParams) => void;
  totalItemsShown: number;
}

export const WorkoutSessionFilters = ({
  filters,
  onFiltersChange,
  totalItemsShown,
}: WorkoutSessionFiltersProps) => {
  const { data: workouts = [] } = useWorkouts();
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.searchTerm || '');
  const debouncedSearchValue = useDebounce(searchValue, 500);

  useEffect(() => {
    setSearchValue(filters.searchTerm || '');
  }, [filters.searchTerm]);

  useEffect(() => {
    if (debouncedSearchValue !== filters.searchTerm) {
      handleFilterChange('searchTerm', debouncedSearchValue);
    }
  }, [debouncedSearchValue]);

  const handleFilterChange = (
    key: keyof WorkoutSessionQueryParams,
    value: unknown,
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
      pageNumber: 1,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      pageNumber: 1,
      pageSize: filters.pageSize || 10,
      sortBy: 'StartTime',
      sortOrder: 'desc',
    });
  };

  const activeFilterCount = [
    filters.searchTerm,
    filters.workoutId,
    filters.startDateFrom,
    filters.startDateTo,
    filters.endDateFrom,
    filters.endDateTo,
    filters.minPerceivedDifficulty,
    filters.maxPerceivedDifficulty,
  ].filter(Boolean).length;

  const disabled = totalItemsShown === 0 && activeFilterCount === 0;

  return (
    <div
      className={`space-y-4 ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
          disabled={disabled}
        >
          <Filter className="h-4 w-4" />
          {t('workoutSessions.filters.title')}
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
          {showFilters ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
            {t('workoutSessions.filters.clearAll')}
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Select
            value={filters.sortBy || 'StartTime'}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
            disabled={disabled}
          >
            <SelectTrigger className="min-w-[140px] h-9">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="StartTime">
                {t('workoutSessions.filters.sortOptions.startTime')}
              </SelectItem>
              <SelectItem value="EndTime">
                {t('workoutSessions.filters.sortOptions.endTime')}
              </SelectItem>
              <SelectItem value="PerceivedDifficulty">
                {t('workoutSessions.filters.sortOptions.difficulty')}
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleFilterChange(
                'sortOrder',
                filters.sortOrder === 'asc' ? 'desc' : 'asc',
              )
            }
            className="h-9 flex items-center justify-center gap-2"
            disabled={disabled}
          >
            {filters.sortOrder === 'asc' ? (
              <>
                <ArrowUp className="h-4 w-4" />
                {t('workoutSessions.filters.ascending')}
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4" />
                {t('workoutSessions.filters.descending')}
              </>
            )}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-muted/50 rounded-lg p-6 space-y-6 border">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Search className="h-4 w-4 text-primary" />
              <span>{t('workoutSessions.filters.search')}</span>
            </div>
            <Input
              id="search"
              placeholder={t('workoutSessions.filters.searchPlaceholder')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <List className="h-4 w-4 text-primary" />
              <span>{t('workoutSessions.filters.workoutType')}</span>
            </div>
            <Select
              value={filters.workoutId?.toString() || 'all'}
              onValueChange={(value) =>
                handleFilterChange(
                  'workoutId',
                  value !== 'all' ? parseInt(value) : undefined,
                )
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue
                  placeholder={t('workoutSessions.filters.allWorkouts')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('workoutSessions.filters.allWorkouts')}
                </SelectItem>
                {workouts.map((workout) => (
                  <SelectItem key={workout.id} value={workout.id.toString()}>
                    {workout.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{t('workoutSessions.filters.dateRange')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="startDateFrom"
                  className="text-xs text-muted-foreground"
                >
                  {t('workoutSessions.filters.startDateFrom')}
                </Label>
                <Input
                  id="startDateFrom"
                  type="date"
                  value={filters.startDateFrom || ''}
                  onChange={(e) =>
                    handleFilterChange('startDateFrom', e.target.value)
                  }
                  className="bg-background [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="startDateTo"
                  className="text-xs text-muted-foreground"
                >
                  {t('workoutSessions.filters.startDateTo')}
                </Label>
                <Input
                  id="startDateTo"
                  type="date"
                  value={filters.startDateTo || ''}
                  onChange={(e) =>
                    handleFilterChange('startDateTo', e.target.value)
                  }
                  className="bg-background [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="endDateFrom"
                  className="text-xs text-muted-foreground"
                >
                  {t('workoutSessions.filters.endDateFrom')}
                </Label>
                <Input
                  id="endDateFrom"
                  type="date"
                  value={filters.endDateFrom || ''}
                  onChange={(e) =>
                    handleFilterChange('endDateFrom', e.target.value)
                  }
                  className="bg-background [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="endDateTo"
                  className="text-xs text-muted-foreground"
                >
                  {t('workoutSessions.filters.endDateTo')}
                </Label>
                <Input
                  id="endDateTo"
                  type="date"
                  value={filters.endDateTo || ''}
                  onChange={(e) =>
                    handleFilterChange('endDateTo', e.target.value)
                  }
                  className="bg-background [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>{t('workoutSessions.filters.difficultyRange')}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="minDifficulty"
                  className="text-xs text-muted-foreground"
                >
                  {t('workoutSessions.filters.minimum')}
                </Label>
                <Input
                  id="minDifficulty"
                  type="number"
                  min="1"
                  max="10"
                  placeholder={t('workoutSessions.filters.min')}
                  value={filters.minPerceivedDifficulty || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'minPerceivedDifficulty',
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="maxDifficulty"
                  className="text-xs text-muted-foreground"
                >
                  {t('workoutSessions.filters.maximum')}
                </Label>
                <Input
                  id="maxDifficulty"
                  type="number"
                  min="1"
                  max="10"
                  placeholder={t('workoutSessions.filters.max')}
                  value={filters.maxPerceivedDifficulty || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'maxPerceivedDifficulty',
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  className="bg-background"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span>{t('workoutSessions.filters.displayOptions')}</span>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="pageSize"
                className="text-xs text-muted-foreground"
              >
                {t('workoutSessions.filters.itemsPerPage')}
              </Label>
              <Select
                value={filters.pageSize?.toString() || '10'}
                onValueChange={(value) =>
                  handleFilterChange('pageSize', parseInt(value))
                }
              >
                <SelectTrigger id="pageSize" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">
                    {t('workoutSessions.filters.perPage', { count: 5 })}
                  </SelectItem>
                  <SelectItem value="10">
                    {t('workoutSessions.filters.perPage', { count: 10 })}
                  </SelectItem>
                  <SelectItem value="20">
                    {t('workoutSessions.filters.perPage', { count: 20 })}
                  </SelectItem>
                  <SelectItem value="50">
                    {t('workoutSessions.filters.perPage', { count: 50 })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
