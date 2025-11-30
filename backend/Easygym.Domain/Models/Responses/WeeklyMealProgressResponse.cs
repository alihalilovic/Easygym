namespace Easygym.Domain.Models.Responses
{
    public class WeeklyMealProgressResponse
    {
        public int ClientId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public List<DailyMealProgressResponse> DailyProgress { get; set; } = [];
        public double OverallAdherencePercentage { get; set; }
    }
}
