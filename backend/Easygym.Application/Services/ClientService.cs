using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Responses;
using Easygym.Domain.Constants;

namespace Easygym.Application.Services
{
    public class ClientService
    {
        private readonly IGenericRepository<Client> _clientRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly ITrainerClientHistoryRepository _historyRepository;
        private readonly IWorkoutSessionRepository _workoutSessionRepository;
        private readonly CurrentUserService _currentUserService;

        public ClientService(
            IGenericRepository<Client> clientRepository,
            IGenericRepository<User> userRepository,
            ITrainerClientHistoryRepository historyRepository,
            IWorkoutSessionRepository workoutSessionRepository,
            CurrentUserService currentUserService)
        {
            _clientRepository = clientRepository;
            _userRepository = userRepository;
            _historyRepository = historyRepository;
            _workoutSessionRepository = workoutSessionRepository;
            _currentUserService = currentUserService;
        }

        public async Task<TrainerConnectionResponse?> GetMyTrainerAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var client = await _clientRepository.GetByIdAsync(currentUser.Id) ?? throw new UserNotFoundException();

            if (client.TrainerId == null)
            {
                return null;
            }

            var trainer = await _userRepository.GetByIdAsync(client.TrainerId.Value);

            if (trainer == null)
            {
                return null;
            }

            return new TrainerConnectionResponse
            {
                Trainer = trainer.ToResponse(),
                InvitationAcceptedAt = client.InvitationAcceptedAt
            };
        }

        public async Task RemoveMyTrainerAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var client = await _clientRepository.GetByIdAsync(currentUser.Id) ?? throw new UserNotFoundException();

            if (client.TrainerId == null)
            {
                throw new ValidationException("You don't have a trainer assigned.");
            }

            // Save the history record
            var history = new TrainerClientHistory
            {
                TrainerId = client.TrainerId.Value,
                ClientId = client.Id,
                StartedAt = client.InvitationAcceptedAt,
                EndedAt = DateTime.UtcNow
            };
            await _historyRepository.AddAsync(history);

            client.TrainerId = null;
            client.InvitationAcceptedAt = default;
            await _clientRepository.UpdateAsync(client);
        }

        public async Task<List<TrainerConnectionResponse>> GetMyTrainerHistoryAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var history = await _historyRepository.GetClientHistoryAsync(currentUser.Id);

            return history.Select(h => new TrainerConnectionResponse
            {
                Trainer = h.Trainer!.ToResponse(),
                InvitationAcceptedAt = h.StartedAt,
                ConnectionEndedAt = h.EndedAt
            }).ToList();
        }

        public async Task<DashboardStatsResponse> GetDashboardStatsAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            if (currentUser.Role != Role.Client) throw new ForbiddenAccessException();

            var allSessions = (await _workoutSessionRepository.GetAllAsync())
               .Where(ws => ws.TraineeId == currentUser.Id)
               .OrderByDescending(ws => ws.StartTime)
               .ToList();

            // 1. Total Workouts
            var totalWorkouts = allSessions.Count;

            // 2. Average Weight
            double totalWeight = 0;
            int totalSets = 0;
            foreach (var session in allSessions)
            {
                if (session.Workout?.Sets != null)
                {
                    foreach (var set in session.Workout.Sets)
                    {
                        if (set.Weight.HasValue)
                        {
                            totalWeight += set.Weight.Value;
                            totalSets++;
                        }
                    }
                }
            }
            var averageWeight = totalSets > 0 ? totalWeight / totalSets : 0;

            // 3. Streak
            int streak = 0;
            var uniqueDates = allSessions
                .Select(ws => ws.StartTime.Date)
                .Distinct()
                .OrderByDescending(d => d)
                .ToList();

            if (uniqueDates.Any())
            {
                var today = DateTime.Today;
                // If the last workout was today or yesterday, the streak is alive
                if (uniqueDates.First() == today || uniqueDates.First() == today.AddDays(-1))
                {
                    streak = 1;
                    for (int i = 0; i < uniqueDates.Count - 1; i++)
                    {
                        if (uniqueDates[i].AddDays(-1) == uniqueDates[i + 1])
                        {
                            streak++;
                        }
                        else
                        {
                            break;
                        }
                    }
                }
            }

            // 4. Progress Chart (Total Volume per day)
            var progressChart = allSessions
                .GroupBy(ws => ws.StartTime.Date)
                .Select(g => new ChartDataPoint
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Value = g.Sum(ws => ws.Workout?.Sets?.Where(s => s.Weight.HasValue).Sum(s => s.Weight.Value * s.Repetitions) ?? 0)
                })
                .OrderBy(p => p.Date)
                .TakeLast(7)
                .ToList();

            // 5. Recent Activities (Past)
            var recentActivities = allSessions
                .Where(ws => ws.StartTime <= DateTime.Now)
                .OrderByDescending(ws => ws.StartTime)
                .Take(5)
                .Select(MapToResponse)
                .ToList();

            // 6. Upcoming Sessions (Future)
            var upcomingSessions = allSessions
                .Where(ws => ws.StartTime > DateTime.Now)
                .OrderBy(ws => ws.StartTime)
                .Take(5)
                .Select(MapToResponse)
                .ToList();

            return new DashboardStatsResponse
            {
                TotalWorkouts = totalWorkouts,
                AverageWeightLifted = Math.Round(averageWeight, 2),
                StreakDays = streak,
                ProgressChart = progressChart,
                RecentActivities = recentActivities,
                UpcomingSessions = upcomingSessions
            };
        }

        private static WorkoutSessionResponse MapToResponse(WorkoutSession ws)
        {
            return new WorkoutSessionResponse
            {
                Id = ws.Id,
                WorkoutId = ws.WorkoutId,
                Workout = ws.Workout == null ? null : MapWorkoutToResponse(ws.Workout),
                TraineeId = ws.TraineeId,
                StartTime = ws.StartTime,
                EndTime = ws.EndTime,
                PerceivedDifficulty = ws.PerceivedDifficulty,
                Notes = ws.Notes
            };
        }

        private static WorkoutResponse? MapWorkoutToResponse(Workout w)
        {
            if (w == null) return null;
            return new WorkoutResponse
            {
                Id = w.Id,
                Name = w.Name,
                Description = w.Description,
                TraineeId = w.TraineeId,
                TrainerId = w.TrainerId,
                Sets = w.Sets?.Select(s => new SetResponse
                {
                    Id = s.Id,
                    ExerciseId = s.ExerciseId,
                    Exercise = s.Exercise == null ? null : new ExerciseSummaryResponse
                    {
                        Id = s.Exercise.Id,
                        Name = s.Exercise.Name,
                        MuscleGroup = s.Exercise.MuscleGroup
                    },
                    Repetitions = s.Repetitions,
                    Weight = s.Weight
                }).ToList() ?? [],
                RestTimeSeconds = w.RestTimeSeconds,
                CreatedAt = w.CreatedAt
            };
        }
    }
}
