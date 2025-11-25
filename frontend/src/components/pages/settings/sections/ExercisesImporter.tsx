import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Upload, FileJson, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { CreateExerciseRequest } from '@/types/Exercise';
import exerciseService from '@/api/services/exerciseService';
import { useQueryClient } from '@tanstack/react-query';
import { exerciseKeys } from '@/hooks/useExercises';

type ImportFormat = 'csv' | 'json';

interface ImportResult {
  successfulExercises: string[];
  failedExercises: string[];
}

const ExercisesImporter = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult>({
    successfulExercises: [],
    failedExercises: [],
  });
  const queryClient = useQueryClient();

  const parseCSV = (content: string): CreateExerciseRequest[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    // Parse header
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const nameIndex = header.indexOf('name');
    const descriptionIndex = header.indexOf('description');
    const muscleGroupIndex = header.indexOf('musclegroup');
    const instructionsIndex = header.indexOf('instructions');
    const isPublicIndex = header.indexOf('ispublic');

    if (nameIndex === -1) {
      throw new Error('CSV must contain a "name" column');
    }

    const exercises: CreateExerciseRequest[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = line.split(',').map((v) => v.trim());

      const exercise: CreateExerciseRequest = {
        name: values[nameIndex] || '',
        description: values?.[descriptionIndex],
        muscleGroup: values?.[muscleGroupIndex],
        instructions: values?.[instructionsIndex],
        isPublic:
          isPublicIndex !== -1
            ? values[isPublicIndex]?.toLowerCase() === 'true'
            : false,
      };

      if (!exercise.name) {
        throw new Error(`Row ${i + 1}: Exercise name is required`);
      }

      exercises.push(exercise);
    }

    return exercises;
  };

  const parseJSON = (content: string): CreateExerciseRequest[] => {
    try {
      const parsed = JSON.parse(content);

      // Handle both single object and array of objects
      const exercises = Array.isArray(parsed) ? parsed : [parsed];

      return exercises.map((exercise, index) => {
        if (!exercise.name) {
          throw new Error(`Exercise at index ${index}: name is required`);
        }

        return {
          name: exercise.name,
          description: exercise.description,
          muscleGroup: exercise.muscleGroup,
          instructions: exercise.instructions,
          isPublic: exercise.isPublic,
        };
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format');
      }
      throw error;
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    format: ImportFormat,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const content = await file.text();
      const exercises =
        format === 'csv' ? parseCSV(content) : parseJSON(content);

      if (exercises.length === 0) {
        toast.error('No exercises found in the file');
        return;
      }

      // Import exercises one by one
      const successfulExercises: string[] = [];
      const failedExercises: string[] = [];

      for (const exercise of exercises) {
        try {
          await exerciseService.createExercise(exercise);
          successfulExercises.push(exercise.name);
        } catch (error) {
          console.error(`Failed to import exercise "${exercise.name}":`, error);
          failedExercises.push(exercise.name);
        }
      }

      // Invalidate exercises cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });

      // Store results and show dialog
      setImportResult({ successfulExercises, failedExercises });
      setShowResultDialog(true);

      if (successfulExercises.length > 0) {
        toast.success(
          `Successfully imported ${successfulExercises.length} exercise${
            successfulExercises.length > 1 ? 's' : ''
          }`,
        );
      }
      if (failedExercises.length > 0) {
        toast.error(
          `Failed to import ${failedExercises.length} exercise${
            failedExercises.length > 1 ? 's' : ''
          }`,
        );
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to import exercises',
      );
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Import Exercises</CardTitle>
          <CardDescription>
            Import exercises from CSV or JSON files. The file should include
            exercise name (required), and optionally: description, muscleGroup,
            instructions, and isPublic (only for trainers).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Import from CSV</p>
                      <p className="text-sm text-muted-foreground">
                        Upload a CSV file with your exercises
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isImporting}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('csv-upload')?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isImporting ? 'Importing...' : 'Choose CSV File'}
                    </Button>
                  </div>
                </div>
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'csv')}
                disabled={isImporting}
              />

              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-xs font-semibold mb-1">
                  CSV Format Example:
                </p>
                <pre className="text-xs overflow-x-auto">
                  {`name,description,muscleGroup,instructions,isPublic
Bench Press,Chest exercise,Chest,Lie on bench...,false
Squat,Leg exercise,Legs,Stand with feet...,true`}
                </pre>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="json-upload" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <FileJson className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Import from JSON</p>
                      <p className="text-sm text-muted-foreground">
                        Upload a JSON file with your exercises
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isImporting}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('json-upload')?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isImporting ? 'Importing...' : 'Choose JSON File'}
                    </Button>
                  </div>
                </div>
              </label>
              <input
                id="json-upload"
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'json')}
                disabled={isImporting}
              />

              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-xs font-semibold mb-1">
                  JSON Format Example:
                </p>
                <pre className="text-xs overflow-x-auto">
                  {`[
  {
    "name": "Bench Press",
    "description": "Chest exercise",
    "muscleGroup": "Chest",
    "instructions": "Lie on bench...",
    "isPublic": false
  }
]`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Import Results
            </DialogTitle>
            <DialogDescription>Summary of imported exercises</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto max-h-[50vh]">
            {importResult.successfulExercises.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-green-600 mb-2">
                  Successfully Imported (
                  {importResult.successfulExercises.length})
                </h3>
                <ul className="space-y-1 text-sm">
                  {importResult.successfulExercises.map((name, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {importResult.failedExercises.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-destructive mb-2">
                  Failed to Import ({importResult.failedExercises.length})
                </h3>
                <ul className="space-y-1 text-sm">
                  {importResult.failedExercises.map((name, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span className="text-destructive mt-0.5">✗</span>
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExercisesImporter;
