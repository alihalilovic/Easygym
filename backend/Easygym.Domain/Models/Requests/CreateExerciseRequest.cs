using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class CreateExerciseRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public required string Name { get; set; }
        [StringLength(1000)]
        public string? Description { get; set; }
        [StringLength(50)]
        public string? Category { get; set; }
        [StringLength(50)]
        public string? MuscleGroup { get; set; }
        [StringLength(2000)]
        public string? Instructions { get; set; }
    }
}
