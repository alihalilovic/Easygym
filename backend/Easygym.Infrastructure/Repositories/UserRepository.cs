using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Easygym.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly EasygymDbContext _context;

        public UserRepository(EasygymDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> AddUserAsync(User user)
        {
            var task = await _context.AddAsync(user);
            await _context.SaveChangesAsync();

            return task.Entity;
        }

        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }
}