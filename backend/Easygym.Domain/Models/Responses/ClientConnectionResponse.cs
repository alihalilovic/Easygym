using System.Text.Json.Serialization;
using Easygym.Domain.Entities;

namespace Easygym.Domain.Models.Responses
{
    public class ClientConnectionResponse
    {
        public User Client { get; set; } = null!;

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public DateTime? InvitationAcceptedAt { get; set; }
    }
}
