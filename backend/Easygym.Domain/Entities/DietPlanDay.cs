using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Entities
{
    public class DietPlanDay
    {
        public int Id { get; set; }
        [Range(0, 6)] // 0 = Monday, 6 = Sunday
        public required int DayOfWeek { get; set; }
        public required List<Meal> Meals { get; set; }
    }
}
