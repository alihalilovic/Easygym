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
        private readonly IDietPlanRepository _dietPlanRepository;
        private readonly ITrainerRepository _trainerRepository;
        private readonly IGenericRepository<Client> _clientRepository;

        public AdminService(
            IUserRepository userRepository,
            IWorkoutRepository workoutRepository,
            IExerciseRepository exercisesRepository,
            IDietPlanRepository dietPlanRepository,
            ITrainerRepository trainerRepository,
             IGenericRepository<Client> clientRepository)
        {
            _userRepository = userRepository;
            _workoutRepository = workoutRepository;
            _exerciseRepository = exercisesRepository;
            _dietPlanRepository = dietPlanRepository;
            _trainerRepository=trainerRepository;
            _clientRepository=clientRepository;
        }

        public async Task<IEnumerable<User>> GetClientsAsync()
        {
            var users = await _userRepository.GetUsersByRoleAsync(Role.Client);
            return users.Where(u => !u.IsDeleted);
        }

        public async Task<IEnumerable<User>> GetTrainersAsync()
        {
            var users = await _userRepository.GetUsersByRoleAsync(Role.Trainer);
            return users.Where(u => !u.IsDeleted);
        }

        public async Task<IEnumerable<User>> GetDeletedUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Where(u => u.IsDeleted);
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null || user.Role == Role.Admin)
                return false;

            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            return true;
        }

        public async Task<bool> RestoreUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null)
                return false;

            user.IsDeleted = false;
            user.DeletedAt = null;

            await _userRepository.UpdateAsync(user);

            return true;
        }

       public async Task<bool> PermanentlyDeleteUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null || user.Role == Role.Admin)
                return false;

            if (user.Role == Role.Client)
            {
                var client = await _clientRepository.GetByIdAsync(id);
                if (client != null)
                {
                    await _clientRepository.DeleteAsync(client);
                }
            }

            if (user.Role == Role.Trainer)
            {
                var trainer = await _trainerRepository.GetByIdAsync(id);
                if (trainer != null)
                {
                    await _trainerRepository.DeleteAsync(trainer);
                }
            }

            await _userRepository.DeletePermanentAsync(id);

            return true;
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

        public async Task<PagedResponse<DietPlanAdminDTO>>
        GetAllDietPlansAsync(int page, int pageSize, string? search)
        {
            var (items, totalCount) =
                await _dietPlanRepository.GetPagedAsync(page, pageSize, search);

            var mapped = items.Select(d => new DietPlanAdminDTO
            {
                Id = d.Id,
                Name = d.Name,
                TrainerName = d.Trainer!.Name,
                ClientName = d.Assignments.FirstOrDefault()?.Client?.Name ?? "-",
                CreatedAt = d.CreatedAt
            }).ToList();

            return new PagedResponse<DietPlanAdminDTO>
            {
                Items = mapped,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<bool> DeleteDietPlanAsync(int id)
        {
            await _dietPlanRepository.DeleteDietPlanAsync(id);
            return true;
        }

       public bool BackupDatabase()
        {
            var backendPath = Directory.GetCurrentDirectory();

            var projectRoot = Directory.GetParent(backendPath)!.Parent!.FullName;

            var dbPath = Path.Combine(backendPath, "easygym.db");

            var backupFolder = Path.Combine(projectRoot, "db-backups");

            if (!Directory.Exists(backupFolder))
                Directory.CreateDirectory(backupFolder);

            var backupFile = $"easygym.db.bak.{DateTime.UtcNow:yyyyMMdd_HHmmss}";

            var backupPath = Path.Combine(backupFolder, backupFile);

            File.Copy(dbPath, backupPath, true);

            return true;
        }

       public bool RestoreDatabase(string fileName)
        {
            var backendPath = Directory.GetCurrentDirectory();

            var projectRoot = Directory.GetParent(backendPath)!.Parent!.FullName;

            var dbPath = Path.Combine(backendPath, "easygym.db");

            var backupFolder = Path.Combine(projectRoot, "db-backups");

            if (string.IsNullOrWhiteSpace(fileName) ||
                fileName.Contains("..", StringComparison.Ordinal) ||
                fileName.Contains("/", StringComparison.Ordinal) ||
                fileName.Contains("\\", StringComparison.Ordinal))
            {
                return false;
            }

            var backupFolderFullPath = Path.GetFullPath(backupFolder);
            var backupPath = Path.GetFullPath(Path.Combine(backupFolderFullPath, fileName));

            var backupFolderPrefix = backupFolderFullPath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                + Path.DirectorySeparatorChar;

            if (!backupPath.StartsWith(backupFolderPrefix, StringComparison.OrdinalIgnoreCase))
                return false;

            if (!File.Exists(backupPath))
                return false;

            File.Copy(backupPath, dbPath, true);

            return true;
        }
        public List<string> GetBackups()
        {
            var projectRoot = Directory.GetParent(Directory.GetCurrentDirectory())!.Parent!.FullName;

            var backupFolder = Path.Combine(projectRoot, "db-backups");

            if (!Directory.Exists(backupFolder))
                return new List<string>();

            var files = Directory.GetFiles(backupFolder)
                .Select(Path.GetFileName)
                .ToList();

            return files;
        }
    }
}
