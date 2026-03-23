using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class MealDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public required string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 1)]
        public required string MealType { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}
