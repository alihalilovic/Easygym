namespace Easygym.Domain.Models.Responses
{
    public class DietPlanAssignmentResponse
    {
        public int Id { get; set; }
        public int DietPlanId { get; set; }
        public int ClientId { get; set; }
        public bool IsActive { get; set; }
        public DateTime AssignedAt { get; set; }
    }
}
