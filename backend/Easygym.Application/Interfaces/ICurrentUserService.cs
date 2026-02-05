using Easygym.Domain.Entities;

namespace Easygym.Application.Interfaces
{
    public interface ICurrentUserService
    {
        Task<User> GetCurrentUserAsync();
    }
}