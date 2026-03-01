namespace Easygym.Domain.Models.Responses
{
    public class WorkoutSessionResponse
    {
        public int Id { get; set; }
        public int WorkoutId { get; set; }
        public WorkoutResponse? Workout { get; set; }
        public int TraineeId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int? PerceivedDifficulty { get; set; }
        public string? Notes { get; set; }
    }
}
