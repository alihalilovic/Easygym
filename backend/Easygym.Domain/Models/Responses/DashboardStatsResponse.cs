using Easygym.Domain.Models.Responses;

namespace Easygym.Domain.Models.Responses
{
    public class DashboardStatsResponse
    {
        public int TotalWorkouts { get; set; }
        public double AverageWeightLifted { get; set; }
        public int StreakDays { get; set; }
        public List<ChartDataPoint> ProgressChart { get; set; } = new();
        public List<WorkoutSessionResponse> UpcomingSessions { get; set; } = new();
        public List<WorkoutSessionResponse> RecentActivities { get; set; } = new();
    }

    public class ChartDataPoint
    {
        public string Date { get; set; } = string.Empty;
        public double Value { get; set; }
    }
}
