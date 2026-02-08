namespace Easygym.Domain.Models.Responses
{
    public class UserResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public int? TrainerId { get; set; }
    }
}
