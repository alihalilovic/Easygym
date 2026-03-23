using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Entities
{
    public class WorkoutSession
    {
        public int Id { get; set; }

        [Range(1, int.MaxValue)]
        public required int WorkoutId { get; set; }
        public Workout? Workout { get; set; }

        [Range(1, int.MaxValue)]
        public required int TraineeId { get; set; }
        public User? Trainee { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        [Range(1, 10)]
        public int? PerceivedDifficulty { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }
    }
}
