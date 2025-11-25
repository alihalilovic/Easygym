import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, FileJson, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useExercises } from '@/hooks/useExercises';
import clsx from 'clsx';

type ExportFormat = 'csv' | 'json';

const ExercisesExporter = () => {
  const { data: exercises = [], isLoading } = useExercises();
  const [isExporting, setIsExporting] = useState(false);

  const generateCSV = (): string => {
    const headers = [
      'name',
      'description',
      'muscleGroup',
      'instructions',
      'isPublic',
    ];
    const csvRows = [headers.join(',')];

    exercises.forEach((exercise) => {
      const row = [
        exercise.name,
        exercise.description || '',
        exercise.muscleGroup || '',
        exercise.instructions || '',
        exercise.isPublic.toString(),
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  };

  const generateJSON = (): string => {
    const exportData = exercises.map((exercise) => ({
      name: exercise.name,
      description: exercise.description,
      muscleGroup: exercise.muscleGroup,
      instructions: exercise.instructions,
      isPublic: exercise.isPublic,
    }));
    return JSON.stringify(exportData, null, 2);
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: ExportFormat) => {
    if (exercises.length === 0) {
      toast.error('No exercises to export');
      return;
    }

    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];

      if (format === 'csv') {
        downloadFile(generateCSV(), `exercises-${timestamp}.csv`, 'text/csv');
        toast.success(`Exported ${exercises.length} exercises to CSV`);
      } else {
        downloadFile(
          generateJSON(),
          `exercises-${timestamp}.json`,
          'application/json',
        );
        toast.success(`Exported ${exercises.length} exercises to JSON`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export exercises');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Export Exercises</CardTitle>
        <CardDescription>
          Export your exercises to CSV or JSON format. You currently have{' '}
          {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}{' '}
          available.
        </CardDescription>
      </CardHeader>
      <CardContent
        className={clsx(
          'space-y-4',
          exercises.length === 0 && 'cursor-not-allowed opacity-50',
        )}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors">
              <div className="flex flex-col items-center gap-2 text-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Export to CSV</p>
                  <p className="text-sm text-muted-foreground">
                    Download exercises as a CSV file
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isExporting || isLoading || exercises.length === 0}
                  onClick={() => handleExport('csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Download CSV'}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors">
              <div className="flex flex-col items-center gap-2 text-center">
                <FileJson className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Export to JSON</p>
                  <p className="text-sm text-muted-foreground">
                    Download exercises as a JSON file
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isExporting || isLoading || exercises.length === 0}
                  onClick={() => handleExport('json')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Download JSON'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExercisesExporter;
