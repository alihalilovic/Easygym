using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Models.Requests;
using Easygym.Domain.Constants;
namespace Easygym.Application.Services
{
    public class WorkoutSessionService
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

        public async Task<IEnumerable<WorkoutSession>> GetWorkoutSessionsForTraineeAsync(int traineeId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            // Only allow trainees to see their own workout sessions
            if (currentUser.Id != traineeId && currentUser.Role == Role.Client)
            {
                throw new ForbiddenAccessException();
            }

            return (await _workoutSessionRepository.GetAllAsync()).Where(w => w.TraineeId == traineeId);
        }

        public async Task<WorkoutSession> GetWorkoutSessionAsync(int workoutSessionId)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var workoutSession = await _workoutSessionRepository.GetByIdAsync(workoutSessionId) ?? throw new WorkoutSessionNotFoundException();

            ValidateWorkoutSessionAccess(currentUser, workoutSession);

            return workoutSession;
        }

        public async Task<WorkoutSession> CreateWorkoutSessionAsync(WorkoutSession workoutSession)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();

            ValidateWorkoutSessionAccess(currentUser, workoutSession);

            return await _workoutSessionRepository.AddAsync(workoutSession);
        }

        public async Task UpdateWorkoutSessionAsync(UpdateWorkoutSessionRequest workoutSession)
        {
            var currentUser = await _currentUserService.GetCurrentUserAsync();
            var existingWorkoutSession = await _workoutSessionRepository.GetByIdAsync(workoutSession.Id) ?? throw new WorkoutSessionNotFoundException();

            ValidateWorkoutSessionAccess(currentUser, existingWorkoutSession);

            if (workoutSession.PerceivedDifficulty != null)
            {
                existingWorkoutSession.PerceivedDifficulty = workoutSession.PerceivedDifficulty;
            }

            if (workoutSession.Notes != null)
            {
                existingWorkoutSession.Notes = workoutSession.Notes;
            }

            await _workoutSessionRepository.UpdateAsync(existingWorkoutSession);
        }

        public async Task DeleteWorkoutSessionAsync(int workoutSessionId)
        {
            // GetWorkoutSessionAsync already validates access
            var workoutSession = await GetWorkoutSessionAsync(workoutSessionId);

            await _workoutSessionRepository.DeleteAsync(workoutSession);
        }

        private static void ValidateWorkoutSessionAccess(User currentUser, WorkoutSession workoutSession)
        {
            // Clients can only access their own workout sessions
            if (currentUser.Role == Role.Client && workoutSession.TraineeId != currentUser.Id)
            {
                throw new ForbiddenAccessException();
            }

            // Trainers and admins can't access or create workout sessions
            if (Role.Admin == currentUser.Role || Role.Trainer == currentUser.Role)
            {
                throw new ForbiddenAccessException();
            }
        }
    }
}