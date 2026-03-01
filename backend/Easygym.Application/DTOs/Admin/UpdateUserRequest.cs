using System.ComponentModel.DataAnnotations;

namespace Easygym.Application.DTOs.Admin;

public class UpdateUserRequest
{
    [Required]
    public string Name { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }
}