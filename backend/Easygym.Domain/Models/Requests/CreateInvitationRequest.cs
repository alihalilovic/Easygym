using System.ComponentModel.DataAnnotations;

namespace Easygym.Api.Models.Requests
{
  public class CreateInvitationRequest : IValidatableObject
  {
    [EmailAddress]
    [StringLength(255)]
    public string? ClientEmail { get; set; }

    [EmailAddress]
    [StringLength(255)]
    public string? TrainerEmail { get; set; }

    [StringLength(500)]
    public string? Message { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
      if (string.IsNullOrWhiteSpace(ClientEmail) && string.IsNullOrWhiteSpace(TrainerEmail))
      {
        yield return new ValidationResult(
          "Either client email or trainer email must be provided.",
          [nameof(ClientEmail), nameof(TrainerEmail)]);
      }
    }
  }
}
