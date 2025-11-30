using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class LogMealRequest
    {
        [Required]
        public required int MealId { get; set; }

        [Required]
        public required DateOnly LogDate { get; set; }
    }
}
