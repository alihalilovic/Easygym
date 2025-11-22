using Easygym.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Easygym.Api.Controllers
{
    public class InteractionController : Controller
    {
        private readonly InteractionService _interactionService;

        public InteractionController(InteractionService interactionService)
        {
            _interactionService = interactionService;
        }

        [HttpGet("trainer/{trainerId}/clients")]
        public async Task<IActionResult> GetClientsForTrainer(int trainerId)
        {
            var clients = await _interactionService.GetClientsForTrainerAsync(trainerId);
            return Ok(clients);
        }
    }
}