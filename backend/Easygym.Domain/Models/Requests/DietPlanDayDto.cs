using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class DietPlanDayDto
    {
        [Range(0, 6)] // 0 = Monday, 6 = Sunday
        public required int DayOfWeek { get; set; }
        [MinLength(1)]
        [MaxLength(10)]
        public required List<MealDto> Meals { get; set; }
    }
}
