namespace Easygym.Domain.Exceptions
{
    // Base exception for all application exceptions
    public abstract class AppException : Exception
    {
        public AppException(string message) : base(message) { }
    }

    // Authentication related exceptions
    public class AuthenticationException : AppException
    {
        public AuthenticationException(string message) : base(message) { }
    }

    public class UserNotFoundException : AuthenticationException
    {
        public UserNotFoundException() : base("User not found") { }
    }

    public class InvalidCredentialsException : AuthenticationException
    {
        public InvalidCredentialsException() : base("Invalid credentials") { }
    }

    public class UserAlreadyExistsException : AppException
    {
        public UserAlreadyExistsException() : base("User already exists") { }
    }

    public class InvalidRoleException : AppException
    {
        public InvalidRoleException() : base("Invalid role") { }
    }

    public class InvalidTokenException : AuthenticationException
    {
        public InvalidTokenException(string message = "Invalid token") : base(message) { }
    }

    public class MissingTokenException : AuthenticationException
    {
        public MissingTokenException() : base("Authorization token is missing") { }
    }

    public class WorkoutsNotFoundException : AppException
    {
        public WorkoutsNotFoundException() : base("Workouts not found") { }
    }

    public class WorkoutNotFoundException : AppException
    {
        public WorkoutNotFoundException() : base("Workout not found") { }
    }

    public class ForbiddenAccessException : AppException
    {
        public ForbiddenAccessException() : base("Forbidden access") { }
    }

    public class WorkoutSessionNotFoundException : AppException
    {
        public WorkoutSessionNotFoundException() : base("Workout session not found") { }
    }

    public class InvitationNotFoundException : AppException
    {
        public InvitationNotFoundException() : base("Invitation not found") { }
    }

    public class InvitationAlreadyExistsException : AppException
    {
        public InvitationAlreadyExistsException() : base("Invitation already exists") { }
    }

    public class ExerciseNotFoundException : AppException
    {
        public ExerciseNotFoundException() : base("Exercise not found") { }
    }

    public class ExerciseInUseException : AppException
    {
        public ExerciseInUseException() : base("Exercise is currently in use and cannot be deleted") { }
    }

    public class DietPlanNotFoundException : AppException
    {
        public DietPlanNotFoundException() : base("Diet plan not found") { }
    }

    public class DietPlansNotFoundException : AppException
    {
        public DietPlansNotFoundException() : base("Diet plans not found") { }
    }

    // For general validation errors
    public class ValidationException : AppException
    {
        public ValidationException(string message) : base(message) { }
    }
}