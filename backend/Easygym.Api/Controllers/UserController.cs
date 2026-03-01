using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Easygym.Api.Controllers
{
    public class UserController : Controller
    {
        private readonly UserService _userService;
        private readonly IGenericRepository<User> _userRepository;

        public UserController(UserService userService, IGenericRepository<User> userRepository)
        {
            _userService = userService;
            _userRepository = userRepository;
        }

        [Authorize(Roles = Role.Admin)]
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userService.GetUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userService.GetUserAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [Authorize(Roles = Role.Admin)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return NotFound();
            await _userRepository.DeleteAsync(user);
            return NoContent();
        }
    }
}