using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Easygym.Domain.Models.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Easygym.Api.Controllers
{
    public class DietPlanController : Controller
    {
        private readonly DietPlanService _dietPlanService;

        public DietPlanController(DietPlanService dietPlanService)
        {
            _dietPlanService = dietPlanService;
        }

        [HttpGet]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetDietPlans()
        {
            var dietPlans = await _dietPlanService.GetDietPlansAsync();
            return Ok(dietPlans);
        }

        [HttpGet("{dietPlanId}")]
        [Authorize(Roles = Role.All)]
        public async Task<IActionResult> GetDietPlan(int dietPlanId)
        {
            var dietPlan = await _dietPlanService.GetDietPlanAsync(dietPlanId);
            return Ok(dietPlan);
        }

        [HttpPost]
        [Authorize(Roles = Role.Trainer)]
        public async Task<IActionResult> CreateDietPlan([FromBody] CreateDietPlanRequest dietPlan)
        {
            var newDietPlan = await _dietPlanService.CreateDietPlanAsync(dietPlan);
            return Ok(newDietPlan);
        }

        [HttpPut("{dietPlanId}")]
        [Authorize(Roles = Role.Trainer)]
        public async Task<IActionResult> UpdateDietPlan(int dietPlanId, [FromBody] UpdateDietPlanRequest dietPlan)
        {
            var updatedDietPlan = await _dietPlanService.UpdateDietPlanAsync(dietPlanId, dietPlan);
            return Ok(updatedDietPlan);
        }

        [HttpDelete("{dietPlanId}")]
        [Authorize(Roles = Role.Trainer)]
        public async Task<IActionResult> DeleteDietPlan(int dietPlanId)
        {
            await _dietPlanService.DeleteDietPlanAsync(dietPlanId);
            return Ok();
        }

        // Assignment endpoints
        [HttpPost("assign")]
        [Authorize(Roles = Role.Trainer)]
        public async Task<IActionResult> AssignDietPlanToClients([FromBody] AssignDietPlanRequest request)
        {
            await _dietPlanService.AssignDietPlanToClientsAsync(request);
            return Ok();
        }

        [HttpDelete("{dietPlanId}/unassign/{clientId}")]
        [Authorize(Roles = Role.Trainer)]
        public async Task<IActionResult> UnassignDietPlanFromClient(int dietPlanId, int clientId)
        {
            await _dietPlanService.UnassignDietPlanFromClientAsync(dietPlanId, clientId);
            return Ok();
        }

        [HttpPut("{dietPlanId}/assignment/{clientId}/active")]
        [Authorize(Roles = Role.Trainer)]
        public async Task<IActionResult> UpdateAssignmentActiveStatus(int dietPlanId, int clientId, [FromBody] bool isActive)
        {
            await _dietPlanService.UpdateAssignmentActiveStatusAsync(dietPlanId, clientId, isActive);
            return Ok();
        }
    }
}
