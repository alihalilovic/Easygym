using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class DeleteMealMediaRequest
    {
        [Required]
        public required int MealId { get; set; }

        [Required]
        public required DateOnly LogDate { get; set; }

        public string? MediaUrl { get; set; }
    }
}
