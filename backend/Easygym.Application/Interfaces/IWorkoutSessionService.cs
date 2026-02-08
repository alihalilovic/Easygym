using Easygym.Domain.Entities;
using Easygym.Domain.Models.Common;
using Easygym.Domain.Models.Requests;
using Easygym.Domain.Models.Responses;

namespace Easygym.Application.Interfaces
{
    public interface IWorkoutSessionService
    {
        Task<IEnumerable<WorkoutSessionResponse>> GetWorkoutSessionsForTraineeAsync(int traineeId);
        Task<PagedResult<WorkoutSessionResponse>> GetPagedWorkoutSessionsForTraineeAsync(int traineeId, WorkoutSessionQueryParams queryParams);
        Task<WorkoutSessionResponse> GetWorkoutSessionAsync(int workoutSessionId);
        Task<WorkoutSessionResponse> CreateWorkoutSessionAsync(WorkoutSession workoutSession);
        Task UpdateWorkoutSessionAsync(UpdateWorkoutSessionRequest workoutSession);
        Task DeleteWorkoutSessionAsync(int workoutSessionId);
    }
}