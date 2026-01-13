namespace Easygym.Api.Models.Requests
{
    public class UpdateProfileRequest
    {
            public string? Name { get; set; }
            public string? Password { get; set; }
            public string? ConfirmPassword { get; set; }
    }
}