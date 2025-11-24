import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import interactionService from '@/api/services/interactionService';
import {
  CreateInvitationRequest,
  Invitation,
  InvitationStatus,
} from '@/types/Interaction';
import { useAuth } from '@/components/auth/AuthProvider';
import { exerciseKeys } from './useExercises';

export const invitationKeys = {
  all: ['invitations'] as const,
  lists: () => [...invitationKeys.all, 'lists'] as const,
  list: () => [...invitationKeys.lists()] as const,
};

export const useInvitations = () => {
  return useQuery({
    queryKey: invitationKeys.list(),
    queryFn: interactionService.getInvitations,
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitation: CreateInvitationRequest) =>
      interactionService.createInvitation(invitation),
    onSuccess: (newInvitation) => {
      queryClient.setQueryData<Invitation[]>(invitationKeys.list(), (old) =>
        old ? [...old, newInvitation] : [newInvitation],
      );
    },
  });
};

export const useResolveInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invitationId,
      status,
    }: {
      invitationId: number;
      status: InvitationStatus;
    }) => interactionService.resolveInvitation(invitationId, status),
    onSuccess: (updatedInvitation) => {
      // Update the exercises list as it might contain public exercises from trainer
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
      queryClient.setQueryData<Invitation[]>(
        invitationKeys.list(),
        (old) =>
          old?.map((invitation) =>
            invitation.id === updatedInvitation.id
              ? {
                  ...invitation,
                  status: updatedInvitation.status,
                  resolvedAt: updatedInvitation.resolvedAt,
                }
              : invitation,
          ) || [],
      );
    },
  });
};

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) =>
      interactionService.deleteInvitation(invitationId),
    onSuccess: (_, invitationId) => {
      queryClient.setQueryData<Invitation[]>(
        invitationKeys.list(),
        (old) =>
          old?.filter((invitation) => invitation.id !== invitationId) || [],
      );
    },
  });
};

export const useInvitationsComputed = () => {
  const { data: invitations = [] } = useInvitations();

  const sortedInvitations = [...invitations].sort((a, b) => {
    if (a.status === InvitationStatus.Rejected) return 1;
    if (b.status === InvitationStatus.Rejected) return -1;
    if (a.status === InvitationStatus.Accepted) return 1;
    if (b.status === InvitationStatus.Accepted) return -1;
    return 0;
  });

  const nonResolvedInvitations = invitations.filter(
    (i) => i.status === InvitationStatus.Pending,
  );

  return {
    invitations: sortedInvitations,
    nonResolvedInvitations,
  };
};

export const useClientsForTrainer = () => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: ['clients-for-trainer', userId],
    queryFn: () => interactionService.getClientsForTrainer(userId),
    enabled: userId > 0,
  });
};
