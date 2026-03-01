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

namespace Easygym.Api.Controllers
{
    public class WorkoutSessionController : Controller
    {
        private readonly WorkoutSessionService _workoutSessionService;

        public WorkoutSessionController(WorkoutSessionService workoutSessionService)
        {
            _workoutSessionService = workoutSessionService;
        }

        [HttpGet("trainee/{traineeId}")]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetWorkoutSessionsForTrainee(int traineeId)
        {
            var workoutSessions = await _workoutSessionService.GetWorkoutSessionsForTraineeAsync(traineeId);
            return Ok(workoutSessions);
        }

        [HttpGet("trainee/{traineeId}/paged")]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetPagedWorkoutSessionsForTrainee(
            int traineeId,
            [FromQuery] WorkoutSessionQueryParams queryParams)
        {
            var pagedSessions = await _workoutSessionService.GetPagedWorkoutSessionsForTraineeAsync(traineeId, queryParams);
            return Ok(pagedSessions);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetWorkoutSession(int id)
        {
            var workoutSession = await _workoutSessionService.GetWorkoutSessionAsync(id);
            return Ok(workoutSession);
        }

        [HttpPost]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> CreateWorkoutSession([FromBody] WorkoutSession workoutSession)
        {
            var result = await _workoutSessionService.CreateWorkoutSessionAsync(workoutSession);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> UpdateWorkoutSession(int id, [FromBody] UpdateWorkoutSessionRequest workoutSession)
        {
            await _workoutSessionService.UpdateWorkoutSessionAsync(workoutSession);
            return Ok();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> DeleteWorkoutSession(int id)
        {
            await _workoutSessionService.DeleteWorkoutSessionAsync(id);
            return Ok();
        }
    }

}