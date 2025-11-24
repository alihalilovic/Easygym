using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Requests;
using Easygym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Easygym.Infrastructure.Repositories
{
    public class ExerciseRepository : IExerciseRepository
    {
        private readonly EasygymDbContext _context;

        public ExerciseRepository(EasygymDbContext context)
        {
            _context = context;
        }

        public async Task<List<Exercise>> GetExercisesForUserAsync(int userId)
        {
            // Get the user to check their role
            var user = await _context.Users
                .Include(u => u.Client)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return [];
            }

            // Base query: user's own exercises
            var query = _context.Exercises.Where(e => e.CreatedById == userId);

            // If user is a client with a trainer, also show trainer's public exercises
            if (user.Client?.TrainerId != null)
            {
                var trainerId = user.Client.TrainerId.Value;
                query = query.Union(
                    _context.Exercises.Where(e => e.CreatedById == trainerId && e.IsPublic)
                );
            }

            return await query
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<Exercise?> GetExerciseAsync(int exerciseId)
        {
            return await _context.Exercises
                .FirstOrDefaultAsync(e => e.Id == exerciseId);
        }

        public async Task AddExerciseAsync(Exercise exercise)
        {
            await _context.Exercises.AddAsync(exercise);
            await _context.SaveChangesAsync();
        }

        public async Task<Exercise> UpdateExerciseAsync(int exerciseId, UpdateExerciseRequest request)
        {
            var exercise = await GetExerciseAsync(exerciseId) ?? throw new ExerciseNotFoundException();
            if (request.Name != null)
            {
                exercise.Name = request.Name;
            }

            if (request.Description != null)
            {
                exercise.Description = request.Description;
            }

            if (request.MuscleGroup != null)
            {
                exercise.MuscleGroup = request.MuscleGroup;
            }

            if (request.Instructions != null)
            {
                exercise.Instructions = request.Instructions;
            }

            if (request.IsPublic.HasValue)
            {
                exercise.IsPublic = request.IsPublic.Value;
            }

            _context.Exercises.Update(exercise);
            await _context.SaveChangesAsync();

            return exercise;
        }

        public async Task DeleteExerciseAsync(int exerciseId)
        {
            var exercise = await GetExerciseAsync(exerciseId) ?? throw new ExerciseNotFoundException();
            _context.Exercises.Remove(exercise);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsExerciseInUseAsync(int exerciseId)
        {
            return await _context.Sets.AnyAsync(s => s.ExerciseId == exerciseId);
        }
    }
}
