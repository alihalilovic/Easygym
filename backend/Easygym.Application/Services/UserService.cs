using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Responses;

namespace Easygym.Application.Services
{
    public class UserService
    {
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<Client> _clientRepository;

        public UserService(IGenericRepository<User> userRepository, IGenericRepository<Client> clientRepository)
        {
            _userRepository = userRepository;
            _clientRepository = clientRepository;
        }

        public async Task<IEnumerable<UserResponse>> GetUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            var userList = users.ToList();
            var clientIds = userList.Where(u => u.Role == Easygym.Domain.Constants.Role.Client).Select(u => u.Id).ToList();
            var clients = clientIds.Count > 0
                ? (await _clientRepository.GetAllAsync()).Where(c => clientIds.Contains(c.Id)).ToDictionary(c => c.Id)
                : new Dictionary<int, Client>();

            return userList.Select(u => u.ToResponse(clients.GetValueOrDefault(u.Id)?.TrainerId));
        }

        public async Task<UserResponse?> GetUserAsync(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return null;

            Client? client = null;
            if (user.Role == Easygym.Domain.Constants.Role.Client)
                client = await _clientRepository.GetByIdAsync(user.Id);

            return user.ToResponse(client?.TrainerId);
        }
    }
}
