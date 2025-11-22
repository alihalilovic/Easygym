using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Common;
using Easygym.Domain.Models.Requests;
using Easygym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Easygym.Infrastructure.Repositories
{
    public class WorkoutSessionRepository : GenericRepository<WorkoutSession>, IWorkoutSessionRepository
    {
        private readonly EasygymDbContext _context;

        public WorkoutSessionRepository(EasygymDbContext context) : base(context)
        {
            _context = context;
        }

        public new async Task<IEnumerable<WorkoutSession>> GetAllAsync()
        {
            return await _context.WorkoutSessions
                .Include(ws => ws.Workout!)
                    .ThenInclude(w => w.Sets)
                .ToListAsync();
        }

        public new async Task<WorkoutSession?> GetByIdAsync(int id)
        {
            return await _context.WorkoutSessions
                .Include(ws => ws.Workout!)
                    .ThenInclude(w => w.Sets)
                .FirstOrDefaultAsync(ws => ws.Id == id);
        }

        public async Task<PagedResult<WorkoutSession>> GetPagedAsync(int traineeId, WorkoutSessionQueryParams queryParams)
        {
            var query = _context.WorkoutSessions
                .Include(ws => ws.Workout!)
                    .ThenInclude(w => w.Sets)
                .Where(ws => ws.TraineeId == traineeId)
                .AsQueryable();

            // Apply filters
            if (queryParams.WorkoutId.HasValue)
            {
                query = query.Where(ws => ws.WorkoutId == queryParams.WorkoutId.Value);
            }

            if (queryParams.StartDateFrom.HasValue)
            {
                query = query.Where(ws => ws.StartTime >= queryParams.StartDateFrom.Value);
            }

            if (queryParams.StartDateTo.HasValue)
            {
                query = query.Where(ws => ws.StartTime <= queryParams.StartDateTo.Value);
            }

            if (queryParams.EndDateFrom.HasValue)
            {
                query = query.Where(ws => ws.EndTime >= queryParams.EndDateFrom.Value);
            }

            if (queryParams.EndDateTo.HasValue)
            {
                query = query.Where(ws => ws.EndTime <= queryParams.EndDateTo.Value);
            }

            if (queryParams.MinPerceivedDifficulty.HasValue)
            {
                query = query.Where(ws => ws.PerceivedDifficulty >= queryParams.MinPerceivedDifficulty.Value);
            }

            if (queryParams.MaxPerceivedDifficulty.HasValue)
            {
                query = query.Where(ws => ws.PerceivedDifficulty <= queryParams.MaxPerceivedDifficulty.Value);
            }

            // Apply search (search in workout name and notes)
            if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
            {
                var searchTerm = queryParams.SearchTerm.ToLower();
                query = query.Where(ws =>
                    (ws.Workout != null && ws.Workout.Name != null && ws.Workout.Name.ToLower().Contains(searchTerm)) ||
                    (ws.Notes != null && ws.Notes.ToLower().Contains(searchTerm))
                );
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = queryParams.SortBy.ToLower() switch
            {
                "starttime" => queryParams.SortOrder.ToLower() == "asc"
                    ? query.OrderBy(ws => ws.StartTime)
                    : query.OrderByDescending(ws => ws.StartTime),
                "endtime" => queryParams.SortOrder.ToLower() == "asc"
                    ? query.OrderBy(ws => ws.EndTime)
                    : query.OrderByDescending(ws => ws.EndTime),
                "perceiveddifficulty" => queryParams.SortOrder.ToLower() == "asc"
                    ? query.OrderBy(ws => ws.PerceivedDifficulty)
                    : query.OrderByDescending(ws => ws.PerceivedDifficulty),
                _ => queryParams.SortOrder.ToLower() == "asc"
                    ? query.OrderBy(ws => ws.StartTime)
                    : query.OrderByDescending(ws => ws.StartTime)
            };

            // Apply pagination
            var items = await query
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .ToListAsync();

            return new PagedResult<WorkoutSession>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = queryParams.PageNumber,
                PageSize = queryParams.PageSize
            };
        }
    }
}