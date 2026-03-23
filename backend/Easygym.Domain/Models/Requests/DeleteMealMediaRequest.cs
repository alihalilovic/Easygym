using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class DeleteMealMediaRequest
    {
        [Range(1, int.MaxValue)]
        public required int MealId { get; set; }

        [Required]
        public required DateOnly LogDate { get; set; }

        [Url]
        [StringLength(2048)]
        public string? MediaUrl { get; set; }
    }
}
