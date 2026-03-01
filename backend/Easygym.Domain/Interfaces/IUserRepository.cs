using Easygym.Domain.Entities;

namespace Easygym.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task<User> AddUserAsync(User user);

        Task UpdateUserAsync(User user);
    }
}