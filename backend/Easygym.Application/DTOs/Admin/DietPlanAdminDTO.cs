using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Easygym.Application.DTOs.Admin
{
    public class DietPlanAdminDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string TrainerName { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}