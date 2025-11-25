using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Entities
{
    public class DietPlan
    {
        public int Id { get; set; }
        [StringLength(100)]
        public required string Name { get; set; }
        public required int TrainerId { get; set; }
        public User? Trainer { get; set; }
        public required List<DietPlanDay> Days { get; set; }
        public List<DietPlanAssignment> Assignments { get; set; } = [];
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
