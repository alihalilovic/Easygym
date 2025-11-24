using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Requests;
using Easygym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Easygym.Infrastructure.Repositories
{
    public class WorkoutRepository : IWorkoutRepository
    {
        private readonly EasygymDbContext _context;

        public WorkoutRepository(EasygymDbContext context)
        {
            _context = context;
        }

        public async Task<List<Workout>> GetWorkoutsForTraineeAsync(int traineeId)
        {
            return await _context.Workouts
            .Include(w => w.Sets)
                .ThenInclude(s => s.Exercise)
            .Include(w => w.Trainer)
            .Where(w => w.TraineeId == traineeId)
            .ToListAsync();
        }

        public async Task<Workout> GetWorkoutForTraineeAsync(int workoutId, int traineeId)
        {
            return await _context.Workouts
            .Include(w => w.Sets)
                .ThenInclude(s => s.Exercise)
            .Include(w => w.Trainer)
            .FirstOrDefaultAsync(w => w.Id == workoutId && w.TraineeId == traineeId) ?? throw new WorkoutNotFoundException();
        }

        public async Task<Workout> GetWorkoutAsync(int workoutId)
        {
            return await _context.Workouts
            .Include(w => w.Sets)
                .ThenInclude(s => s.Exercise)
            .Include(w => w.Trainer)
            .FirstOrDefaultAsync(w => w.Id == workoutId) ?? throw new WorkoutNotFoundException();
        }

        public async Task AddWorkoutAsync(Workout workout)
        {
            await _context.Workouts.AddAsync(workout);
            await _context.SaveChangesAsync();
        }

        public async Task<Workout> UpdateWorkoutAsync(int workoutId, UpdateWorkoutRequest workout)
        {
            var existingWorkout = await GetWorkoutAsync(workoutId);

            if (workout.Name != null)
            {
                existingWorkout.Name = workout.Name;
            }

            if (workout.Description != null)
            {
                existingWorkout.Description = workout.Description;
            }

            if (workout.Sets != null)
            {
                foreach (var set in existingWorkout.Sets)
                {
                    _context.Sets.Remove(set);
                }

                foreach (var setDto in workout.Sets)
                {
                    var newSet = new Set
                    {
                        ExerciseId = setDto.ExerciseId,
                        Repetitions = setDto.Repetitions,
                        Weight = setDto.Weight
                    };
                    existingWorkout.Sets.Add(newSet);
                }
            }

            if (workout.RestTimeSeconds != null)
            {
                existingWorkout.RestTimeSeconds = workout.RestTimeSeconds.Value;
            }

            _context.Workouts.Update(existingWorkout);
            await _context.SaveChangesAsync();

            return existingWorkout;
        }

        public async Task DeleteWorkoutAsync(int workoutId)
        {
            var workout = await GetWorkoutAsync(workoutId);

            // Remove all sets associated with the workout
            if (workout.Sets.Count != 0)
            {
                _context.Sets.RemoveRange(workout.Sets);
            }

            _context.Workouts.Remove(workout);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Workout>> GetWorkoutsByTrainerAsync(int trainerId)
        {
            return await _context.Workouts
                .Include(w => w.Sets)
                    .ThenInclude(s => s.Exercise)
                .Include(w => w.Trainee)
                .Where(w => w.TrainerId == trainerId)
                .ToListAsync();
        }

    }
}