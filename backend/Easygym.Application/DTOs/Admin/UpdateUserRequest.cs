using System.ComponentModel.DataAnnotations;

namespace Easygym.Application.DTOs.Admin;

public class UpdateUserRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; }=string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; }=string.Empty;
}
