using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Easygym.Api.Controllers
{
    public class TrainerController : Controller
    {
        private readonly TrainerService _trainerService;

        public TrainerController(TrainerService trainerService)
        {
            _trainerService = trainerService;
        }

        [Authorize(Roles = Role.Trainer)]
        [HttpGet("me/clients")]
        public async Task<IActionResult> GetMyClients()
        {
            var clients = await _trainerService.GetMyClientsAsync();
            return Ok(clients);
        }

        [Authorize(Roles = Role.Trainer)]
        [HttpDelete("me/clients/{clientId}")]
        public async Task<IActionResult> RemoveClient(int clientId)
        {
            await _trainerService.RemoveClientAsync(clientId);
            return NoContent();
        }

        [Authorize(Roles = Role.Trainer)]
        [HttpGet("me/clients/history")]
        public async Task<IActionResult> GetMyClientHistory()
        {
            var history = await _trainerService.GetMyClientHistoryAsync();
            return Ok(history);
        }
    }
}
