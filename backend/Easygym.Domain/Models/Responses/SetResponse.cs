namespace Easygym.Domain.Models.Responses
{
    public class SetResponse
    {
        public int Id { get; set; }
        public int ExerciseId { get; set; }
        public ExerciseSummaryResponse? Exercise { get; set; }
        public int Repetitions { get; set; }
        public int? Weight { get; set; }
    }
}
