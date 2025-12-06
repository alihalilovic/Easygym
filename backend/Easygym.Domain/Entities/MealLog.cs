namespace Easygym.Domain.Entities
{
    public class MealLog
    {
        public int Id { get; set; }

        public required int ClientId { get; set; }
        public User? Client { get; set; }

        public required int DietPlanAssignmentId { get; set; }
        public DietPlanAssignment? DietPlanAssignment { get; set; }

        public required int MealId { get; set; }
        public Meal? Meal { get; set; }

        // Date without time component (e.g., 2025-11-30)
        public required DateOnly LogDate { get; set; }

        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

        // Optional media URL for accountability (image or video)
        public string? MediaUrl { get; set; }

        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
    }
}
