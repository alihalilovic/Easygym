using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
    public class WorkoutSessionQueryParams
    {
        [Range(1, int.MaxValue)]
        public int PageNumber { get; set; } = 1;

        [Range(1, 100)]
        public int PageSize { get; set; } = 10;

        public string? SearchTerm { get; set; }

        public int? WorkoutId { get; set; }
        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }
        public DateTime? EndDateFrom { get; set; }
        public DateTime? EndDateTo { get; set; }
        public int? MinPerceivedDifficulty { get; set; }
        public int? MaxPerceivedDifficulty { get; set; }

        public string SortBy { get; set; } = "StartTime";
        public string SortOrder { get; set; } = "desc"; // asc or desc
    }
}
