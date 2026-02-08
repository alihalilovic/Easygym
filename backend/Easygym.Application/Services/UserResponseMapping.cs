using Easygym.Domain.Entities;
using Easygym.Domain.Models.Responses;

namespace Easygym.Application.Services
{
    public static class UserResponseMapping
    {
        public static UserResponse ToResponse(this User user, int? trainerId = null)
        {
            return new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                ProfilePictureUrl = user.ProfilePictureUrl,
                TrainerId = trainerId
            };
        }
    }
}
