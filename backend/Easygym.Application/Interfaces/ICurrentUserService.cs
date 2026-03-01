using Easygym.Domain.Models.Responses;

namespace Easygym.Application.Interfaces
{
    public interface ICurrentUserService
    {
        Task<UserResponse> GetCurrentUserAsync();
    }
}