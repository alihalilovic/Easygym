namespace Easygym.Domain.Models.Requests
{
    public class UpdateWorkoutRequest
    {
        public int TraineeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<SetDto>? Sets { get; set; }
        public int? RestTimeSeconds { get; set; }
    }
}