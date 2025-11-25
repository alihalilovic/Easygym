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
        private readonly ITrainerClientHistoryRepository _historyRepository;
        private readonly CurrentUserService _currentUserService;

        public ClientService(
            IGenericRepository<Client> clientRepository,
            IGenericRepository<User> userRepository,
            ITrainerClientHistoryRepository historyRepository,
            CurrentUserService currentUserService)
        {
            _clientRepository = clientRepository;
            _userRepository = userRepository;
            _historyRepository = historyRepository;
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

        public async Task RemoveMyTrainerAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var client = await _clientRepository.GetByIdAsync(currentUser.Id) ?? throw new UserNotFoundException();

            if (client.TrainerId == null)
            {
                throw new ValidationException("You don't have a trainer assigned.");
            }

            // Save the history record
            var history = new TrainerClientHistory
            {
                TrainerId = client.TrainerId.Value,
                ClientId = client.Id,
                StartedAt = client.InvitationAcceptedAt,
                EndedAt = DateTime.UtcNow
            };
            await _historyRepository.AddAsync(history);

            client.TrainerId = null;
            client.InvitationAcceptedAt = default;
            await _clientRepository.UpdateAsync(client);
        }

        public async Task<List<TrainerConnectionResponse>> GetMyTrainerHistoryAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var history = await _historyRepository.GetClientHistoryAsync(currentUser.Id);

            return history.Select(h => new TrainerConnectionResponse
            {
                Trainer = h.Trainer!,
                InvitationAcceptedAt = h.StartedAt,
                ConnectionEndedAt = h.EndedAt
            }).ToList();
        }
    }
}
