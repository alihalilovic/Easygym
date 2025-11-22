using Easygym.Domain.Entities;

namespace Easygym.Domain.Interfaces
{
    public interface ITrainerClientHistoryRepository : IGenericRepository<TrainerClientHistory>
    {
        Task<List<TrainerClientHistory>> GetClientHistoryAsync(int clientId);
        Task<List<TrainerClientHistory>> GetTrainerHistoryAsync(int trainerId);
    }
}
