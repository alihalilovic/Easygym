using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Requests;
using Easygym.Domain.Models.Responses;

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

        public async Task<List<ExerciseResponse>> GetExercisesAsync()
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var exercises = await _exerciseRepository.GetExercisesForUserAsync(currentUser.Id);
            return exercises.Select(MapToResponse).ToList();
        }

        public async Task<ExerciseResponse> GetExerciseAsync(int exerciseId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var exercise = await _exerciseRepository.GetExerciseAsync(exerciseId)
                ?? throw new ExerciseNotFoundException();

            ValidateExerciseAccess(currentUser, exercise);
            return MapToResponse(exercise);
        }

        public async Task<ExerciseResponse> CreateExerciseAsync(CreateExerciseRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            if (currentUser.Role == Role.Client && request.IsPublic)
                throw new ValidationException("Clients cannot toggle public status for exercises");

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
            return MapToResponse(exercise);
        }

        public async Task<ExerciseResponse> UpdateExerciseAsync(int exerciseId, UpdateExerciseRequest request)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var exercise = await _exerciseRepository.GetExerciseAsync(exerciseId)
                ?? throw new ExerciseNotFoundException();

            ValidateExerciseAccess(currentUser, exercise);
            var updated = await _exerciseRepository.UpdateExerciseAsync(exerciseId, request);
            return MapToResponse(updated);
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

        private static ExerciseResponse MapToResponse(Exercise e) => new()
        {
            Id = e.Id,
            Name = e.Name,
            Description = e.Description,
            MuscleGroup = e.MuscleGroup,
            Instructions = e.Instructions,
            CreatedById = e.CreatedById,
            CreatedAt = e.CreatedAt,
            IsPublic = e.IsPublic
        };

        private static void ValidateExerciseAccess(UserResponse currentUser, Exercise exercise)
        {
            if (exercise.CreatedById == currentUser.Id)
                return;

            if (currentUser.Role == Role.Client)
            {
                if (currentUser.TrainerId != null &&
                    exercise.CreatedById == currentUser.TrainerId &&
                    exercise.IsPublic)
                {
                    return;
                }
                throw new ForbiddenAccessException();
            }

            if (currentUser.Role == Role.Trainer)
                throw new ForbiddenAccessException();
        }
    }
}
