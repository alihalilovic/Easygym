using Easygym.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace Easygym.Domain.Models.Requests
{
  public class ResolveInvitationRequest
  {
    [EnumDataType(typeof(InvitationStatus))]
    public required InvitationStatus Status { get; set; }
  }
}
