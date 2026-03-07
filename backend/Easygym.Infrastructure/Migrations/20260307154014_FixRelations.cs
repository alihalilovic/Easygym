using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Easygym.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DietPlans_Users_TrainerId",
                table: "DietPlans");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSessions_Workouts_WorkoutId",
                table: "WorkoutSessions");

            migrationBuilder.AddForeignKey(
                name: "FK_DietPlans_Users_TrainerId",
                table: "DietPlans",
                column: "TrainerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSessions_Workouts_WorkoutId",
                table: "WorkoutSessions",
                column: "WorkoutId",
                principalTable: "Workouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DietPlans_Users_TrainerId",
                table: "DietPlans");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSessions_Workouts_WorkoutId",
                table: "WorkoutSessions");

            migrationBuilder.AddForeignKey(
                name: "FK_DietPlans_Users_TrainerId",
                table: "DietPlans",
                column: "TrainerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSessions_Workouts_WorkoutId",
                table: "WorkoutSessions",
                column: "WorkoutId",
                principalTable: "Workouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
