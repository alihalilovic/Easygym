using Easygym.Domain.Entities;

namespace Easygym.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task<User> AddUserAsync(User user);

        Task<IEnumerable<User>> GetUsersByRoleAsync(string role);
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(int id);
        Task<bool> DeleteByIdAsync(int id);
        Task UpdateAsync(User user);
        Task<bool> DeletePermanentAsync(int id);
    }
}
