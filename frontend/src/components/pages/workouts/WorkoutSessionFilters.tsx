import { useState } from 'react';
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

interface WorkoutSessionFiltersProps {
  filters: WorkoutSessionQueryParams;
  onFiltersChange: (filters: WorkoutSessionQueryParams) => void;
  disabled?: boolean;
}

export const WorkoutSessionFilters = ({
  filters,
  onFiltersChange,
  disabled = false,
}: WorkoutSessionFiltersProps) => {
  const { data: workouts = [] } = useWorkouts();
  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
          disabled={disabled}
        >
          <Filter className="h-4 w-4" />
          Filters
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
            Clear All
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
              <SelectItem value="StartTime">Start Time</SelectItem>
              <SelectItem value="EndTime">End Time</SelectItem>
              <SelectItem value="PerceivedDifficulty">Difficulty</SelectItem>
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
                Asc
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4" />
                Desc
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
              <span>Search</span>
            </div>
            <Input
              id="search"
              placeholder="Search by workout name or notes..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <List className="h-4 w-4 text-primary" />
              <span>Workout Type</span>
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
                <SelectValue placeholder="All workouts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All workouts</SelectItem>
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
              <span>Date Range</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="startDateFrom"
                  className="text-xs text-muted-foreground"
                >
                  Start Date From
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
                  Start Date To
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
                  End Date From
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
                  End Date To
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
              <span>Difficulty Range</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="minDifficulty"
                  className="text-xs text-muted-foreground"
                >
                  Minimum (1-10)
                </Label>
                <Input
                  id="minDifficulty"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Min"
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
                  Maximum (1-10)
                </Label>
                <Input
                  id="maxDifficulty"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Max"
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
              <span>Display Options</span>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="pageSize"
                className="text-xs text-muted-foreground"
              >
                Items Per Page
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
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
