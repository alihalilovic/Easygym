using System.ComponentModel.DataAnnotations;

namespace Easygym.Application.DTOs.Admin;

public class UpdateUserRequest
{
    [Required]
    public string Name { get; set; }=string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; }=string.Empty;
}