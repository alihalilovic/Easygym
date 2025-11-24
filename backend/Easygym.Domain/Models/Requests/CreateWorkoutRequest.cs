using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class CreateWorkoutRequest
    {
        public required int TraineeId { get; set; }
        [StringLength(50)]
        public string? Name { get; set; }
        [StringLength(50)]
        public string? Description { get; set; }
        public required List<SetDto> Sets { get; set; }
        [Range(0, 600)] // 10 minutes
        public int RestTimeSeconds { get; set; }
    }
}
