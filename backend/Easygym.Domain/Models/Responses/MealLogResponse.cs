namespace Easygym.Domain.Models.Responses
{
    public class MealLogResponse
    {
        public int Id { get; set; }
        public int MealId { get; set; }
        public string MealName { get; set; } = string.Empty;
        public DateOnly LogDate { get; set; }
        public DateTime CompletedAt { get; set; }
        public bool IsCompleted { get; set; } // true if not deleted
        public string? MediaUrl { get; set; }
    }
}
