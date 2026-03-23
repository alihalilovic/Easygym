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
            var password = "Password123!";
            var role = Role.Client;
            var name = "Test User";

            _userRepositoryMock.Setup(x => x.GetUserByEmailAsync(email)).ReturnsAsync((User?)null);
            _userRepositoryMock.Setup(x => x.AddUserAsync(It.IsAny<User>())).ReturnsAsync(new User { Id = 1, Email = email, Role = role });

            var token = await _authService.RegisterAsync(name, email, password, role);

            Assert.NotNull(token);
            Assert.NotEmpty(token);
        }

        [Fact]
        public async Task TestRegister_NormalizesEmailBeforeLookupAndSave()
        {
            var email = " Test@Example.com ";
            var normalizedEmail = "test@example.com";
            var password = "Password123!";
            var role = Role.Client;
            var name = "Test User";

            _userRepositoryMock.Setup(x => x.GetUserByEmailAsync(normalizedEmail)).ReturnsAsync((User?)null);
            _userRepositoryMock.Setup(x => x.AddUserAsync(It.Is<User>(u => u.Email == normalizedEmail))).ReturnsAsync(new User { Id = 1, Email = normalizedEmail, Role = role });

            var token = await _authService.RegisterAsync(name, email, password, role);

            Assert.NotNull(token);
            _userRepositoryMock.Verify(x => x.GetUserByEmailAsync(normalizedEmail), Times.Once);
            _userRepositoryMock.Verify(x => x.AddUserAsync(It.Is<User>(u => u.Email == normalizedEmail)), Times.Once);
        }

        [Fact]
        public async Task TestRegister_AdminRole_ThrowsInvalidRoleException()
        {
            var email = "admin@example.com";
            var password = "Password123!";
            var name = "Admin User";

            await Assert.ThrowsAsync<InvalidRoleException>(() =>
                _authService.RegisterAsync(name, email, password, Role.Admin));
        }

        [Fact]
        public async Task TestRegister_WeakPassword_ThrowsValidationException()
        {
            var email = "test@example.com";
            var password = "password123";
            var role = Role.Client;
            var name = "Test User";

            await Assert.ThrowsAsync<ValidationException>(() =>
                _authService.RegisterAsync(name, email, password, role));
        }

        [Fact]
        public async Task TestRegister_InvalidEmail_ThrowsValidationException()
        {
            await Assert.ThrowsAsync<ValidationException>(() =>
                _authService.RegisterAsync("Test User", " not-an-email ", "Password123!", Role.Client));
        }

        [Fact]
        public async Task TestLogin_InvalidPassword_ThrowsException()
        {
            var email = "test@example.com";
            var password = "Password123!";
            var wrongPassword = "wrongpassword";
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User { Id = 1, Email = email, Password = passwordHash, Role = Role.Client };

            _userRepositoryMock.Setup(x => x.GetUserByEmailAsync(email)).ReturnsAsync(user);

            await Assert.ThrowsAsync<InvalidCredentialsException>(() => _authService.LoginAsync(email, wrongPassword));
        }

        [Fact]
        public async Task TestLogin_NormalizesEmailBeforeLookup()
        {
            var normalizedEmail = "test@example.com";
            var password = "Password123!";
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User { Id = 1, Email = normalizedEmail, Password = passwordHash, Role = Role.Client };

            _userRepositoryMock.Setup(x => x.GetUserByEmailAsync(normalizedEmail)).ReturnsAsync(user);

            var token = await _authService.LoginAsync(" Test@Example.com ", password);

            Assert.NotNull(token);
            _userRepositoryMock.Verify(x => x.GetUserByEmailAsync(normalizedEmail), Times.Once);
        }
    }
}
