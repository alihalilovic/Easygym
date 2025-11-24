using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Entities
{
    public class Set
    {
        public int Id { get; set; }
        public required int ExerciseId { get; set; }
        public Exercise? Exercise { get; set; }
        public required int Repetitions { get; set; }
        public int? Weight { get; set; }
    }
}