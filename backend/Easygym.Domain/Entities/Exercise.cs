using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Entities
{
    public class Exercise
    {
        public int Id { get; set; }
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
        public required int CreatedById { get; set; }
        public User? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsPublic { get; set; } = false;
    }
}
