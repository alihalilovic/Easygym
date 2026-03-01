using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Easygym.Application.DTOs.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = Role.Admin)]
public class AdminController : ControllerBase
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
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var result = await _adminService.DeleteUserAsync(id);

        if (!result)
            return NotFound("User not found");

        return NoContent();
    }
    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        var result = await _adminService.UpdateUserAsync(id, request);

        if (!result)
            return NotFound("User not found");

        return NoContent();
    }
}


