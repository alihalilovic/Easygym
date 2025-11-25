namespace Easygym.Domain.Entities
{
    public class DietPlanAssignment
    {
        public int Id { get; set; }
        public required int DietPlanId { get; set; }
        public DietPlan? DietPlan { get; set; }
        public required int ClientId { get; set; }
        public User? Client { get; set; }
        public bool IsActive { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.Now;
    }
}
