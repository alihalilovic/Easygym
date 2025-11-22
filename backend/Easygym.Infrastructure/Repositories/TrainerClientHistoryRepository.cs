using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Easygym.Infrastructure.Repositories
{
    public class TrainerClientHistoryRepository : GenericRepository<TrainerClientHistory>, ITrainerClientHistoryRepository
    {
        private readonly EasygymDbContext _historyContext;

        public TrainerClientHistoryRepository(EasygymDbContext context) : base(context)
        {
            _historyContext = context;
        }

        public async Task<List<TrainerClientHistory>> GetClientHistoryAsync(int clientId)
        {
            return await _historyContext.TrainerClientHistories
                .Where(h => h.ClientId == clientId && h.EndedAt != null)
                .Include(h => h.Trainer)
                .OrderByDescending(h => h.EndedAt)
                .ToListAsync();
        }

        public async Task<List<TrainerClientHistory>> GetTrainerHistoryAsync(int trainerId)
        {
            return await _historyContext.TrainerClientHistories
                .Where(h => h.TrainerId == trainerId && h.EndedAt != null)
                .Include(h => h.Client)
                .OrderByDescending(h => h.EndedAt)
                .ToListAsync();
        }
    }
}
