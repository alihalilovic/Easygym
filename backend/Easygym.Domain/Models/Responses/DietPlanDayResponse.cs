namespace Easygym.Domain.Models.Responses
{
    public class DietPlanDayResponse
    {
        public int Id { get; set; }
        public int DayOfWeek { get; set; }
        public List<MealResponse> Meals { get; set; } = [];
    }
}
