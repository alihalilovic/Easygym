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
    }
}
