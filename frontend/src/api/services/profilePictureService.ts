import { instance } from '@/api/api';

export interface ProfilePictureResponse {
  profilePictureUrl: string | null;
}

export interface UploadProfilePictureResponse {
  profilePictureUrl: string;
}

const profilePictureService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await instance.post<UploadProfilePictureResponse>(
      '/profile-picture/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  delete: async () => {
    const response = await instance.delete<{ message: string }>(
      '/profile-picture',
    );
    return response.data;
  },

  get: async () => {
    const response = await instance.get<ProfilePictureResponse>(
      '/profile-picture',
    );
    return response.data;
  },
};

export default profilePictureService;
