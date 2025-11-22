import { requests } from '@/api/api';
import { CreateInvitationRequest, Invitation, InvitationStatus } from '@/types/Interaction';
import { User } from '@/types/User';

const connectionService = {
  getInvitations: async () => {
    const invitations = await requests.get<Invitation[]>(`/invitation`);
    return invitations;
  },
  createInvitation: async (invitation: CreateInvitationRequest) => {
    const newInvitation = await requests.post<Invitation>(`/invitation`, invitation);
    return newInvitation;
  },
  resolveInvitation: async (invitationId: number, status: InvitationStatus) => {
    const updatedInvitation = await requests.put<Invitation>(`/invitation/${invitationId}`, { status });
    return updatedInvitation;
  },
  deleteInvitation: async (invitationId: number) => {
    await requests.delete(`/invitation/${invitationId}`);
  },
  getClientsForTrainer: async (trainerId: number) => {
    const clients = await requests.get<User[]>(`/interaction/trainer/${trainerId}/clients`);
    return clients;
  },
};

export default connectionService;
