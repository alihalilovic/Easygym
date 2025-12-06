import { useRef, useState } from 'react';
import { Camera, Trash2, User } from 'lucide-react';
import {
  useProfilePicture,
  useUploadProfilePicture,
  useDeleteProfilePicture,
} from '@/hooks/useProfilePicture';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ImageCropDialog } from './ImageCropDialog';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function ProfilePictureUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const { data: profilePicture } = useProfilePicture();
  const uploadMutation = useUploadProfilePicture();
  const deleteMutation = useDeleteProfilePicture();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must not exceed 5MB');
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Only JPG, PNG, GIF, and WEBP images are allowed');
      return;
    }

    // Create preview and show crop dialog
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImageUrl(reader.result as string);
      setShowCropDialog(true);
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Create preview URL from cropped blob
    const croppedUrl = URL.createObjectURL(croppedBlob);
    setPreviewUrl(croppedUrl);

    // Convert blob to file and upload
    const file = new File([croppedBlob], 'profile-picture.jpg', {
      type: 'image/jpeg',
    });

    uploadMutation.mutate(file, {
      onSettled: () => {
        // Clean up the preview URL
        URL.revokeObjectURL(croppedUrl);
      },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setPreviewUrl(null);
        setShowDeleteDialog(false);
      },
    });
  };

  const currentImageUrl = previewUrl || profilePicture?.profilePictureUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-16 h-16 text-muted-foreground" />
          )}
        </div>
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 rounded-full shadow-md"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          <Camera className="w-4 h-4" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {currentImageUrl && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove Picture
        </Button>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile Picture</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your profile picture? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedImageUrl && (
        <ImageCropDialog
          open={showCropDialog}
          onOpenChange={setShowCropDialog}
          imageUrl={selectedImageUrl}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
