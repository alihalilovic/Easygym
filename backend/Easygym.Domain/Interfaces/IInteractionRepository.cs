using Easygym.Domain.Entities;

namespace Easygym.Domain.Interfaces
{
    public interface IInteractionRepository
    {
        Task<List<User>> GetClientsForTrainerAsync(int trainerId);
    }
}