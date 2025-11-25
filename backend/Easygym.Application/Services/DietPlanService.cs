using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Models.Requests;

namespace Easygym.Application.Services
{
    public class DietPlanService
    {
        private readonly IDietPlanRepository _dietPlanRepository;
        private readonly CurrentUserService _currentUserService;
        private readonly IGenericRepository<Client> _clientRepository;

        public DietPlanService(
            IDietPlanRepository dietPlanRepository,
            CurrentUserService currentUserService,
            IGenericRepository<Client> clientRepository)
        {
            _dietPlanRepository = dietPlanRepository;
            _currentUserService = currentUserService;
            _clientRepository = clientRepository;
        }

        public async Task<List<DietPlan>> GetDietPlansAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Clients get their assigned diet plans
            if (currentUser.Role == Role.Client)
            {
                var dietPlans = await _dietPlanRepository.GetDietPlansForClientAsync(currentUser.Id);
                return dietPlans;
            }

            // Trainers get all diet plans they created
            if (currentUser.Role == Role.Trainer)
            {
                var dietPlans = await _dietPlanRepository.GetDietPlansByTrainerAsync(currentUser.Id);
                return dietPlans;
            }

            // Admins can see all diet plans
            return [];
        }

        public async Task<DietPlan> GetDietPlanAsync(int dietPlanId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var dietPlan = await _dietPlanRepository.GetDietPlanAsync(dietPlanId);

            if (dietPlan == null)
            {
                throw new DietPlanNotFoundException();
            }

            ValidateDietPlanAccess(currentUser, dietPlan);

            return dietPlan;
        }

        public async Task<DietPlan> CreateDietPlanAsync(CreateDietPlanRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Validate each day has 1-10 meals
            foreach (var day in request.Days)
            {
                if (day.Meals.Count < 1 || day.Meals.Count > 10)
                {
                    throw new ValidationException("Each day must have between 1 and 10 meals");
                }
            }

            // Only trainers can create diet plans
            if (currentUser.Role != Role.Trainer)
            {
                throw new ForbiddenAccessException();
            }

            var dietPlan = new DietPlan
            {
                Name = request.Name,
                TrainerId = currentUser.Id,
                Days = [.. request.Days.Select(dayDto => new DietPlanDay
                {
                    DayOfWeek = dayDto.DayOfWeek,
                    Meals = [.. dayDto.Meals.Select(mealDto => new Meal
                    {
                        Name = mealDto.Name,
                        Description = mealDto.Description,
                        MealType = mealDto.MealType,
                        Notes = mealDto.Notes
                    })]
                })]
            };

            await _dietPlanRepository.AddDietPlanAsync(dietPlan);
            return dietPlan;
        }

        public async Task<DietPlan> UpdateDietPlanAsync(int dietPlanId, UpdateDietPlanRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var dietPlan = await _dietPlanRepository.GetDietPlanAsync(dietPlanId) ?? throw new DietPlanNotFoundException();
            ValidateDietPlanAccess(currentUser, dietPlan);

            // Only trainers can update diet plans
            if (currentUser.Role == Role.Client)
            {
                throw new ForbiddenAccessException();
            }

            // Validate days structure if provided
            if (request.Days != null)
            {
                foreach (var day in request.Days)
                {
                    if (day.Meals.Count < 1 || day.Meals.Count > 10)
                    {
                        throw new ValidationException("Each day must have between 1 and 10 meals");
                    }
                }
            }

            return await _dietPlanRepository.UpdateDietPlanAsync(dietPlanId, request);
        }

        public async Task DeleteDietPlanAsync(int dietPlanId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var dietPlan = await _dietPlanRepository.GetDietPlanAsync(dietPlanId) ?? throw new DietPlanNotFoundException();
            ValidateDietPlanAccess(currentUser, dietPlan);

            // Only trainers can delete diet plans
            if (currentUser.Role == Role.Client)
            {
                throw new ForbiddenAccessException();
            }

            await _dietPlanRepository.DeleteDietPlanAsync(dietPlanId);
        }

        // Assignment methods
        public async Task AssignDietPlanToClientsAsync(AssignDietPlanRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Only trainers can assign diet plans
            if (currentUser.Role != Role.Trainer)
            {
                throw new ForbiddenAccessException();
            }

            // Verify the diet plan belongs to the trainer
            var dietPlan = await _dietPlanRepository.GetDietPlanAsync(request.DietPlanId);
            if (dietPlan.TrainerId != currentUser.Id)
            {
                throw new ForbiddenAccessException();
            }

            // Validate all clients belong to the trainer
            foreach (var clientId in request.ClientIds)
            {
                var client = await _clientRepository.GetByIdAsync(clientId) ?? throw new ValidationException($"Client {clientId} not found");
                if (client.TrainerId != currentUser.Id)
                {
                    throw new ForbiddenAccessException();
                }

                await _dietPlanRepository.AssignDietPlanToClientAsync(request.DietPlanId, clientId, request.IsActive);
            }
        }

        public async Task UnassignDietPlanFromClientAsync(int dietPlanId, int clientId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Only trainers can unassign diet plans
            if (currentUser.Role != Role.Trainer)
            {
                throw new ForbiddenAccessException();
            }

            var dietPlan = await _dietPlanRepository.GetDietPlanAsync(dietPlanId);
            if (dietPlan.TrainerId != currentUser.Id)
            {
                throw new ForbiddenAccessException();
            }

            await _dietPlanRepository.UnassignDietPlanFromClientAsync(dietPlanId, clientId);
        }

        public async Task UpdateAssignmentActiveStatusAsync(int dietPlanId, int clientId, bool isActive)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Only trainers can update assignment status
            if (currentUser.Role != Role.Trainer)
            {
                throw new ForbiddenAccessException();
            }

            var dietPlan = await _dietPlanRepository.GetDietPlanAsync(dietPlanId);
            if (dietPlan.TrainerId != currentUser.Id)
            {
                throw new ForbiddenAccessException();
            }

            await _dietPlanRepository.UpdateAssignmentActiveStatusAsync(dietPlanId, clientId, isActive);
        }

        private static void ValidateDietPlanAccess(User currentUser, DietPlan dietPlan)
        {
            // Clients can only access diet plans assigned to them
            if (currentUser.Role == Role.Client)
            {
                var hasAssignment = dietPlan.Assignments.Any(a => a.ClientId == currentUser.Id);
                if (!hasAssignment)
                {
                    throw new ForbiddenAccessException();
                }
            }

            // Trainers can only access diet plans they created
            if (currentUser.Role == Role.Trainer && dietPlan.TrainerId != currentUser.Id)
            {
                throw new ForbiddenAccessException();
            }

            // Admins can access all diet plans
        }
    }
}
