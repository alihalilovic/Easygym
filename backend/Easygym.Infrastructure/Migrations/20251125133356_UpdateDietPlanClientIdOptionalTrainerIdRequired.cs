using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Easygym.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDietPlanClientIdOptionalTrainerIdRequired : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DietPlans_Users_ClientId",
                table: "DietPlans");

            migrationBuilder.DropForeignKey(
                name: "FK_DietPlans_Users_TrainerId",
                table: "DietPlans");

            migrationBuilder.AlterColumn<int>(
                name: "TrainerId",
                table: "DietPlans",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ClientId",
                table: "DietPlans",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddForeignKey(
                name: "FK_DietPlans_Users_ClientId",
                table: "DietPlans",
                column: "ClientId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DietPlans_Users_TrainerId",
                table: "DietPlans",
                column: "TrainerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DietPlans_Users_ClientId",
                table: "DietPlans");

            migrationBuilder.DropForeignKey(
                name: "FK_DietPlans_Users_TrainerId",
                table: "DietPlans");

            migrationBuilder.AlterColumn<int>(
                name: "TrainerId",
                table: "DietPlans",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "ClientId",
                table: "DietPlans",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_DietPlans_Users_ClientId",
                table: "DietPlans",
                column: "ClientId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DietPlans_Users_TrainerId",
                table: "DietPlans",
                column: "TrainerId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
