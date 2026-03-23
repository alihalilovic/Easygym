using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class SetDto
    {
        [Range(1, int.MaxValue)]
        public required int ExerciseId { get; set; }

        [Range(1, 1000)]
        public required int Repetitions { get; set; }

        [Range(0, 2000)]
        public int? Weight { get; set; }
    }
}
