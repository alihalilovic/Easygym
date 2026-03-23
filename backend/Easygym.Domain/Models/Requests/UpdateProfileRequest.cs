using System.ComponentModel.DataAnnotations;

namespace Easygym.Api.Models.Requests
{
    public class UpdateProfileRequest : IValidatableObject
    {
            [StringLength(100, MinimumLength = 2)]
            public string? Name { get; set; }

            [MinLength(8)]
            [StringLength(200)]
            public string? Password { get; set; }

            [StringLength(200)]
            public string? ConfirmPassword { get; set; }

            public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
            {
                if (string.IsNullOrWhiteSpace(Name) && string.IsNullOrWhiteSpace(Password))
                {
                    yield return new ValidationResult(
                        "At least one field must be provided for update.",
                        [nameof(Name), nameof(Password)]);
                }

                if (!string.IsNullOrWhiteSpace(Password) && Password != ConfirmPassword)
                {
                    yield return new ValidationResult(
                        "Password and confirm password must match.",
                        [nameof(Password), nameof(ConfirmPassword)]);
                }
            }
    }
}
