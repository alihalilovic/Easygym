using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class UpdateWorkoutSessionRequest
    {
        [Range(1, int.MaxValue)]
        public int Id { get; set; }

        public int TraineeId { get; set; }

        [Range(1, 10)]
        public int? PerceivedDifficulty { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }
    }
}
