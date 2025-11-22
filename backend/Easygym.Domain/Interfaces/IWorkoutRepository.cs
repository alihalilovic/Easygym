using Easygym.Domain.Entities;
using Easygym.Domain.Models.Requests;
namespace Easygym.Domain.Interfaces
{
    public interface IWorkoutRepository
    {
        Task<List<Workout>> GetWorkoutsForTraineeAsync(int traineeId);
        Task<Workout> GetWorkoutForTraineeAsync(int workoutId, int traineeId);
        Task AddWorkoutAsync(Workout workout);
        Task<Workout> UpdateWorkoutAsync(int workoutId, UpdateWorkoutRequest workout);
        Task DeleteWorkoutAsync(int workoutId);
        Task<Workout> GetWorkoutAsync(int workoutId);
        Task<List<Workout>> GetWorkoutsByTrainerAsync(int trainerId);
    }
}