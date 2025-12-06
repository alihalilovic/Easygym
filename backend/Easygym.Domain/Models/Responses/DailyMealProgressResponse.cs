namespace Easygym.Domain.Models.Responses
{
    public class DailyMealProgressResponse
    {
        public DateOnly Date { get; set; }
        public int TotalMeals { get; set; }
        public int CompletedMeals { get; set; }
        public double AdherencePercentage { get; set; }
        public List<MealProgressItem> Meals { get; set; } = [];
    }

    public class MealProgressItem
    {
        public int MealId { get; set; }
        public string MealName { get; set; } = string.Empty;
        public string MealType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? MediaUrl { get; set; }
    }
}
