using System.ComponentModel.DataAnnotations;

namespace Easygym.Api.Models.Requests
{
    public class RegisterRequest
    {
        [StringLength(100, MinimumLength = 2)]
        public string? Name { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public required string Email { get; set; }

        [Required]
        [MinLength(8)]
        [StringLength(200)]
        public required string Password { get; set; }

        [Required]
        [StringLength(20)]
        public required string Role { get; set; }
    }
}
