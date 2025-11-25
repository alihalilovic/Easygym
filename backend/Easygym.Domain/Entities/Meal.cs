using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Entities
{
    public class Meal
    {
        public int Id { get; set; }
        [StringLength(100)]
        public required string Name { get; set; }
        [StringLength(500)]
        public string? Description { get; set; }
        [StringLength(50)]
        public required string MealType { get; set; }
        [StringLength(500)]
        public string? Notes { get; set; }
    }
}
