using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Requests;
using Easygym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Easygym.Infrastructure.Repositories
{
    public class DietPlanRepository : IDietPlanRepository
    {
        private readonly EasygymDbContext _context;

        public DietPlanRepository(EasygymDbContext context)
        {
            _context = context;
        }

        public async Task<List<DietPlan>> GetDietPlansForClientAsync(int clientId)
        {
            var assignments = await _context.DietPlanAssignments
                .Include(a => a.DietPlan)
                    .ThenInclude(dp => dp!.Days)
                        .ThenInclude(d => d.Meals)
                .Include(a => a.DietPlan!.Trainer)
                .Include(a => a.DietPlan!.Assignments)
                    .ThenInclude(a => a.Client)
                .Where(a => a.ClientId == clientId)
                .ToListAsync();

            return [.. assignments.Select(a => a.DietPlan!)];
        }

        public async Task<DietPlan> GetDietPlanAsync(int dietPlanId)
        {
            return await _context.DietPlans
                .Include(dp => dp.Days)
                    .ThenInclude(d => d.Meals)
                .Include(dp => dp.Trainer)
                .Include(dp => dp.Assignments)
                    .ThenInclude(a => a.Client)
                .FirstOrDefaultAsync(dp => dp.Id == dietPlanId)
                ?? throw new DietPlanNotFoundException();
        }

        public async Task<List<DietPlan>> GetDietPlansByTrainerAsync(int trainerId)
        {
            return await _context.DietPlans
                .Include(dp => dp.Days)
                    .ThenInclude(d => d.Meals)
                .Include(dp => dp.Trainer)
                .Include(dp => dp.Assignments)
                    .ThenInclude(a => a.Client)
                .Where(dp => dp.TrainerId == trainerId)
                .ToListAsync();
        }

        public async Task AddDietPlanAsync(DietPlan dietPlan)
        {
            await _context.DietPlans.AddAsync(dietPlan);
            await _context.SaveChangesAsync();
        }

        public async Task<DietPlan> UpdateDietPlanAsync(int dietPlanId, UpdateDietPlanRequest dietPlan)
        {
            var existingDietPlan = await GetDietPlanAsync(dietPlanId);

            if (dietPlan.Name != null)
            {
                existingDietPlan.Name = dietPlan.Name;
            }

            if (dietPlan.Days != null)
            {
                // Remove all existing days and their meals
                foreach (var day in existingDietPlan.Days)
                {
                    foreach (var meal in day.Meals)
                    {
                        _context.Meals.Remove(meal);
                    }
                    _context.DietPlanDays.Remove(day);
                }

                // Add new days and meals
                foreach (var dayDto in dietPlan.Days)
                {
                    var newDay = new DietPlanDay
                    {
                        DayOfWeek = dayDto.DayOfWeek,
                        Meals = [.. dayDto.Meals.Select(m => new Meal
                        {
                            Name = m.Name,
                            Description = m.Description,
                            MealType = m.MealType,
                            Notes = m.Notes
                        })]
                    };
                    existingDietPlan.Days.Add(newDay);
                }
            }

            _context.DietPlans.Update(existingDietPlan);
            await _context.SaveChangesAsync();

            return existingDietPlan;
        }

        public async Task DeleteDietPlanAsync(int dietPlanId)
        {
            var dietPlan = await GetDietPlanAsync(dietPlanId);

            // Remove all assignments
            var assignments = await _context.DietPlanAssignments
                .Where(a => a.DietPlanId == dietPlanId)
                .ToListAsync();
            _context.DietPlanAssignments.RemoveRange(assignments);

            // Remove all days and their meals
            foreach (var day in dietPlan.Days)
            {
                if (day.Meals.Count != 0)
                {
                    _context.Meals.RemoveRange(day.Meals);
                }
                _context.DietPlanDays.Remove(day);
            }

            _context.DietPlans.Remove(dietPlan);
            await _context.SaveChangesAsync();
        }

        // Assignment methods
        public async Task<DietPlanAssignment> AssignDietPlanToClientAsync(int dietPlanId, int clientId, bool isActive)
        {
            // Check if assignment already exists
            var existingAssignment = await _context.DietPlanAssignments
                .FirstOrDefaultAsync(a => a.DietPlanId == dietPlanId && a.ClientId == clientId);

            if (existingAssignment != null)
            {
                existingAssignment.IsActive = isActive;
                await _context.SaveChangesAsync();
                return existingAssignment;
            }

            // If setting as active, deactivate all other assignments for this client
            if (isActive)
            {
                await DeactivateAllAssignmentsForClientAsync(clientId);
            }

            var assignment = new DietPlanAssignment
            {
                DietPlanId = dietPlanId,
                ClientId = clientId,
                IsActive = isActive
            };

            await _context.DietPlanAssignments.AddAsync(assignment);
            await _context.SaveChangesAsync();

            return assignment;
        }

        public async Task<DietPlanAssignment?> GetAssignmentAsync(int dietPlanId, int clientId)
        {
            return await _context.DietPlanAssignments
                .Include(a => a.DietPlan)
                    .ThenInclude(dp => dp!.Days)
                        .ThenInclude(d => d.Meals)
                .Include(a => a.Client)
                .FirstOrDefaultAsync(a => a.DietPlanId == dietPlanId && a.ClientId == clientId);
        }

        public async Task<List<DietPlanAssignment>> GetAssignmentsForClientAsync(int clientId)
        {
            return await _context.DietPlanAssignments
                .Include(a => a.DietPlan)
                    .ThenInclude(dp => dp!.Days)
                        .ThenInclude(d => d.Meals)
                .Include(a => a.DietPlan!.Trainer)
                .Where(a => a.ClientId == clientId)
                .ToListAsync();
        }

        public async Task UnassignDietPlanFromClientAsync(int dietPlanId, int clientId)
        {
            var assignment = await _context.DietPlanAssignments
                .FirstOrDefaultAsync(a => a.DietPlanId == dietPlanId && a.ClientId == clientId);

            if (assignment != null)
            {
                _context.DietPlanAssignments.Remove(assignment);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeactivateAllAssignmentsForClientAsync(int clientId)
        {
            var activeAssignments = await _context.DietPlanAssignments
                .Where(a => a.ClientId == clientId && a.IsActive)
                .ToListAsync();

            foreach (var assignment in activeAssignments)
            {
                assignment.IsActive = false;
            }

            await _context.SaveChangesAsync();
        }

        public async Task UpdateAssignmentActiveStatusAsync(int dietPlanId, int clientId, bool isActive)
        {
            var assignment = await _context.DietPlanAssignments
                .FirstOrDefaultAsync(a => a.DietPlanId == dietPlanId && a.ClientId == clientId);

            if (assignment != null)
            {
                if (isActive)
                {
                    await DeactivateAllAssignmentsForClientAsync(clientId);
                }

                assignment.IsActive = isActive;
                await _context.SaveChangesAsync();
            }
        }
    }
}
