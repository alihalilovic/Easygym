using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Easygym.Domain.Models.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Easygym.Api.Controllers
{
    public class ExerciseController : Controller
    {
        private readonly ExerciseService _exerciseService;

        public ExerciseController(ExerciseService exerciseService)
        {
            _exerciseService = exerciseService;
        }

        [HttpGet]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetExercises()
        {
            var exercises = await _exerciseService.GetExercisesAsync();
            return Ok(exercises);
        }

        [HttpGet("{exerciseId}")]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetExercise(int exerciseId)
        {
            var exercise = await _exerciseService.GetExerciseAsync(exerciseId);
            return Ok(exercise);
        }

        [HttpPost]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> CreateExercise([FromBody] CreateExerciseRequest request)
        {
            var exercise = await _exerciseService.CreateExerciseAsync(request);
            return Ok(exercise);
        }

        [HttpPut("{exerciseId}")]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> UpdateExercise(int exerciseId, [FromBody] UpdateExerciseRequest request)
        {
            var exercise = await _exerciseService.UpdateExerciseAsync(exerciseId, request);
            return Ok(exercise);
        }

        [HttpDelete("{exerciseId}")]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> DeleteExercise(int exerciseId)
        {
            await _exerciseService.DeleteExerciseAsync(exerciseId);
            return Ok();
        }
    }
}
