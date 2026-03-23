using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Models.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Easygym.Api.Controllers
{
    [Route("api/[controller]")]
    public class WorkoutSessionController : ApiControllerBase
    {
        private readonly WorkoutSessionService _workoutSessionService;

        public WorkoutSessionController(WorkoutSessionService workoutSessionService)
        {
            _workoutSessionService = workoutSessionService;
        }

        [HttpGet("trainee/{traineeId}")]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetWorkoutSessionsForTrainee([Range(1, int.MaxValue)] int traineeId)
        {
            var workoutSessions = await _workoutSessionService.GetWorkoutSessionsForTraineeAsync(traineeId);
            return Ok(workoutSessions);
        }

        [HttpGet("trainee/{traineeId}/paged")]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetPagedWorkoutSessionsForTrainee(
            [Range(1, int.MaxValue)] int traineeId,
            [FromQuery] WorkoutSessionQueryParams queryParams)
        {
            var pagedSessions = await _workoutSessionService.GetPagedWorkoutSessionsForTraineeAsync(traineeId, queryParams);
            return Ok(pagedSessions);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetWorkoutSession([Range(1, int.MaxValue)] int id)
        {
            var workoutSession = await _workoutSessionService.GetWorkoutSessionAsync(id);
            return Ok(workoutSession);
        }

        [HttpPost]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> CreateWorkoutSession([FromBody] WorkoutSession workoutSession)
        {
            if (workoutSession.EndTime <= workoutSession.StartTime)
            {
                ModelState.AddModelError(nameof(workoutSession.EndTime), "EndTime must be later than StartTime.");
                return ValidationProblem(ModelState);
            }

            var result = await _workoutSessionService.CreateWorkoutSessionAsync(workoutSession);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> UpdateWorkoutSession([Range(1, int.MaxValue)] int id, [FromBody] UpdateWorkoutSessionRequest workoutSession)
        {
            workoutSession.Id = id;
            await _workoutSessionService.UpdateWorkoutSessionAsync(workoutSession);
            return Ok();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> DeleteWorkoutSession([Range(1, int.MaxValue)] int id)
        {
            await _workoutSessionService.DeleteWorkoutSessionAsync(id);
            return Ok();
        }
    }

}
