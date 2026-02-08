namespace Easygym.Domain.Models.Responses
{
    public class ExerciseSummaryResponse
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? MuscleGroup { get; set; }
    }
}
