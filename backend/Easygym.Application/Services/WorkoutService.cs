using Easygym.Application.Interfaces;
using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Requests;
using Easygym.Domain.Models.Responses;

namespace Easygym.Application.Services
{
    public class WorkoutService
    {
        private readonly IWorkoutRepository _workoutRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IGenericRepository<Client> _clientRepository;
        private readonly IWorkoutSessionService _workoutSessionService;

        public WorkoutService(IWorkoutRepository workoutRepository, ICurrentUserService currentUserService, IGenericRepository<Client> clientRepository, IWorkoutSessionService workoutSessionService)
        {
            _workoutRepository = workoutRepository;
            _currentUserService = currentUserService;
            _clientRepository = clientRepository;
            _workoutSessionService = workoutSessionService;
        }

        public async Task<List<WorkoutResponse>> GetWorkoutsAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            if (currentUser.Role == Role.Client)
            {
                var workouts = await _workoutRepository.GetWorkoutsForTraineeAsync(currentUser.Id);
                return workouts.Select(MapToResponse).ToList();
            }

            if (currentUser.Role == Role.Trainer)
            {
                var workouts = await _workoutRepository.GetWorkoutsByTrainerAsync(currentUser.Id);
                return workouts.Select(MapToResponse).ToList();
            }

            return [];
        }

        public async Task<WorkoutResponse> GetWorkoutAsync(int workoutId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var workout = await _workoutRepository.GetWorkoutAsync(workoutId)
                ?? throw new WorkoutNotFoundException();

            ValidateWorkoutAccess(currentUser, workout);
            return MapToResponse(workout);
        }

        public async Task<WorkoutResponse> CreateWorkoutAsync(CreateWorkoutRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            if (request.Sets.Count == 0)
                throw new ValidationException("Workout must have at least one set");

            int? trainerId = null;

            if (currentUser.Role == Role.Client && request.TraineeId != currentUser.Id)
                throw new ForbiddenAccessException();

            if (currentUser.Role == Role.Trainer)
            {
                var client = await _clientRepository.GetByIdAsync(request.TraineeId)
                    ?? throw new ValidationException("Client not found");
                if (client.TrainerId != currentUser.Id)
                    throw new ForbiddenAccessException();
                trainerId = currentUser.Id;
            }

            var workout = new Workout
            {
                TraineeId = request.TraineeId,
                Name = request.Name,
                Description = request.Description,
                Sets = request.Sets.Select(setDto => new Set
                {
                    ExerciseId = setDto.ExerciseId,
                    Repetitions = setDto.Repetitions,
                    Weight = setDto.Weight
                }).ToList(),
                RestTimeSeconds = request.RestTimeSeconds,
                TrainerId = trainerId
            };

            await _workoutRepository.AddWorkoutAsync(workout);
            return MapToResponse(workout);
        }

        public async Task<WorkoutResponse> UpdateWorkoutAsync(int workoutId, UpdateWorkoutRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var workout = await _workoutRepository.GetWorkoutAsync(workoutId)
                ?? throw new WorkoutNotFoundException();

            ValidateWorkoutAccess(currentUser, workout);
            var updated = await _workoutRepository.UpdateWorkoutAsync(workoutId, request);
            return MapToResponse(updated);
        }

        public async Task DeleteWorkoutAsync(int workoutId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var workout = await _workoutRepository.GetWorkoutAsync(workoutId)
                ?? throw new WorkoutNotFoundException();

            ValidateWorkoutAccess(currentUser, workout);

            var workoutSessions = await _workoutSessionService.GetWorkoutSessionsForTraineeAsync(workout.TraineeId);
            if (workoutSessions.Any(ws => ws.WorkoutId == workoutId))
                throw new ValidationException("Workout has workout sessions associated with it. Please delete the workout sessions first.");

            await _workoutRepository.DeleteWorkoutAsync(workoutId);
        }

        private static WorkoutResponse MapToResponse(Workout w) => new()
        {
            Id = w.Id,
            Name = w.Name,
            Description = w.Description,
            TraineeId = w.TraineeId,
            TrainerId = w.TrainerId,
            Sets = w.Sets.Select(s => new SetResponse
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
            }).ToList(),
            RestTimeSeconds = w.RestTimeSeconds,
            CreatedAt = w.CreatedAt
        };

        private static void ValidateWorkoutAccess(UserResponse currentUser, Workout workout)
        {
            if (currentUser.Role == Role.Client && workout.TraineeId != currentUser.Id)
                throw new ForbiddenAccessException();
            if (currentUser.Role == Role.Trainer && workout.TrainerId != currentUser.Id)
                throw new ForbiddenAccessException();
        }
    }
}