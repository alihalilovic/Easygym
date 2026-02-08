using Easygym.Application.Interfaces;
using Easygym.Application.Services;
using Easygym.Domain.Constants;
using Easygym.Domain.Entities;
using Easygym.Domain.Interfaces;
using Easygym.Domain.Models.Requests;
using Easygym.Domain.Models.Responses;
using Moq;
using Xunit;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Easygym.Tests
{
    public class WorkoutServiceTests
    {
        private readonly Mock<IWorkoutRepository> _workoutRepositoryMock;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;
        private readonly Mock<IGenericRepository<Client>> _clientRepositoryMock;
        private readonly Mock<IWorkoutSessionService> _workoutSessionServiceMock;
        private readonly WorkoutService _workoutService;

        public WorkoutServiceTests()
        {
            _workoutRepositoryMock = new Mock<IWorkoutRepository>();
            _currentUserServiceMock = new Mock<ICurrentUserService>();
            _clientRepositoryMock = new Mock<IGenericRepository<Client>>();
            _workoutSessionServiceMock = new Mock<IWorkoutSessionService>();

            _workoutService = new WorkoutService(
                _workoutRepositoryMock.Object,
                _currentUserServiceMock.Object,
                _clientRepositoryMock.Object,
                _workoutSessionServiceMock.Object
            );
        }

        [Fact]
        public async Task TestCreateWorkout_ValidRequest_ReturnsWorkoutResponse()
        {
            var traineeId = 1;
            var currentUser = new UserResponse { Id = traineeId, Role = Role.Client, Email = "test@test.com", CreatedAt = default };
            var request = new CreateWorkoutRequest
            {
                TraineeId = traineeId,
                Name = "Test Workout",
                Description = "Test Description",
                RestTimeSeconds = 60,
                Sets = new List<SetDto>
                {
                    new SetDto { ExerciseId = 1, Repetitions = 10, Weight = 50 }
                }
            };

            _currentUserServiceMock.Setup(x => x.GetCurrentUserAsync()).ReturnsAsync(currentUser);
            _workoutRepositoryMock.Setup(x => x.AddWorkoutAsync(It.IsAny<Workout>())).Returns(Task.CompletedTask);

            var result = await _workoutService.CreateWorkoutAsync(request);

            Assert.NotNull(result);
            Assert.Equal(request.Name, result.Name);
            Assert.Equal(request.TraineeId, result.TraineeId);
            Assert.Single(result.Sets);
        }
    }
}