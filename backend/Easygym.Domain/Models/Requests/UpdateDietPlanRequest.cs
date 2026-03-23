using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class UpdateDietPlanRequest
    {
        [StringLength(100, MinimumLength = 1)]
        public string? Name { get; set; }

        [MinLength(7)]
        [MaxLength(7)]
        public List<DietPlanDayDto>? Days { get; set; }
    }
}
