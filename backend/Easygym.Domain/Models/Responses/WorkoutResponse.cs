namespace Easygym.Domain.Models.Responses
{
    public class WorkoutResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int TraineeId { get; set; }
        public int? TrainerId { get; set; }
        public List<SetResponse> Sets { get; set; } = [];
        public int RestTimeSeconds { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
