using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Models.Requests;
namespace Easygym.Application.Services
{
    public class WorkoutService
    {
        private readonly IWorkoutRepository _workoutRepository;
        private readonly CurrentUserService _currentUserService;
        private readonly IGenericRepository<Client> _clientRepository;

        public WorkoutService(IWorkoutRepository workoutRepository, CurrentUserService currentUserService, IGenericRepository<Client> clientRepository)
        {
            _workoutRepository = workoutRepository;
            _currentUserService = currentUserService;
            _clientRepository = clientRepository;
        }
        public async Task<List<Workout>> GetWorkoutsForTraineeAsync(int traineeId)
        {
            await CanAccessWorkout(traineeId);

            var workouts = await _workoutRepository.GetWorkoutsForTraineeAsync(traineeId);
            return workouts;
        }

        public async Task<List<Workout>> GetWorkoutsCreatedByTrainerAsync(int trainerId)
        {
            await CanAccessWorkout(null, trainerId);

            var workouts = await _workoutRepository.GetWorkoutsByTrainerAsync(trainerId);
            return workouts;
        }

        public async Task<Workout> GetWorkoutForTraineeAsync(int workoutId, int traineeId)
        {
            await CanAccessWorkout(traineeId);

            var workout = await _workoutRepository.GetWorkoutForTraineeAsync(workoutId, traineeId);
            return workout;
        }

        public async Task<Workout> CreateWorkoutAsync(CreateWorkoutRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Validate trainee access
            await CanAccessWorkout(request.TraineeId);

            if (request.Sets.Count == 0)
            {
                throw new ValidationException("Workout must have at least one set");
            }

            // If the current user is a trainer, verify they are connected to the trainee
            int? trainerId = null;
            if (currentUser.Role == Role.Trainer)
            {
                var client = await _clientRepository.GetByIdAsync(request.TraineeId);

                if (client == null)
                {
                    throw new ValidationException("Trainee must be provided");
                }

                if (client.TrainerId != currentUser.Id)
                {
                    throw new ForbiddenAccessException();
                }

                trainerId = currentUser.Id;
            }

            var workout = new Workout
            {
                TraineeId = request.TraineeId,
                Name = request.Name,
                Description = request.Description,
                Sets = request.Sets,
                RestTimeSeconds = request.RestTimeSeconds,
                TrainerId = trainerId
            };

            await _workoutRepository.AddWorkoutAsync(workout);
            return workout;
        }


        public async Task<Workout> UpdateWorkoutAsync(int traineeId, int workoutId, UpdateWorkoutRequest workout)
        {
            await CanAccessWorkout(traineeId);
            return await _workoutRepository.UpdateWorkoutAsync(workoutId, workout);
        }


        public async Task DeleteWorkoutAsync(int traineeId, int workoutId)
        {
            await CanAccessWorkout(traineeId);
            await _workoutRepository.DeleteWorkoutAsync(workoutId);
        }

        public async Task CanAccessWorkout(int? traineeId, int? trainerId = null)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // If the current user is a trainer, verify they are connected to the trainee
            if (currentUser.Role == Role.Trainer)
            {
                if (trainerId != null && traineeId == null)
                {
                    // Verify that the trainer is accessing their own workouts only
                    if (trainerId != currentUser.Id)
                    {
                        throw new ForbiddenAccessException();
                    }
                    return;
                }

                if (traineeId == null)
                {
                    throw new ValidationException("Trainee must be provided");
                }

                var client = await _clientRepository.GetByIdAsync((int)traineeId) ?? throw new ValidationException("Trainee must be provided");
                if (client.TrainerId != currentUser.Id)
                {
                    throw new ForbiddenAccessException();
                }
            }

            // Only allow clients to see their own workouts
            if (currentUser.Role == Role.Client && currentUser.Id != traineeId)
            {
                throw new ForbiddenAccessException();
            }

            // Allow admins to see all workouts
        }
    }
}