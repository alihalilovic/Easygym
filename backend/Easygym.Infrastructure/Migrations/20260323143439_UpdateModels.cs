using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Easygym.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkoutSessions_TraineeId",
                table: "WorkoutSessions");

            migrationBuilder.DropIndex(
                name: "IX_Workouts_TraineeId",
                table: "Workouts");

            migrationBuilder.DropIndex(
                name: "IX_Workouts_TrainerId",
                table: "Workouts");

            migrationBuilder.DropIndex(
                name: "IX_TrainerClientHistories_ClientId",
                table: "TrainerClientHistories");

            migrationBuilder.DropIndex(
                name: "IX_TrainerClientHistories_TrainerId",
                table: "TrainerClientHistories");

            migrationBuilder.DropIndex(
                name: "IX_Invitations_ClientId",
                table: "Invitations");

            migrationBuilder.DropIndex(
                name: "IX_Invitations_TrainerId",
                table: "Invitations");

            migrationBuilder.DropIndex(
                name: "IX_Exercises_CreatedById",
                table: "Exercises");

            migrationBuilder.DropIndex(
                name: "IX_DietPlans_TrainerId",
                table: "DietPlans");

            migrationBuilder.DropIndex(
                name: "IX_DietPlanAssignments_ClientId",
                table: "DietPlanAssignments");

            migrationBuilder.DropIndex(
                name: "IX_DietPlanAssignments_DietPlanId",
                table: "DietPlanAssignments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSessions_TraineeId",
                table: "WorkoutSessions",
                column: "TraineeId");

            migrationBuilder.CreateIndex(
                name: "IX_Workouts_TraineeId",
                table: "Workouts",
                column: "TraineeId");

            migrationBuilder.CreateIndex(
                name: "IX_Workouts_TrainerId",
                table: "Workouts",
                column: "TrainerId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainerClientHistories_ClientId",
                table: "TrainerClientHistories",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainerClientHistories_TrainerId",
                table: "TrainerClientHistories",
                column: "TrainerId");

            migrationBuilder.CreateIndex(
                name: "IX_Invitations_ClientId",
                table: "Invitations",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Invitations_TrainerId",
                table: "Invitations",
                column: "TrainerId");

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_CreatedById",
                table: "Exercises",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_TrainerId",
                table: "DietPlans",
                column: "TrainerId");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlanAssignments_ClientId",
                table: "DietPlanAssignments",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlanAssignments_DietPlanId",
                table: "DietPlanAssignments",
                column: "DietPlanId");
        }
    }
}
