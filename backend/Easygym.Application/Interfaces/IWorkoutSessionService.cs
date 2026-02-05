using Easygym.Domain.Entities;
using Easygym.Domain.Models.Common;
using Easygym.Domain.Models.Requests;

namespace Easygym.Application.Interfaces
{
    public interface IWorkoutSessionService
    {
        Task<IEnumerable<WorkoutSession>> GetWorkoutSessionsForTraineeAsync(int traineeId);
        Task<PagedResult<WorkoutSession>> GetPagedWorkoutSessionsForTraineeAsync(int traineeId, WorkoutSessionQueryParams queryParams);
        Task<WorkoutSession> GetWorkoutSessionAsync(int workoutSessionId);
        Task<WorkoutSession> CreateWorkoutSessionAsync(WorkoutSession workoutSession);
        Task UpdateWorkoutSessionAsync(UpdateWorkoutSessionRequest workoutSession);
        Task DeleteWorkoutSessionAsync(int workoutSessionId);
    }
}