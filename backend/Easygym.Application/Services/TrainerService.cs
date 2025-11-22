using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Responses;

namespace Easygym.Application.Services
{
    public class TrainerService
    {
        private readonly ITrainerRepository _trainerRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly CurrentUserService _currentUserService;

        public TrainerService(
            ITrainerRepository trainerRepository,
            IGenericRepository<User> userRepository,
            CurrentUserService currentUserService)
        {
            _trainerRepository = trainerRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
        }

        public async Task<List<ClientConnectionResponse>> GetMyClientsAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            if (currentUser.Role != Role.Trainer)
            {
                throw new ForbiddenAccessException();
            }

            var trainer = await _trainerRepository.GetTrainerWithClientsAsync(currentUser.Id) ?? throw new UserNotFoundException();

            var clientConnections = new List<ClientConnectionResponse>();

            foreach (var client in trainer.Clients)
            {
                var clientUser = await _userRepository.GetByIdAsync(client.Id);
                if (clientUser != null)
                {
                    clientConnections.Add(new ClientConnectionResponse
                    {
                        Client = clientUser,
                        InvitationAcceptedAt = client.InvitationAcceptedAt
                    });
                }
            }

            return clientConnections;
        }
    }
}
