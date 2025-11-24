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
            return await _context.Exercises
                .Where(e => e.CreatedById == userId || e.IsPublic)
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
            var exercise = await GetExerciseAsync(exerciseId);

            if (exercise == null)
            {
                throw new ExerciseNotFoundException();
            }

            if (request.Name != null)
            {
                exercise.Name = request.Name;
            }

            if (request.Description != null)
            {
                exercise.Description = request.Description;
            }

            if (request.Category != null)
            {
                exercise.Category = request.Category;
            }

            if (request.MuscleGroup != null)
            {
                exercise.MuscleGroup = request.MuscleGroup;
            }

            if (request.Instructions != null)
            {
                exercise.Instructions = request.Instructions;
            }

            _context.Exercises.Update(exercise);
            await _context.SaveChangesAsync();

            return exercise;
        }

        public async Task DeleteExerciseAsync(int exerciseId)
        {
            var exercise = await GetExerciseAsync(exerciseId);

            if (exercise == null)
            {
                throw new ExerciseNotFoundException();
            }

            _context.Exercises.Remove(exercise);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsExerciseInUseAsync(int exerciseId)
        {
            return await _context.Sets.AnyAsync(s => s.ExerciseId == exerciseId);
        }
    }
}
