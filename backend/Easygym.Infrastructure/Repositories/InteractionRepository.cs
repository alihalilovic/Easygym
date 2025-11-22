using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Easygym.Domain.Interfaces;
using Easygym.Infrastructure.Persistence;
using Easygym.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Easygym.Infrastructure.Repositories
{
    public class InteractionRepository : IInteractionRepository
    {
        private readonly EasygymDbContext _context;

        public InteractionRepository(EasygymDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetClientsForTrainerAsync(int trainerId)
        {
            var clientIds = await _context.Clients.Where(c => c.TrainerId == trainerId).Select(c => c.Id).ToListAsync();
            var clients = await _context.Users.Where(u => clientIds.Contains(u.Id)).ToListAsync();
            return clients;
        }
    }
}