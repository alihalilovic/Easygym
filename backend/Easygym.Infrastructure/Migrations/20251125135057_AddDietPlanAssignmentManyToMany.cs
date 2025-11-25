using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Easygym.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDietPlanAssignmentManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DietPlans_Users_ClientId",
                table: "DietPlans");

            migrationBuilder.DropIndex(
                name: "IX_DietPlans_ClientId",
                table: "DietPlans");

            migrationBuilder.DropColumn(
                name: "ClientId",
                table: "DietPlans");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "DietPlans");

            migrationBuilder.CreateTable(
                name: "DietPlanAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DietPlanId = table.Column<int>(type: "INTEGER", nullable: false),
                    ClientId = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DietPlanAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DietPlanAssignments_DietPlans_DietPlanId",
                        column: x => x.DietPlanId,
                        principalTable: "DietPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DietPlanAssignments_Users_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DietPlanAssignments_ClientId",
                table: "DietPlanAssignments",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlanAssignments_DietPlanId",
                table: "DietPlanAssignments",
                column: "DietPlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DietPlanAssignments");

            migrationBuilder.AddColumn<int>(
                name: "ClientId",
                table: "DietPlans",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "DietPlans",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_ClientId",
                table: "DietPlans",
                column: "ClientId");

            migrationBuilder.AddForeignKey(
                name: "FK_DietPlans_Users_ClientId",
                table: "DietPlans",
                column: "ClientId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
