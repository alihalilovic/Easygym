namespace Easygym.Domain.Entities
{
    public class Client
    {
        public int Id { get; set; }
        public int? TrainerId { get; set; }
        public Trainer? Trainer { get; set; }
        public DateTime InvitationAcceptedAt { get; set; }
    }
}