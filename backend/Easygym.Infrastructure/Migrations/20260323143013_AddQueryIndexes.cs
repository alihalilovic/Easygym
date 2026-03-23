using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Easygym.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQueryIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_DietPlanAssignments_ClientId_IsActive",
                table: "DietPlanAssignments",
                columns: new[] { "ClientId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_DietPlanAssignments_DietPlanId_ClientId",
                table: "DietPlanAssignments",
                columns: new[] { "DietPlanId", "ClientId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_TrainerId_CreatedAt",
                table: "DietPlans",
                columns: new[] { "TrainerId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_CreatedById_CreatedAt",
                table: "Exercises",
                columns: new[] { "CreatedById", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_CreatedById_IsPublic_CreatedAt",
                table: "Exercises",
                columns: new[] { "CreatedById", "IsPublic", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Invitations_ClientId_Status",
                table: "Invitations",
                columns: new[] { "ClientId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Invitations_ClientId_TrainerId",
                table: "Invitations",
                columns: new[] { "ClientId", "TrainerId" });

            migrationBuilder.CreateIndex(
                name: "IX_Invitations_TrainerId_Status",
                table: "Invitations",
                columns: new[] { "TrainerId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TrainerClientHistories_ClientId_EndedAt",
                table: "TrainerClientHistories",
                columns: new[] { "ClientId", "EndedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TrainerClientHistories_TrainerId_EndedAt",
                table: "TrainerClientHistories",
                columns: new[] { "TrainerId", "EndedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Workouts_TraineeId_CreatedAt",
                table: "Workouts",
                columns: new[] { "TraineeId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Workouts_TrainerId_CreatedAt",
                table: "Workouts",
                columns: new[] { "TrainerId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSessions_TraineeId_EndTime",
                table: "WorkoutSessions",
                columns: new[] { "TraineeId", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSessions_TraineeId_StartTime",
                table: "WorkoutSessions",
                columns: new[] { "TraineeId", "StartTime" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSessions_TraineeId_WorkoutId_StartTime",
                table: "WorkoutSessions",
                columns: new[] { "TraineeId", "WorkoutId", "StartTime" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DietPlanAssignments_ClientId_IsActive",
                table: "DietPlanAssignments");

            migrationBuilder.DropIndex(
                name: "IX_DietPlanAssignments_DietPlanId_ClientId",
                table: "DietPlanAssignments");

            migrationBuilder.DropIndex(
                name: "IX_DietPlans_TrainerId_CreatedAt",
                table: "DietPlans");

            migrationBuilder.DropIndex(
                name: "IX_Exercises_CreatedById_CreatedAt",
                table: "Exercises");

            migrationBuilder.DropIndex(
                name: "IX_Exercises_CreatedById_IsPublic_CreatedAt",
                table: "Exercises");

            migrationBuilder.DropIndex(
                name: "IX_Invitations_ClientId_Status",
                table: "Invitations");

            migrationBuilder.DropIndex(
                name: "IX_Invitations_ClientId_TrainerId",
                table: "Invitations");

            migrationBuilder.DropIndex(
                name: "IX_Invitations_TrainerId_Status",
                table: "Invitations");

            migrationBuilder.DropIndex(
                name: "IX_TrainerClientHistories_ClientId_EndedAt",
                table: "TrainerClientHistories");

            migrationBuilder.DropIndex(
                name: "IX_TrainerClientHistories_TrainerId_EndedAt",
                table: "TrainerClientHistories");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Workouts_TraineeId_CreatedAt",
                table: "Workouts");

            migrationBuilder.DropIndex(
                name: "IX_Workouts_TrainerId_CreatedAt",
                table: "Workouts");

            migrationBuilder.DropIndex(
                name: "IX_WorkoutSessions_TraineeId_EndTime",
                table: "WorkoutSessions");

            migrationBuilder.DropIndex(
                name: "IX_WorkoutSessions_TraineeId_StartTime",
                table: "WorkoutSessions");

            migrationBuilder.DropIndex(
                name: "IX_WorkoutSessions_TraineeId_WorkoutId_StartTime",
                table: "WorkoutSessions");
        }
    }
}
