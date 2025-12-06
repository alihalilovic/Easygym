import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import profilePictureService from '@/api/services/profilePictureService';
import { toast } from 'sonner';

export const profilePictureKeys = {
  all: ['profile-picture'] as const,
  current: () => [...profilePictureKeys.all, 'current'] as const,
};

export const useProfilePicture = () => {
  return useQuery({
    queryKey: profilePictureKeys.current(),
    queryFn: () => profilePictureService.get(),
  });
};

export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profilePictureService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profilePictureKeys.current() });
      // Also invalidate user data since it contains profile picture URL
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile picture uploaded successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to upload profile picture';
      toast.error(message);
    },
  });
};

export const useDeleteProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profilePictureService.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profilePictureKeys.current() });
      // Also invalidate user data since it contains profile picture URL
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile picture deleted successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to delete profile picture';
      toast.error(message);
    },
  });
};
