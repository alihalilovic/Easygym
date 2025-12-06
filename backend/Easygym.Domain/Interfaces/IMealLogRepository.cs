using Easygym.Domain.Entities;

namespace Easygym.Domain.Interfaces
{
    public interface IMealLogRepository
    {
        Task<MealLog> LogMealAsync(int clientId, int mealId, int assignmentId, DateOnly logDate, string? mediaUrl = null);

        // Unlog a meal (soft delete)
        Task UnlogMealAsync(int clientId, int mealId, DateOnly logDate);

        Task<List<MealLog>> GetMealLogsForDateAsync(int clientId, DateOnly date);

        Task<MealLog?> UpdateMediaUrlAsync(int clientId, int mealId, DateOnly logDate, string? mediaUrl);
    }
}
