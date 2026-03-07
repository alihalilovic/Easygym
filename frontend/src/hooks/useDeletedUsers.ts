import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/api/services/adminService";
import { User } from "@/types/User";

export const useDeletedUsers = () => {
  return useQuery<User[]>({
    queryKey: ["deletedUsers"],
    queryFn: () => adminService.getDeletedUsers(),
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deletedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      queryClient.refetchQueries({ queryKey: ["deletedUsers"] });
    },
  });
};

export const usePermanentDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.permanentlyDeleteUser(id),

    onSuccess: (_, id) => {
      queryClient.setQueryData(["deletedUsers"], (old: any[]) =>
        old ? old.filter((u) => u.id !== id) : []
      );
    },
  });
};