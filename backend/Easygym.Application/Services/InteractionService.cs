using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;

namespace Easygym.Application.Services
{
    public class InteractionService
    {
        private readonly IInteractionRepository _interactionRepository;
        private readonly CurrentUserService _currentUserService;

        public InteractionService(IInteractionRepository interactionRepository, CurrentUserService currentUserService)
        {
            _interactionRepository = interactionRepository;
            _currentUserService = currentUserService;
        }

        public async Task<List<User>> GetClientsForTrainerAsync(int trainerId)
        {
            await CanAccessTrainer(trainerId);
            return await _interactionRepository.GetClientsForTrainerAsync(trainerId);
        }

        private async Task CanAccessTrainer(int trainerId)
        {
            string unauthorizedMessage = "You are not authorized to access this resource";
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            if (currentUser.Role == Role.Client)
            {
                throw new UnauthorizedAccessException(unauthorizedMessage);
            }

            if (currentUser.Role == Role.Trainer && currentUser.Id != trainerId)
            {
                throw new UnauthorizedAccessException(unauthorizedMessage);
            }
        }
    }
}