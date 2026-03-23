using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Easygym.Application.DTOs.Admin;
using System.ComponentModel.DataAnnotations;

namespace Easygym.Api.Controllers
{
    [Route("api/admin")]
    [Authorize(Roles = Role.Admin)]
    public class AdminController : ApiControllerBase
    {
        private readonly AdminService _adminService;

        public AdminController(AdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("clients")]
        public async Task<IActionResult> GetClients()
        {
            return Ok(await _adminService.GetClientsAsync());
        }

        [HttpGet("trainers")]
        public async Task<IActionResult> GetTrainers()
        {
            return Ok(await _adminService.GetTrainersAsync());
        }

        [HttpGet("deleted-users")]
        public async Task<IActionResult> GetDeletedUsers()
        {
            var users = await _adminService.GetDeletedUsersAsync();
            return Ok(users);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser([Range(1, int.MaxValue)] int id)
        {
            var result = await _adminService.DeleteUserAsync(id);

            if (!result)
                return NotFound("User not found");

            return NoContent();
        }

        [HttpPost("users/{id}/restore")]
        public async Task<IActionResult> RestoreUser([Range(1, int.MaxValue)] int id)
        {
            var result = await _adminService.RestoreUserAsync(id);

            if (!result)
                return NotFound("User not found");

            return Ok();
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser([Range(1, int.MaxValue)] int id, [FromBody] UpdateUserRequest request)
        {
            var result = await _adminService.UpdateUserAsync(id, request);

            if (!result)
                return NotFound("User not found");

            return NoContent();
        }

        [HttpGet("workouts")]
        public async Task<IActionResult> GetAllWorkouts(
            [FromQuery][Range(1, int.MaxValue)] int page = 1,
            [FromQuery][Range(1, 100)] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            var result = await _adminService
                .GetAllWorkoutsAsync(page, pageSize, search);

            return Ok(result);
        }

        [HttpGet("exercises")]
        public async Task<IActionResult> GetAllExercises(
            [FromQuery][Range(1, int.MaxValue)] int page = 1,
            [FromQuery][Range(1, 100)] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            var result = await _adminService
                .GetAllExercisesAsync(page, pageSize, search);

            return Ok(result);
        }

        [HttpGet("dietplans")]
        public async Task<IActionResult> GetDietPlans(
            [FromQuery][Range(1, int.MaxValue)] int page = 1,
            [FromQuery][Range(1, 100)] int pageSize = 5,
            [FromQuery] string? search = null)
        {
            var result = await _adminService.GetAllDietPlansAsync(page, pageSize, search);
            return Ok(result);
        }

        [HttpDelete("dietplans/{id}")]
        public async Task<IActionResult> DeleteDietPlan([Range(1, int.MaxValue)] int id)
        {
            var result = await _adminService.DeleteDietPlanAsync(id);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("users/{id}/permanent")]
        public async Task<IActionResult> PermanentDeleteUser([Range(1, int.MaxValue)] int id)
        {
            var result = await _adminService.PermanentlyDeleteUserAsync(id);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPost("backup")]
        public IActionResult BackupDatabase()
        {
            var result = _adminService.BackupDatabase();

            if (!result)
                return BadRequest();

            return Ok("Backup created");
        }

        [HttpPost("restore")]
        public IActionResult RestoreDatabase([FromQuery][Required][MinLength(1)] string file)
        {
            var result = _adminService.RestoreDatabase(file);

            if (!result)
                return NotFound();

            return Ok("Database restored");
        }

        [HttpGet("backups")]
        public IActionResult GetBackups()
        {
            var backups = _adminService.GetBackups();
            return Ok(backups);
        }
    }
}
