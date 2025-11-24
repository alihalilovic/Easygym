using Easygym.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Easygym.Infrastructure.Persistence
{
    public class EasygymDbContext : DbContext
    {
        public EasygymDbContext(DbContextOptions<EasygymDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Client, Trainer, and Admin to not use auto-increment IDs
            // Their IDs will be manually set to match the User.Id
            modelBuilder.Entity<Client>()
                .Property(c => c.Id)
                .ValueGeneratedNever();

            modelBuilder.Entity<Trainer>()
                .Property(t => t.Id)
                .ValueGeneratedNever();

            modelBuilder.Entity<Admin>()
                .Property(a => a.Id)
                .ValueGeneratedNever();

            // Configure WorkoutSession to NOT cascade delete when Workout is deleted
            // This preserves workout session history even after workouts are removed
            modelBuilder.Entity<WorkoutSession>()
                .HasOne(ws => ws.Workout)
                .WithMany()
                .HasForeignKey(ws => ws.WorkoutId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Workout> Workouts { get; set; }
        public DbSet<Set> Sets { get; set; }
        public DbSet<Exercise> Exercises { get; set; }
        public DbSet<WorkoutSession> WorkoutSessions { get; set; }
        public DbSet<Invitation> Invitations { get; set; }
        public DbSet<Trainer> Trainers { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<TrainerClientHistory> TrainerClientHistories { get; set; }
    }
}