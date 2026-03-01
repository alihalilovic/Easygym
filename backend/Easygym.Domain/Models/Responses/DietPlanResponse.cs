namespace Easygym.Domain.Models.Responses
{
    public class DietPlanResponse
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public int TrainerId { get; set; }
        public List<DietPlanDayResponse> Days { get; set; } = [];
        public List<DietPlanAssignmentResponse> Assignments { get; set; } = [];
        public DateTime CreatedAt { get; set; }
    }
}
