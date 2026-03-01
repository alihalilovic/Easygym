using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Application.DTOs.Admin;

namespace Easygym.Application.Services
{
    public class AdminService
    {
        private readonly IUserRepository _userRepository;

        public AdminService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<User>> GetClientsAsync()
        {
            return await _userRepository.GetUsersByRoleAsync(Role.Client);
        }

        public async Task<IEnumerable<User>> GetTrainersAsync()
        {
            return await _userRepository.GetUsersByRoleAsync(Role.Trainer);
        }
        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null || user.Role == Role.Admin)
                return false;

            return await _userRepository.DeleteByIdAsync(userId);
        }
        public async Task<bool> UpdateUserAsync(int id, UpdateUserRequest request)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null || user.Role == Role.Admin)
                return false;

            user.Name = request.Name;
            user.Email = request.Email;

            await _userRepository.UpdateAsync(user);

            return true;
        }
    }
}
