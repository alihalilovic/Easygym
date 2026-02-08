namespace Easygym.Domain.Models.Responses
{
    public class ExerciseResponse
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? MuscleGroup { get; set; }
        public string? Instructions { get; set; }
        public int CreatedById { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsPublic { get; set; }
    }
}
