using Easygym.Api.Models.Requests;
using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;

namespace Easygym.Application.Services
{
    public class InvitationService
    {
        private readonly IInvitationRepository _invitationRepository;
        private readonly CurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly IGenericRepository<Client> _clientRepository;
        private readonly ITrainerRepository _trainerRepository;

        public InvitationService(IInvitationRepository invitationRepository, CurrentUserService currentUserService, IUserRepository userRepository, IGenericRepository<Client> clientRepository, ITrainerRepository trainerRepository)
        {
            _invitationRepository = invitationRepository;
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _clientRepository = clientRepository;
            _trainerRepository = trainerRepository;
        }

        private async Task<Invitation> GetInvitation(int id)
        {
            return await _invitationRepository.GetByIdAsync(id) ?? throw new InvitationNotFoundException();
        }

        public async Task<List<Invitation>> GetInvitations()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            return [.. await _invitationRepository.GetAllAsync(currentUser.Id)];
        }

        public async Task<Invitation> CreateInvitation(CreateInvitationRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var clientSentInvitation = currentUser.Role == Role.Client;

            if (clientSentInvitation && request.TrainerEmail == null)
            {
                throw new ValidationException("Trainer email is required");
            }

            if (!clientSentInvitation && request.ClientEmail == null)
            {
                throw new ValidationException("Client email is required");
            }

            var clientUser = await _userRepository.GetUserByEmailAsync(request.ClientEmail ?? "");
            var trainerUser = await _userRepository.GetUserByEmailAsync(request.TrainerEmail ?? "");


            if (clientSentInvitation && trainerUser == null || !clientSentInvitation && clientUser == null)
            {
                throw new UserNotFoundException();
            }

            // Make sure when client is sending an invitation, the inviteee is a trainer
            if (clientSentInvitation && trainerUser!.Role != Role.Trainer)
            {
                throw new ValidationException("You can only send an invitation to a trainer");
            }

            // Make sure when trainer is sending an invitation, the inviteee is a client
            if (!clientSentInvitation && clientUser!.Role != Role.Client)
            {
                throw new ValidationException("You can only send an invitation to a client");
            }

            // Get the correct client and trainer ids
            var clientId = clientSentInvitation ? currentUser.Id : clientUser!.Id;
            var trainerId = !clientSentInvitation ? currentUser.Id : trainerUser!.Id;

            // Make sure that the user is not already invited
            if (await _invitationRepository.IsInvitationAlreadySent(clientId, trainerId))
            {
                throw new InvitationAlreadyExistsException();
            }

            var invitation = new Invitation
            {
                ClientId = clientId,
                TrainerId = trainerId,
                Message = request.Message,
                Status = InvitationStatus.Pending,
                InitiatorId = currentUser.Id,
                CreatedAt = DateTime.UtcNow,
            };

            await CanAccessInvitation(invitation.ClientId, invitation.TrainerId);
            return await _invitationRepository.AddAsync(invitation);
        }

        public async Task DeleteInvitation(int id)
        {
            var invitation = await GetInvitation(id);
            await _invitationRepository.DeleteAsync(invitation);
        }

        public async Task<Invitation> ResolveInvitation(int id, InvitationStatus status)
        {
            var invitation = await GetInvitation(id);
            await CanAccessInvitation(invitation.ClientId, invitation.TrainerId);

            // Make sure that the client has no trainer yet
            if (status == InvitationStatus.Accepted)
            {
                var client = await _clientRepository.GetByIdAsync(invitation.ClientId) ?? throw new UserNotFoundException();
                if (client.TrainerId != null)
                {
                    throw new ValidationException("Client already has a trainer. Please remove existing trainer first.");
                }

                // Store the trainer id in the client - EF will automatically handle the relationship
                client.TrainerId = invitation.TrainerId;
                client.InvitationAcceptedAt = DateTime.UtcNow;
                await _clientRepository.UpdateAsync(client);
            }

            invitation.Status = status;
            invitation.ResolvedAt = DateTime.UtcNow;

            await _invitationRepository.UpdateAsync(invitation);

            return invitation;
        }

        public async Task CanAccessInvitation(int clientId, int trainerId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Only allow clients and trainers to see their own invitations.
            // Admins can see all invitations.
            if (currentUser.Id != clientId && currentUser.Id != trainerId && currentUser.Role != Role.Admin)
            {
                throw new ForbiddenAccessException();
            }
        }
    }
}