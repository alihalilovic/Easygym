using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Requests;
using Easygym.Domain.Models.Responses;

namespace Easygym.Application.Services
{
    public class MealLogService
    {
        private readonly IMealLogRepository _mealLogRepository;
        private readonly IDietPlanRepository _dietPlanRepository;
        private readonly IGenericRepository<Meal> _mealRepository;
        private readonly CurrentUserService _currentUserService;
        private readonly IGenericRepository<Client> _clientRepository;

        public MealLogService(
            IMealLogRepository mealLogRepository,
            IDietPlanRepository dietPlanRepository,
            IGenericRepository<Meal> mealRepository,
            CurrentUserService currentUserService,
            IGenericRepository<Client> clientRepository)
        {
            _mealLogRepository = mealLogRepository;
            _dietPlanRepository = dietPlanRepository;
            _mealRepository = mealRepository;
            _currentUserService = currentUserService;
            _clientRepository = clientRepository;
        }

        public async Task<MealLogResponse> LogMealAsync(LogMealRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Only clients can log their own meals
            if (currentUser.Role != Role.Client)
            {
                throw new ForbiddenAccessException();
            }

            // Validate log date (must be today only)
            var today = DateOnly.FromDateTime(DateTime.Today);

            if (request.LogDate != today)
            {
                throw new InvalidLogDateException("Can only log meals for today");
            }

            // Get active diet plan assignment
            var assignments = await _dietPlanRepository.GetAssignmentsForClientAsync(currentUser.Id);
            var activeAssignment = assignments.FirstOrDefault(a => a.IsActive);

            if (activeAssignment == null)
            {
                throw new NoActiveDietPlanException();
            }

            // Validate that the meal exists in the diet plan for the given day
            var dayOfWeek = (int)request.LogDate.DayOfWeek; // 0 = Sunday, 6 = Saturday

            var dietPlanDayOfWeek = dayOfWeek == 0 ? 6 : dayOfWeek - 1;

            var dietPlanDay = activeAssignment.DietPlan?.Days
                .FirstOrDefault(d => d.DayOfWeek == dietPlanDayOfWeek);

            if (dietPlanDay == null)
            {
                throw new MealNotInDietPlanException();
            }

            var mealInPlan = dietPlanDay.Meals.Any(m => m.Id == request.MealId);
            if (!mealInPlan)
            {
                throw new MealNotInDietPlanException();
            }

            // Log the meal
            var mealLog = await _mealLogRepository.LogMealAsync(
                currentUser.Id,
                request.MealId,
                activeAssignment.Id,
                request.LogDate);

            var meal = await _mealRepository.GetByIdAsync(request.MealId);

            return new MealLogResponse
            {
                Id = mealLog.Id,
                MealId = mealLog.MealId,
                MealName = meal?.Name ?? "",
                LogDate = mealLog.LogDate,
                CompletedAt = mealLog.CompletedAt,
                IsCompleted = !mealLog.IsDeleted
            };
        }

        public async Task UnlogMealAsync(UnlogMealRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Only clients can unlog their own meals
            if (currentUser.Role != Role.Client)
            {
                throw new ForbiddenAccessException();
            }

            await _mealLogRepository.UnlogMealAsync(currentUser.Id, request.MealId, request.LogDate);
        }

        public async Task<DailyMealProgressResponse> GetDailyProgressAsync(DateOnly date, int? clientId = null)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Determine which client's progress to retrieve
            int targetClientId;

            if (currentUser.Role == Role.Client)
            {
                // Clients can only view their own progress
                targetClientId = currentUser.Id;
            }
            else if (currentUser.Role == Role.Trainer)
            {
                // Trainers must specify a clientId
                if (clientId == null)
                {
                    throw new ValidationException("Client ID is required for trainers");
                }

                // Verify the client belongs to this trainer
                var client = await _clientRepository.GetByIdAsync(clientId.Value);
                if (client?.TrainerId != currentUser.Id)
                {
                    throw new ForbiddenAccessException();
                }

                targetClientId = clientId.Value;
            }
            else
            {
                throw new ForbiddenAccessException();
            }

            // Get active assignment and meals for the day
            var assignments = await _dietPlanRepository.GetAssignmentsForClientAsync(targetClientId);
            var activeAssignment = assignments.FirstOrDefault(a => a.IsActive);

            if (activeAssignment == null)
            {
                return new DailyMealProgressResponse
                {
                    Date = date,
                    TotalMeals = 0,
                    CompletedMeals = 0,
                    AdherencePercentage = 0,
                    Meals = []
                };
            }

            // Get the correct day from diet plan
            var dayOfWeek = (int)date.DayOfWeek;
            var dietPlanDayOfWeek = dayOfWeek == 0 ? 6 : dayOfWeek - 1;

            var dietPlanDay = activeAssignment.DietPlan?.Days
                .FirstOrDefault(d => d.DayOfWeek == dietPlanDayOfWeek);

            if (dietPlanDay == null || !dietPlanDay.Meals.Any())
            {
                return new DailyMealProgressResponse
                {
                    Date = date,
                    TotalMeals = 0,
                    CompletedMeals = 0,
                    AdherencePercentage = 0,
                    Meals = []
                };
            }

            // Get meal logs for the date
            var mealLogs = await _mealLogRepository.GetMealLogsForDateAsync(targetClientId, date);
            var loggedMealIds = mealLogs.Select(ml => ml.MealId).ToHashSet();

            var mealProgressItems = dietPlanDay.Meals.Select(meal =>
            {
                var log = mealLogs.FirstOrDefault(ml => ml.MealId == meal.Id);
                return new MealProgressItem
                {
                    MealId = meal.Id,
                    MealName = meal.Name,
                    MealType = meal.MealType,
                    Description = meal.Description,
                    IsCompleted = log != null,
                    CompletedAt = log?.CompletedAt
                };
            }).ToList();

            var totalMeals = dietPlanDay.Meals.Count;
            var completedMeals = mealProgressItems.Count(m => m.IsCompleted);
            var adherencePercentage = totalMeals > 0 ? (double)completedMeals / totalMeals * 100 : 0;

            return new DailyMealProgressResponse
            {
                Date = date,
                TotalMeals = totalMeals,
                CompletedMeals = completedMeals,
                AdherencePercentage = Math.Round(adherencePercentage, 2),
                Meals = mealProgressItems
            };
        }

        public async Task<WeeklyMealProgressResponse> GetWeeklyProgressAsync(DateOnly startDate, int? clientId = null)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Determine which client's progress to retrieve
            int targetClientId;

            if (currentUser.Role == Role.Client)
            {
                targetClientId = currentUser.Id;
            }
            else if (currentUser.Role == Role.Trainer)
            {
                if (clientId == null)
                {
                    throw new ValidationException("Client ID is required for trainers");
                }

                var client = await _clientRepository.GetByIdAsync(clientId.Value);
                if (client?.TrainerId != currentUser.Id)
                {
                    throw new ForbiddenAccessException();
                }

                targetClientId = clientId.Value;
            }
            else
            {
                throw new ForbiddenAccessException();
            }

            var endDate = startDate.AddDays(6);
            var dailyProgressList = new List<DailyMealProgressResponse>();

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                var dailyProgress = await GetDailyProgressAsync(date, targetClientId);
                dailyProgressList.Add(dailyProgress);
            }

            var totalMealsInWeek = dailyProgressList.Sum(d => d.TotalMeals);
            var totalCompletedInWeek = dailyProgressList.Sum(d => d.CompletedMeals);
            var overallAdherence = totalMealsInWeek > 0
                ? (double)totalCompletedInWeek / totalMealsInWeek * 100
                : 0;

            return new WeeklyMealProgressResponse
            {
                ClientId = targetClientId,
                StartDate = startDate,
                EndDate = endDate,
                DailyProgress = dailyProgressList,
                OverallAdherencePercentage = Math.Round(overallAdherence, 2)
            };
        }
    }
}
