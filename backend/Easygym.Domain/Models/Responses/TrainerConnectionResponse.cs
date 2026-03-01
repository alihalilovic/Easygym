using System.Text.Json.Serialization;

namespace Easygym.Domain.Models.Responses
{
    public class TrainerConnectionResponse
    {
        public UserResponse Trainer { get; set; } = null!;

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public DateTime? InvitationAcceptedAt { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public DateTime? ConnectionEndedAt { get; set; }
    }
}
