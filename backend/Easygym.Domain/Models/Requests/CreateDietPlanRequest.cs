using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class CreateDietPlanRequest
    {
        [StringLength(100)]
        public required string Name { get; set; }
        [MinLength(7)]
        [MaxLength(7)]
        public required List<DietPlanDayDto> Days { get; set; }
    }
}
