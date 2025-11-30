using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Easygym.Domain.Models.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Easygym.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MealLogController : ControllerBase
    {
        private readonly MealLogService _mealLogService;

        public MealLogController(MealLogService mealLogService)
        {
            _mealLogService = mealLogService;
        }

        // Log a meal for the current client
        [HttpPost]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> LogMeal([FromBody] LogMealRequest request)
        {
            var result = await _mealLogService.LogMealAsync(request);
            return Ok(result);
        }

        // Unlog a meal (uncheck)
        [HttpDelete]
        [Authorize(Roles = Role.Client)]
        public async Task<IActionResult> UnlogMeal([FromBody] UnlogMealRequest request)
        {
            await _mealLogService.UnlogMealAsync(request);
            return Ok();
        }

        // Get daily progress for a specific date
        // Clients: get their own progress
        // Trainers: must specify clientId query param
        [HttpGet("daily")]
        [Authorize(Roles = Role.ClientAndTrainer)]
        public async Task<IActionResult> GetDailyProgress([FromQuery] DateOnly date, [FromQuery] int? clientId = null)
        {
            var progress = await _mealLogService.GetDailyProgressAsync(date, clientId);
            return Ok(progress);
        }

        // Get weekly progress starting from a specific date
        [HttpGet("weekly")]
        [Authorize(Roles = Role.ClientAndTrainer)]
        public async Task<IActionResult> GetWeeklyProgress([FromQuery] DateOnly startDate, [FromQuery] int? clientId = null)
        {
            var progress = await _mealLogService.GetWeeklyProgressAsync(startDate, clientId);
            return Ok(progress);
        }
    }
}
