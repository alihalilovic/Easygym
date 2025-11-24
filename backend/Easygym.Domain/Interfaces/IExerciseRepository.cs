using Easygym.Domain.Entities;
using Easygym.Domain.Models.Requests;

namespace Easygym.Domain.Interfaces
{
    public interface IExerciseRepository
    {
        Task<List<Exercise>> GetExercisesForUserAsync(int userId);
        Task<Exercise?> GetExerciseAsync(int exerciseId);
        Task AddExerciseAsync(Exercise exercise);
        Task<Exercise> UpdateExerciseAsync(int exerciseId, UpdateExerciseRequest request);
        Task DeleteExerciseAsync(int exerciseId);
        Task<bool> IsExerciseInUseAsync(int exerciseId);
    }
}
