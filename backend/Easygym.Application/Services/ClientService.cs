using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Responses;

namespace Easygym.Application.Services
{
    public class ClientService
    {
        private readonly IGenericRepository<Client> _clientRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly CurrentUserService _currentUserService;

        public ClientService(
            IGenericRepository<Client> clientRepository,
            IGenericRepository<User> userRepository,
            CurrentUserService currentUserService)
        {
            _clientRepository = clientRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
        }

        public async Task<TrainerConnectionResponse?> GetMyTrainerAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var client = await _clientRepository.GetByIdAsync(currentUser.Id) ?? throw new UserNotFoundException();

            if (client.TrainerId == null)
            {
                return null;
            }

            var trainer = await _userRepository.GetByIdAsync(client.TrainerId.Value);

            if (trainer == null)
            {
                return null;
            }

            return new TrainerConnectionResponse
            {
                Trainer = trainer,
                InvitationAcceptedAt = client.InvitationAcceptedAt
            };
        }
    }
}
