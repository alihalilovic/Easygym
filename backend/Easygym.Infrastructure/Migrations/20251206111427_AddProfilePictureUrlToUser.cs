using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Easygym.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProfilePictureUrlToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Meals_DietPlanDays_DietPlanDayId",
                table: "Meals");

            migrationBuilder.AddColumn<string>(
                name: "ProfilePictureUrl",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Meals_DietPlanDays_DietPlanDayId",
                table: "Meals",
                column: "DietPlanDayId",
                principalTable: "DietPlanDays",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Meals_DietPlanDays_DietPlanDayId",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "ProfilePictureUrl",
                table: "Users");

            migrationBuilder.AddForeignKey(
                name: "FK_Meals_DietPlanDays_DietPlanDayId",
                table: "Meals",
                column: "DietPlanDayId",
                principalTable: "DietPlanDays",
                principalColumn: "Id");
        }
    }
}
