namespace Easygym.Domain.Models.Requests
{
    public class AssignDietPlanRequest
    {
        public required int DietPlanId { get; set; }
        public required List<int> ClientIds { get; set; }
        public bool IsActive { get; set; }
    }
}
