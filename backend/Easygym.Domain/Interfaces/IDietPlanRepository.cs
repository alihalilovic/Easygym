using Easygym.Domain.Entities;
using Easygym.Domain.Models.Requests;

namespace Easygym.Domain.Interfaces
{
    public interface IDietPlanRepository
    {
        Task<List<DietPlan>> GetDietPlansForClientAsync(int clientId);
        Task<DietPlan> GetDietPlanAsync(int dietPlanId);
        Task<List<DietPlan>> GetDietPlansByTrainerAsync(int trainerId);
        Task AddDietPlanAsync(DietPlan dietPlan);
        Task<DietPlan> UpdateDietPlanAsync(int dietPlanId, UpdateDietPlanRequest dietPlan);
        Task DeleteDietPlanAsync(int dietPlanId);

        // Assignment methods
        Task<DietPlanAssignment> AssignDietPlanToClientAsync(int dietPlanId, int clientId, bool isActive);
        Task<DietPlanAssignment?> GetAssignmentAsync(int dietPlanId, int clientId);
        Task<List<DietPlanAssignment>> GetAssignmentsForClientAsync(int clientId);
        Task UnassignDietPlanFromClientAsync(int dietPlanId, int clientId);
        Task DeactivateAllAssignmentsForClientAsync(int clientId);
        Task UpdateAssignmentActiveStatusAsync(int dietPlanId, int clientId, bool isActive);
    }
}
