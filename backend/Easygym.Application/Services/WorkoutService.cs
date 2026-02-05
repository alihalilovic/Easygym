using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Models.Requests;
using Easygym.Application.Interfaces;

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
        public async Task<List<Workout>> GetWorkoutsAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Clients get their own workouts
            if (currentUser.Role == Role.Client)
            {
                var workouts = await _workoutRepository.GetWorkoutsForTraineeAsync(currentUser.Id);
                return workouts;
            }

            // Trainers get all workouts they created for their clients
            if (currentUser.Role == Role.Trainer)
            {
                var workouts = await _workoutRepository.GetWorkoutsByTrainerAsync(currentUser.Id);
                return workouts;
            }

            // Admins can see all workouts (need to implement in repository)
            return new List<Workout>();
        }

        public async Task<Workout> GetWorkoutAsync(int workoutId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var workout = await _workoutRepository.GetWorkoutAsync(workoutId);

            if (workout == null)
            {
                throw new WorkoutNotFoundException();
            }

            ValidateWorkoutAccess(currentUser, workout);

            return workout;
        }

        public async Task<Workout> CreateWorkoutAsync(CreateWorkoutRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            if (request.Sets.Count == 0)
            {
                throw new ValidationException("Workout must have at least one set");
            }

            int? trainerId = null;

            // Clients can only create workouts for themselves
            if (currentUser.Role == Role.Client && request.TraineeId != currentUser.Id)
            {
                throw new ForbiddenAccessException();
            }

            // Trainers can create workouts for their clients
            if (currentUser.Role == Role.Trainer)
            {
                var client = await _clientRepository.GetByIdAsync(request.TraineeId);

                if (client == null)
                {
                    throw new ValidationException("Client not found");
                }

                if (client.TrainerId != currentUser.Id)
                {
                    throw new ForbiddenAccessException();
                }

                trainerId = currentUser.Id;
            }

            // Admins can create workouts for any user

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
            return workout;
        }


        public async Task<Workout> UpdateWorkoutAsync(int workoutId, UpdateWorkoutRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var workout = await _workoutRepository.GetWorkoutAsync(workoutId);

            if (workout == null)
            {
                throw new WorkoutNotFoundException();
            }

            ValidateWorkoutAccess(currentUser, workout);

            return await _workoutRepository.UpdateWorkoutAsync(workoutId, request);
        }


        public async Task DeleteWorkoutAsync(int workoutId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var workout = await _workoutRepository.GetWorkoutAsync(workoutId);

            if (workout == null)
            {
                throw new WorkoutNotFoundException();
            }

            ValidateWorkoutAccess(currentUser, workout);

            // Check if there are any workout sessions associated with the workout
            var workoutSessions = await _workoutSessionService.GetWorkoutSessionsForTraineeAsync(workout.TraineeId);
            if (workoutSessions.Any(ws => ws.WorkoutId == workoutId))
            {
                throw new ValidationException("Workout has workout sessions associated with it. Please delete the workout sessions first.");
            }

            await _workoutRepository.DeleteWorkoutAsync(workoutId);
        }

        private void ValidateWorkoutAccess(User currentUser, Workout workout)
        {
            // Clients can only access their own workouts
            if (currentUser.Role == Role.Client && workout.TraineeId != currentUser.Id)
            {
                throw new ForbiddenAccessException();
            }

            // Trainers can only access workouts they created
            if (currentUser.Role == Role.Trainer && workout.TrainerId != currentUser.Id)
            {
                throw new ForbiddenAccessException();
            }

            // Admins can access all workouts
        }
    }
}