using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Models.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Easygym.Api.Controllers
{
    public class WorkoutController : Controller
    {
        private readonly WorkoutService _workoutService;

        public WorkoutController(WorkoutService workoutService)
        {
            _workoutService = workoutService;
        }

        [HttpGet]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetWorkouts()
        {
            var workouts = await _workoutService.GetWorkoutsAsync();
            return Ok(workouts);
        }

        [HttpGet("{workoutId}")]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetWorkout(int workoutId)
        {
            var workout = await _workoutService.GetWorkoutAsync(workoutId);
            return Ok(workout);
        }

        [HttpPost]
        [Authorize(Roles = $"{Role.Client}, {Role.Trainer}")]
        public async Task<IActionResult> CreateWorkout([FromBody] CreateWorkoutRequest workout)
        {
            var newWorkout = await _workoutService.CreateWorkoutAsync(workout);
            return Ok(newWorkout);
        }

        [HttpPut("{workoutId}")]
        [Authorize(Roles = $"{Role.Client}, {Role.Trainer}")]
        public async Task<IActionResult> UpdateWorkout(int workoutId, [FromBody] UpdateWorkoutRequest workout)
        {
            var updatedWorkout = await _workoutService.UpdateWorkoutAsync(workoutId, workout);
            return Ok(updatedWorkout);
        }

        [HttpDelete("{workoutId}")]
        [Authorize(Roles = $"{Role.Client}, {Role.Trainer}")]
        public async Task<IActionResult> DeleteWorkout(int workoutId)
        {
            await _workoutService.DeleteWorkoutAsync(workoutId);
            return Ok();
        }
    }

}