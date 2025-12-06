import { useState, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import mealLogService from '@/api/services/mealLogService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteMealMediaRequest } from '@/types/MealLog';

interface MealMediaUploadProps {
  mealId: number;
  logDate: string;
  currentMediaUrl?: string;
  onUploadSuccess?: (mediaUrl: string) => void;
  onDeleteSuccess?: () => void;
  disabled?: boolean;
}

export const MealMediaUpload = ({
  mealId,
  logDate,
  currentMediaUrl,
  onUploadSuccess,
  onDeleteSuccess,
  disabled = false,
}: MealMediaUploadProps) => {
  const [preview, setPreview] = useState<string | null>(
    currentMediaUrl || null,
  );
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      mealLogService.uploadMealMedia(file, mealId, logDate),
    onSuccess: (data) => {
      setPreview(data.mediaUrl);
      toast.success('Media uploaded successfully');
      onUploadSuccess?.(data.mediaUrl);

      // Invalidate meal progress queries
      queryClient.invalidateQueries({ queryKey: ['dailyMealProgress'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyMealProgress'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload media');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (request: DeleteMealMediaRequest) =>
      mealLogService.deleteMealMedia(request),
    onSuccess: () => {
      setPreview(null);
      toast.success('Media deleted successfully');
      onDeleteSuccess?.();

      // Invalidate meal progress queries
      queryClient.invalidateQueries({ queryKey: ['dailyMealProgress'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyMealProgress'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete media');
    },
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must not exceed 10MB');
      return;
    }

    // Validate file type
    const isVideoFile = file.type.startsWith('video/');
    const isImageFile = file.type.startsWith('image/');

    if (!isVideoFile && !isImageFile) {
      toast.error('Only images and videos are allowed');
      return;
    }

    setIsVideo(isVideoFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadMutation.mutate(file);
  };

  const handleDelete = () => {
    if (!preview) return;

    deleteMutation.mutate({
      mealId,
      logDate,
      mediaUrl: currentMediaUrl,
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const isLoading = uploadMutation.isPending || deleteMutation.isPending;

  if (preview) {
    return (
      <div className="relative mt-2">
        {isVideo || currentMediaUrl?.match(/\.(mp4|mov|avi|mkv|webm)$/i) ? (
          <video
            src={preview}
            controls
            className="w-full max-h-48 rounded-lg border"
          />
        ) : (
          <img
            src={preview}
            alt="Meal"
            className="w-full max-h-48 object-cover rounded-lg border"
          />
        )}
        {!disabled && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    );
  }

  if (disabled) {
    return null;
  }

  return (
    <div className="mt-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Add Photo/Video
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Optional: Add a photo or video for accountability
      </p>
    </div>
  );
};
