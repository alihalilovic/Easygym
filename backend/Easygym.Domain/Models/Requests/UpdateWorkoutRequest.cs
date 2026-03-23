using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class UpdateWorkoutRequest
    {
        public int TraineeId { get; set; }

        [StringLength(50, MinimumLength = 1)]
        public string? Name { get; set; }

        [StringLength(50, MinimumLength = 1)]
        public string? Description { get; set; }

        [MinLength(1)]
        public List<SetDto>? Sets { get; set; }

        [Range(0, 600)]
        public int? RestTimeSeconds { get; set; }
    }
}
