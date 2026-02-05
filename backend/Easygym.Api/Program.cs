using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Easygym.Api.Middlewares;
using Easygym.Application.Interfaces;
using Easygym.Application.Services;
using Easygym.Domain.Interfaces;
using Easygym.Infrastructure.Persistence;
using Easygym.Infrastructure.Repositories;
using Easygym.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure enums to serialize as strings instead of integers
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        // Handle circular references automatically
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();
builder.Services.AddDbContext<EasygymDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IWorkoutRepository, WorkoutRepository>();
builder.Services.AddScoped<IWorkoutSessionRepository, WorkoutSessionRepository>();
builder.Services.AddScoped<IInvitationRepository, InvitationRepository>();
builder.Services.AddScoped<ITrainerRepository, TrainerRepository>();
builder.Services.AddScoped<IInteractionRepository, InteractionRepository>();
builder.Services.AddScoped<ITrainerClientHistoryRepository, TrainerClientHistoryRepository>();
builder.Services.AddScoped<IExerciseRepository, ExerciseRepository>();
builder.Services.AddScoped<IDietPlanRepository, DietPlanRepository>();
builder.Services.AddScoped<IMealLogRepository, MealLogRepository>();
builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<CurrentUserService>();
builder.Services.AddScoped<ICurrentUserService>(sp => sp.GetRequiredService<CurrentUserService>());
builder.Services.AddScoped<WorkoutService>();
builder.Services.AddScoped<WorkoutSessionService>();
builder.Services.AddScoped<IWorkoutSessionService>(sp => sp.GetRequiredService<WorkoutSessionService>());
builder.Services.AddScoped<InvitationService>();
builder.Services.AddScoped<InteractionService>();
builder.Services.AddScoped<ClientService>();
builder.Services.AddScoped<TrainerService>();
builder.Services.AddScoped<ExerciseService>();
builder.Services.AddScoped<DietPlanService>();
builder.Services.AddScoped<MealLogService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Value ?? "";
        policy.AllowAnyHeader().AllowAnyMethod().WithOrigins(allowedOrigins.Split(','));
    });
});

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var jwtKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"] ?? "");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(jwtKey)
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<EasygymDbContext>();
        DataSeeder.Seed(context);
    }
}

app.UseHttpsRedirection();

app.UseCors("CorsPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
