using Easygym.Application.Interfaces;
using Easygym.Domain.Entities;
using Easygym.Domain.Exceptions;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Responses;
using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Easygym.Application.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<Client> _clientRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(
            IGenericRepository<User> userRepository,
            IGenericRepository<Client> clientRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _clientRepository = clientRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<UserResponse> GetCurrentUserAsync()
        {
            var userId = GetCurrentUserId();
            var user = await _userRepository.GetByIdAsync(userId) ?? throw new UserNotFoundException();

            int? trainerId = null;
            if (user.Role == Easygym.Domain.Constants.Role.Client)
            {
                var client = await _clientRepository.GetByIdAsync(user.Id);
                trainerId = client?.TrainerId;
            }

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

        public async Task<User> GetCurrentUserEntityAsync()
        {
            var userId = GetCurrentUserId();

            var user = await _userRepository.GetByIdAsync(userId)
                ?? throw new UserNotFoundException();

            return user;
        }

        private int GetCurrentUserId()
        {
            var principal = _httpContextAccessor.HttpContext?.User;

            if (principal?.Identity?.IsAuthenticated != true)
            {
                throw new MissingTokenException();
            }

            var userIdClaim = principal.Claims.FirstOrDefault(claim =>
                claim.Type == JwtRegisteredClaimNames.Sub ||
                claim.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new InvalidTokenException("Can't get user id from validated claims");
            }

            return userId;
        }
    }
}
