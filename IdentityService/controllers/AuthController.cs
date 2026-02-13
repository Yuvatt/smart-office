using Microsoft.AspNetCore.Mvc;
using IdentityService.Data;
using IdentityService.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace IdentityService.Controllers 
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase 
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<string>> Register(UserDto request)
        {
            // 1. Basic Input Validations
            if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Length < 3)
            {
                return BadRequest("Username must be at least 3 characters long.");
            }

            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            {
                return BadRequest("Password must be at least 6 characters long.");
            }

            // 2. Prevent whitespace in credentials (as in original code)
            if (request.Username.Any(char.IsWhiteSpace) || request.Password.Any(char.IsWhiteSpace))
            {
                return BadRequest("Username and Password cannot contain whitespace.");
            }

            // 3. Role Validation - Ensure only "Admin" or "Member" are used
            var allowedRoles = new[] { "Admin", "Member" };
            if (!allowedRoles.Contains(request.Role))
            {
                return BadRequest("Invalid role. Allowed roles are: Admin, Member.");
            }
            
            // 4. Check if the user already exists
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest("User already exists.");
            }

            // 5. Hash the password
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User {
                Username = request.Username,
                PasswordHash = passwordHash,
                Role = request.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully.");
        }

        

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                // Security tip: Use a generic message to prevent username enumeration
                return BadRequest("Invalid username or password.");
            }

            string token = CreateToken(user);

            return Ok(token);
        }

        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role) 
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // Updated DTO to include explicit Role selection support
    public class UserDto {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Member"; 
    }
}