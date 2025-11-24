using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Requests;

namespace Easygym.Application.Services
{
    public class ExerciseService
    {
        private readonly IExerciseRepository _exerciseRepository;
        private readonly CurrentUserService _currentUserService;

        public ExerciseService(IExerciseRepository exerciseRepository, CurrentUserService currentUserService)
        {
            _exerciseRepository = exerciseRepository;
            _currentUserService = currentUserService;
        }

        public async Task<List<Exercise>> GetExercisesAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            return await _exerciseRepository.GetExercisesForUserAsync(currentUser.Id);
        }

        public async Task<Exercise> GetExerciseAsync(int exerciseId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var exercise = await _exerciseRepository.GetExerciseAsync(exerciseId);

            if (exercise == null)
            {
                throw new ExerciseNotFoundException();
            }

            ValidateExerciseAccess(currentUser, exercise);

            return exercise;
        }

        public async Task<Exercise> CreateExerciseAsync(CreateExerciseRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            // Don't allow toggling public status for clients
            if (currentUser.Role == Role.Client && request.IsPublic)
            {
                throw new ValidationException("Clients cannot toggle public status for exercises");
            }

            var exercise = new Exercise
            {
                Name = request.Name,
                Description = request.Description,
                MuscleGroup = request.MuscleGroup,
                Instructions = request.Instructions,
                CreatedById = currentUser.Id,
                IsPublic = request.IsPublic
            };

            await _exerciseRepository.AddExerciseAsync(exercise);
            return exercise;
        }

        public async Task<Exercise> UpdateExerciseAsync(int exerciseId, UpdateExerciseRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var exercise = await _exerciseRepository.GetExerciseAsync(exerciseId);

            if (exercise == null)
            {
                throw new ExerciseNotFoundException();
            }

            ValidateExerciseAccess(currentUser, exercise);

            return await _exerciseRepository.UpdateExerciseAsync(exerciseId, request);
        }

        public async Task DeleteExerciseAsync(int exerciseId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var exercise = await _exerciseRepository.GetExerciseAsync(exerciseId);

            if (exercise == null)
            {
                throw new ExerciseNotFoundException();
            }

            ValidateExerciseAccess(currentUser, exercise);

            // Check if the exercise is in use
            var isInUse = await _exerciseRepository.IsExerciseInUseAsync(exerciseId);
            if (isInUse)
            {
                throw new ExerciseInUseException();
            }

            await _exerciseRepository.DeleteExerciseAsync(exerciseId);
        }

        private static void ValidateExerciseAccess(User currentUser, Exercise exercise)
        {
            // Users can always access their own exercises
            if (exercise.CreatedById == currentUser.Id)
            {
                return;
            }

            // If exercise is not owned by user, check if they have access
            if (currentUser.Role == Role.Client)
            {
                if (currentUser.Client?.TrainerId != null &&
                    exercise.CreatedById == currentUser.Client.TrainerId &&
                    exercise.IsPublic)
                {
                    return;
                }
                throw new ForbiddenAccessException();
            }

            if (currentUser.Role == Role.Trainer)
            {
                // Trainers can only access their own exercises
                throw new ForbiddenAccessException();
            }
        }
    }
}
