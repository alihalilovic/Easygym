using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Application.DTOs.Admin;
using Easygym.Application.DTOs.Common;
namespace Easygym.Application.Services
{
    public class AdminService
    {
        private readonly IUserRepository _userRepository;
        private readonly IWorkoutRepository _workoutRepository;
        private readonly IExerciseRepository _exerciseRepository;
        public AdminService(
            IUserRepository userRepository,
            IWorkoutRepository workoutRepository,
            IExerciseRepository exercisesRepository)
        {
            _userRepository = userRepository;
            _workoutRepository = workoutRepository;
            _exerciseRepository=exercisesRepository;
        }
        public async Task<IEnumerable<User>> GetClientsAsync()
        {
            return await _userRepository.GetUsersByRoleAsync(Role.Client);
        }

        public async Task<IEnumerable<User>> GetTrainersAsync()
        {
            return await _userRepository.GetUsersByRoleAsync(Role.Trainer);
        }
        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null || user.Role == Role.Admin)
                return false;

            return await _userRepository.DeleteByIdAsync(userId);
        }
        public async Task<bool> UpdateUserAsync(int id, UpdateUserRequest request)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null || user.Role == Role.Admin)
                return false;

            user.Name = request.Name;
            user.Email = request.Email;

            await _userRepository.UpdateAsync(user);

            return true;
        }
        public async Task<PagedResponse<WorkoutAdminDTO>> 
        GetAllWorkoutsAsync(int page, int pageSize, string? search)
        {
            var (items, totalCount) =
                await _workoutRepository.GetPagedAsync(page, pageSize, search);

            var mapped = items.Select(w => new WorkoutAdminDTO
            {
                Id = w.Id,
                Name = w.Name,
                TrainerName = w.Trainer.Name,
                ClientName = w.Trainee.Name,
                CreatedAt = w.CreatedAt
            }).ToList();

            return new PagedResponse<WorkoutAdminDTO>
            {
                Items = mapped,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
        public async Task<PagedResponse<ExerciseAdminDto>>
            GetAllExercisesAsync(int page, int pageSize, string? search)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;

            var (items, totalCount) =
                await _exerciseRepository.GetPagedAsync(page, pageSize, search);

            var mapped = items.Select(e => new ExerciseAdminDto
            {
                Id = e.Id,
                Name = e.Name,
                CreatedBy = e.CreatedBy!.Name,
                CreatedAt = e.CreatedAt
            }).ToList();

            return new PagedResponse<ExerciseAdminDto>
            {
                Items = mapped,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
