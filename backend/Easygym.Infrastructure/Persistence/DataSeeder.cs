using Easygym.Domain.Constants;
using Easygym.Domain.Entities;

namespace Easygym.Infrastructure.Persistence
{
    public static class DataSeeder
    {
        public static void Seed(EasygymDbContext context)
        {
            if (!context.Users.Any())
            {
                var users = new List<User>
                {
                    new User
                    {
                        Name = "Admin User",
                        Email = "admin@easygym.com",
                        Password = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                        Role = Role.Admin,
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Name = "Trainer User",
                        Email = "trainer@easygym.com",
                        Password = BCrypt.Net.BCrypt.HashPassword("Trainer123!"),
                        Role = Role.Trainer,
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Name = "Client One",
                        Email = "client1@easygym.com",
                        Password = BCrypt.Net.BCrypt.HashPassword("Client123!"),
                        Role = Role.Client,
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Name = "Client Two",
                        Email = "client2@easygym.com",
                        Password = BCrypt.Net.BCrypt.HashPassword("Client123!"),
                        Role = Role.Client,
                        CreatedAt = DateTime.Now
                    }
                };

                context.Users.AddRange(users);
                context.SaveChanges();

                foreach (var user in users)
                {
                    switch (user.Role)
                    {
                        case Role.Admin:
                            context.Admins.Add(new Admin { Id = user.Id });
                            break;
                        case Role.Trainer:
                            context.Trainers.Add(new Trainer { Id = user.Id });
                            break;
                        case Role.Client:
                            context.Clients.Add(new Client { Id = user.Id });
                            break;
                    }
                }
                
                context.SaveChanges();
            }
        }
    }
}
