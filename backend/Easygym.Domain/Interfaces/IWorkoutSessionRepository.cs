using Easygym.Domain.Entities;
using Easygym.Domain.Models.Common;
using Easygym.Domain.Models.Requests;

namespace Easygym.Domain.Interfaces
{
    public interface IWorkoutSessionRepository : IGenericRepository<WorkoutSession>
    {
        new Task<WorkoutSession?> GetByIdAsync(int id);
        new Task<IEnumerable<WorkoutSession>> GetAllAsync();
        Task<PagedResult<WorkoutSession>> GetPagedAsync(int traineeId, WorkoutSessionQueryParams queryParams);
    }
}