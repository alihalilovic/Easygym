using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Entities
{
    public class Set
    {
        public int Id { get; set; }
        [StringLength(50, MinimumLength = 1)]
        public required string Name { get; set; }
        [StringLength(500)]
        public string? Description { get; set; }
        public required int Repetitions { get; set; }
        public int? Weight { get; set; }
    }
}