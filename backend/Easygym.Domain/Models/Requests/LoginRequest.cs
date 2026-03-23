using System.ComponentModel.DataAnnotations;

namespace Easygym.Api.Models.Requests
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        [StringLength(255)]
        public required string Email { get; set; }

        [Required]
        [MinLength(1)]
        [StringLength(200)]
        public required string Password { get; set; }
    }
}
