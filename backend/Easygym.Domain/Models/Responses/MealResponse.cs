namespace Easygym.Domain.Models.Responses
{
    public class MealResponse
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string MealType { get; set; }
        public string? Notes { get; set; }
    }
}
