using Microsoft.EntityFrameworkCore;
using IdentityService.Models;

namespace IdentityService.Data
{
    /* 
    this class is responsible for managing the database connection
    and providing access to the User entities.
    */
    
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
    }
}