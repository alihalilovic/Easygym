using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class CreateDietPlanRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public required string Name { get; set; }

        [Required]
        [MinLength(7)]
        [MaxLength(7)]
        public required List<DietPlanDayDto> Days { get; set; }
    }
}
