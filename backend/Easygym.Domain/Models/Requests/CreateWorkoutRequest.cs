using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class CreateWorkoutRequest
    {
        [Range(1, int.MaxValue)]
        public required int TraineeId { get; set; }

        [StringLength(50, MinimumLength = 1)]
        public string? Name { get; set; }

        [StringLength(50, MinimumLength = 1)]
        public string? Description { get; set; }

        [Required]
        [MinLength(1)]
        public required List<SetDto> Sets { get; set; }

        [Range(0, 600)] // 10 minutes
        public int RestTimeSeconds { get; set; }
    }
}
