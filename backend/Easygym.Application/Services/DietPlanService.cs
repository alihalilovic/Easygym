using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Requests;
using Easygym.Domain.Models.Responses;

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

        public async Task<List<DietPlanResponse>> GetDietPlansAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            if (currentUser.Role == Role.Client)
            {
                var dietPlans = await _dietPlanRepository.GetDietPlansForClientAsync(currentUser.Id);
                return dietPlans.Select(MapToResponse).ToList();
            }

            if (currentUser.Role == Role.Trainer)
            {
                var dietPlans = await _dietPlanRepository.GetDietPlansByTrainerAsync(currentUser.Id);
                return dietPlans.Select(MapToResponse).ToList();
            }

            return [];
        }

        public async Task<DietPlanResponse> GetDietPlanAsync(int dietPlanId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var dietPlan = await _dietPlanRepository.GetDietPlanAsync(dietPlanId)
                ?? throw new DietPlanNotFoundException();

            ValidateDietPlanAccess(currentUser, dietPlan);
            return MapToResponse(dietPlan);
        }

        public async Task<DietPlanResponse> CreateDietPlanAsync(CreateDietPlanRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            foreach (var day in request.Days)
            {
                if (day.Meals.Count < 1 || day.Meals.Count > 10)
                    throw new ValidationException("Each day must have between 1 and 10 meals");
            }

            if (currentUser.Role != Role.Trainer)
                throw new ForbiddenAccessException();

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
            return MapToResponse(dietPlan);
        }

        public async Task<DietPlanResponse> UpdateDietPlanAsync(int dietPlanId, UpdateDietPlanRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var dietPlan = await _dietPlanRepository.GetDietPlanAsync(dietPlanId)
                ?? throw new DietPlanNotFoundException();

            ValidateDietPlanAccess(currentUser, dietPlan);

            if (currentUser.Role == Role.Client)
                throw new ForbiddenAccessException();

            if (request.Days != null)
            {
                foreach (var day in request.Days)
                {
                    if (day.Meals.Count < 1 || day.Meals.Count > 10)
                        throw new ValidationException("Each day must have between 1 and 10 meals");
                }
            }

            var updated = await _dietPlanRepository.UpdateDietPlanAsync(dietPlanId, request);
            return MapToResponse(updated);
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

        private static DietPlanResponse MapToResponse(DietPlan dp) => new()
        {
            Id = dp.Id,
            Name = dp.Name,
            TrainerId = dp.TrainerId,
            Days = dp.Days.Select(d => new DietPlanDayResponse
            {
                Id = d.Id,
                DayOfWeek = d.DayOfWeek,
                Meals = d.Meals.Select(m => new MealResponse
                {
                    Id = m.Id,
                    Name = m.Name,
                    Description = m.Description,
                    MealType = m.MealType,
                    Notes = m.Notes
                }).ToList()
            }).ToList(),
            Assignments = dp.Assignments?.Select(a => new DietPlanAssignmentResponse
            {
                Id = a.Id,
                DietPlanId = a.DietPlanId,
                ClientId = a.ClientId,
                IsActive = a.IsActive,
                AssignedAt = a.AssignedAt
            }).ToList() ?? [],
            CreatedAt = dp.CreatedAt
        };

        private static void ValidateDietPlanAccess(UserResponse currentUser, DietPlan dietPlan)
        {
            if (currentUser.Role == Role.Client)
            {
                var hasAssignment = dietPlan.Assignments.Any(a => a.ClientId == currentUser.Id);
                if (!hasAssignment)
                    throw new ForbiddenAccessException();
            }

            if (currentUser.Role == Role.Trainer && dietPlan.TrainerId != currentUser.Id)
                throw new ForbiddenAccessException();
        }
    }
}
