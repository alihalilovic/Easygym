using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class UpdateDietPlanRequest
    {
        public string? Name { get; set; }
        [MinLength(7)]
        [MaxLength(7)]
        public List<DietPlanDayDto>? Days { get; set; }
    }
}
