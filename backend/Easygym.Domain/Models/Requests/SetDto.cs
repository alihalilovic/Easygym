using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class SetDto
    {
        public required int ExerciseId { get; set; }
        public required int Repetitions { get; set; }
        public int? Weight { get; set; }
    }
}
