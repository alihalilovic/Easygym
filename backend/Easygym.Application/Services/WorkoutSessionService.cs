using Easygym.Application.Interfaces;
using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Common;
using Easygym.Domain.Models.Requests;
using Easygym.Domain.Models.Responses;

namespace Easygym.Application.Services
{
    public class WorkoutSessionService : IWorkoutSessionService
    {
        private readonly IWorkoutSessionRepository _workoutSessionRepository;
        private readonly IWorkoutRepository _workoutRepository;
        private readonly CurrentUserService _currentUserService;

        public WorkoutSessionService(IWorkoutSessionRepository workoutSessionRepository, IWorkoutRepository workoutRepository, CurrentUserService currentUserService)
        {
            _workoutSessionRepository = workoutSessionRepository;
            _workoutRepository = workoutRepository;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<WorkoutSessionResponse>> GetWorkoutSessionsForTraineeAsync(int traineeId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            if (currentUser.Id != traineeId && currentUser.Role == Role.Client)
                throw new ForbiddenAccessException();

            var sessions = (await _workoutSessionRepository.GetAllAsync()).Where(w => w.TraineeId == traineeId);
            return sessions.Select(MapToResponse);
        }

        public async Task<PagedResult<WorkoutSessionResponse>> GetPagedWorkoutSessionsForTraineeAsync(int traineeId, WorkoutSessionQueryParams queryParams)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            if (currentUser.Id != traineeId && currentUser.Role == Role.Client)
                throw new ForbiddenAccessException();

            var paged = await _workoutSessionRepository.GetPagedAsync(traineeId, queryParams);
            return new PagedResult<WorkoutSessionResponse>
            {
                Items = paged.Items.Select(MapToResponse),
                TotalCount = paged.TotalCount,
                PageNumber = paged.PageNumber,
                PageSize = paged.PageSize
            };
        }

        public async Task<WorkoutSessionResponse> GetWorkoutSessionAsync(int workoutSessionId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var workoutSession = await _workoutSessionRepository.GetByIdAsync(workoutSessionId)
                ?? throw new WorkoutSessionNotFoundException();

            ValidateWorkoutSessionAccess(currentUser, workoutSession);
            return MapToResponse(workoutSession);
        }

        public async Task<WorkoutSessionResponse> CreateWorkoutSessionAsync(WorkoutSession workoutSession)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            ValidateWorkoutSessionAccess(currentUser, workoutSession);

            var added = await _workoutSessionRepository.AddAsync(workoutSession);
            return MapToResponse(added);
        }

        public async Task UpdateWorkoutSessionAsync(UpdateWorkoutSessionRequest workoutSession)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var existing = await _workoutSessionRepository.GetByIdAsync(workoutSession.Id)
                ?? throw new WorkoutSessionNotFoundException();

            ValidateWorkoutSessionAccess(currentUser, existing);

            if (workoutSession.PerceivedDifficulty != null)
                existing.PerceivedDifficulty = workoutSession.PerceivedDifficulty;
            if (workoutSession.Notes != null)
                existing.Notes = workoutSession.Notes;

            await _workoutSessionRepository.UpdateAsync(existing);
        }

        public async Task DeleteWorkoutSessionAsync(int workoutSessionId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var workoutSession = await _workoutSessionRepository.GetByIdAsync(workoutSessionId)
                ?? throw new WorkoutSessionNotFoundException();

            ValidateWorkoutSessionAccess(currentUser, workoutSession);
            await _workoutSessionRepository.DeleteAsync(workoutSession);
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

        private static void ValidateWorkoutSessionAccess(UserResponse currentUser, WorkoutSession workoutSession)
        {
            if (currentUser.Role == Role.Client && workoutSession.TraineeId != currentUser.Id)
                throw new ForbiddenAccessException();
            if (Role.Admin == currentUser.Role || Role.Trainer == currentUser.Role)
                throw new ForbiddenAccessException();
        }
    }
}