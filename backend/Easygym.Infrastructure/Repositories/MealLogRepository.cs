using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Easygym.Infrastructure.Repositories
{
    public class MealLogRepository : IMealLogRepository
    {
        private readonly EasygymDbContext _context;

        public MealLogRepository(EasygymDbContext context)
        {
            _context = context;
        }

        public async Task<MealLog> LogMealAsync(int clientId, int mealId, int assignmentId, DateOnly logDate, string? mediaUrl = null)
        {
            // Check if already logged and not deleted
            var existingLog = await _context.MealLogs
                .FirstOrDefaultAsync(ml =>
                    ml.ClientId == clientId &&
                    ml.MealId == mealId &&
                    ml.LogDate == logDate);

            if (existingLog != null)
            {
                // If previously deleted, restore it
                if (existingLog.IsDeleted)
                {
                    existingLog.IsDeleted = false;
                    existingLog.DeletedAt = null;
                    existingLog.CompletedAt = DateTime.UtcNow;
                    existingLog.MediaUrl = mediaUrl;
                    await _context.SaveChangesAsync();
                    return existingLog;
                }

                throw new MealAlreadyLoggedException();
            }

            var mealLog = new MealLog
            {
                ClientId = clientId,
                MealId = mealId,
                DietPlanAssignmentId = assignmentId,
                LogDate = logDate,
                MediaUrl = mediaUrl
            };

            await _context.MealLogs.AddAsync(mealLog);
            await _context.SaveChangesAsync();

            return mealLog;
        }

        public async Task UnlogMealAsync(int clientId, int mealId, DateOnly logDate)
        {
            var mealLog = await _context.MealLogs
                .FirstOrDefaultAsync(ml =>
                    ml.ClientId == clientId &&
                    ml.MealId == mealId &&
                    ml.LogDate == logDate &&
                    !ml.IsDeleted);

            if (mealLog == null)
            {
                throw new MealLogNotFoundException();
            }

            mealLog.IsDeleted = true;
            mealLog.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task<List<MealLog>> GetMealLogsForDateAsync(int clientId, DateOnly date)
        {
            return await _context.MealLogs
                .Include(ml => ml.Meal)
                .Where(ml => ml.ClientId == clientId && ml.LogDate == date && !ml.IsDeleted)
                .ToListAsync();
        }

        public async Task<MealLog?> UpdateMediaUrlAsync(int clientId, int mealId, DateOnly logDate, string? mediaUrl)
        {
            var mealLog = await _context.MealLogs
                .FirstOrDefaultAsync(ml =>
                    ml.ClientId == clientId &&
                    ml.MealId == mealId &&
                    ml.LogDate == logDate &&
                    !ml.IsDeleted);

            if (mealLog == null)
            {
                return null;
            }

            mealLog.MediaUrl = mediaUrl;
            await _context.SaveChangesAsync();

            return mealLog;
        }
    }
}
