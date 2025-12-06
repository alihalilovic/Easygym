using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Easygym.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        [StringLength(50, MinimumLength = 1)]
        public string? Name { get; set; }
        [EmailAddress]
        public required string Email { get; set; }
        [MinLength(8)]
        [JsonIgnore]
        public string Password { get; set; } = string.Empty;
        public required string Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string? ProfilePictureUrl { get; set; }

        // Navigation properties
        public Client? Client { get; set; }
        public Trainer? Trainer { get; set; }

        // Parameterless constructor for deserialization
        public User() { }

        // Constructor for creating a new user with password
        public User(string? name, string email, string password, string role)
        {
            Name = name;
            Email = email;
            Password = password;
            Role = role;
        }
    }
}