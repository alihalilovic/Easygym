using Easygym.Domain.Entities;

namespace Easygym.Domain.Models.Responses
{
    public class InvitationResponse
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public UserResponse? Client { get; set; }
        public int TrainerId { get; set; }
        public UserResponse? Trainer { get; set; }
        public int InitiatorId { get; set; }
        public InvitationStatus? Status { get; set; }
        public string? Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }
}
