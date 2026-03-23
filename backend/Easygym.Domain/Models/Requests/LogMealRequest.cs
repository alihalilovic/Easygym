using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class LogMealRequest
    {
        [Range(1, int.MaxValue)]
        public required int MealId { get; set; }

        [Required]
        public required DateOnly LogDate { get; set; }
    }
}
