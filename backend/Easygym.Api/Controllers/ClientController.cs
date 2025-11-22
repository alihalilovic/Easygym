using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Easygym.Api.Controllers
{
    public class ClientController : Controller
    {
        private readonly ClientService _clientService;

        public ClientController(ClientService clientService)
        {
            _clientService = clientService;
        }

        [Authorize(Roles = Role.Client)]
        [HttpGet("me/trainer")]
        public async Task<IActionResult> GetMyTrainer()
        {
            var trainer = await _clientService.GetMyTrainerAsync();
            return Ok(trainer);
        }

        [Authorize(Roles = Role.Client)]
        [HttpDelete("me/trainer")]
        public async Task<IActionResult> RemoveMyTrainer()
        {
            await _clientService.RemoveMyTrainerAsync();
            return NoContent();
        }

        [Authorize(Roles = Role.Client)]
        [HttpGet("me/trainer/history")]
        public async Task<IActionResult> GetMyTrainerHistory()
        {
            var history = await _clientService.GetMyTrainerHistoryAsync();
            return Ok(history);
        }
    }
}
