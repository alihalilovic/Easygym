using Easygym.Application.Services;
using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Constants;
using Easygym.Domain.Exceptions;
using Moq;
using Xunit;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Easygym.Tests
{
    public class AuthServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IGenericRepository<Client>> _clientRepositoryMock;
        private readonly Mock<ITrainerRepository> _trainerRepositoryMock;
        private readonly Mock<IGenericRepository<Admin>> _adminRepositoryMock;
        private readonly JwtService _jwtService;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _clientRepositoryMock = new Mock<IGenericRepository<Client>>();
            _trainerRepositoryMock = new Mock<ITrainerRepository>();
            _adminRepositoryMock = new Mock<IGenericRepository<Admin>>();

            var configurationMock = new Mock<IConfiguration>();
            configurationMock.SetupGet(x => x["JwtSettings:Secret"]).Returns("super_secret_key_for_testing_purposes_only_12345");
            configurationMock.SetupGet(x => x["JwtSettings:Issuer"]).Returns("test_issuer");
            configurationMock.SetupGet(x => x["JwtSettings:Audience"]).Returns("test_audience");
            configurationMock.SetupGet(x => x["JwtSettings:ExpirationMinutes"]).Returns("60");

            _jwtService = new JwtService(configurationMock.Object);

            _authService = new AuthService(
                _jwtService,
                _userRepositoryMock.Object,
                _clientRepositoryMock.Object,
                _trainerRepositoryMock.Object,
                _adminRepositoryMock.Object
            );
        }

        [Fact]
        public async Task TestRegister_ValidData_ReturnsToken()
        {
            var email = "test@example.com";
            var password = "password123";
            var role = Role.Client;
            var name = "Test User";

            _userRepositoryMock.Setup(x => x.GetUserByEmailAsync(email)).ReturnsAsync((User?)null);
            _userRepositoryMock.Setup(x => x.AddUserAsync(It.IsAny<User>())).ReturnsAsync(new User { Id = 1, Email = email, Role = role });

            var token = await _authService.RegisterAsync(name, email, password, role);

            Assert.NotNull(token);
            Assert.NotEmpty(token);
        }

        [Fact]
        public async Task TestLogin_InvalidPassword_ThrowsException()
        {
            var email = "test@example.com";
            var password = "password123";
            var wrongPassword = "wrongpassword";
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User { Id = 1, Email = email, Password = passwordHash, Role = Role.Client };

            _userRepositoryMock.Setup(x => x.GetUserByEmailAsync(email)).ReturnsAsync(user);

            await Assert.ThrowsAsync<InvalidCredentialsException>(() => _authService.LoginAsync(email, wrongPassword));
        }
    }
}