using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Easygym.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCategoryFromExercise : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Exercises");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Exercises",
                type: "TEXT",
                maxLength: 50,
                nullable: true);
        }
    }
}
