namespace Easygym.Domain.Entities
{
    public class TrainerClientHistory
    {
        public int Id { get; set; }
        public int TrainerId { get; set; }
        public int ClientId { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public User? Trainer { get; set; }
        public User? Client { get; set; }
    }
}
