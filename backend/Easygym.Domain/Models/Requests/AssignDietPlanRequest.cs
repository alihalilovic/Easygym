using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class AssignDietPlanRequest
    {
        [Range(1, int.MaxValue)]
        public required int DietPlanId { get; set; }

        [Required]
        [MinLength(1)]
        public required List<int> ClientIds { get; set; }

        public bool IsActive { get; set; }
    }
}
