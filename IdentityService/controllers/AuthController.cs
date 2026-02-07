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

        // Constructor: Injecting the Database Context and Configuration (to read settings)
        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        /* POST: api/auth/register 

        */
        [HttpPost("register")]
        public async Task<ActionResult<string>> Register(UserDto request)
        {
            // Validate input (basic validation)
            for(int i = 0; i < request.Username.Length; i++) {
                if (char.IsWhiteSpace(request.Username[i]))
                {
                    return BadRequest("Username cannot contain whitespace.");
                }
            }

            for (int i = 0; i < request.Password.Length; i++) {
                if (char.IsWhiteSpace(request.Password[i]))
                    return BadRequest("Password cannot contain whitespace.");
                
            }
            
            // Check if the user already exists
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest("User already exists.");
            

            // Hash the password (security best practice)
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            //Create the new user object
            var user = new User {
                Username = request.Username,
                PasswordHash = passwordHash,
                Role = request.Role
            };

            //Save to database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully.");
        }

        /* POST: api/auth/login 
        
        */
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserDto request)
        {
            // find the user by username
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            // check if user exists and verify password
            if (user == null)
                return BadRequest("User not found.");
        
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return BadRequest("Invalid password.");

            string token = CreateToken(user);

            return Ok(token);
        }

        /* 
        Create JWT Token 
            input: User object 
            output: (string) JWT token as a string 
        */
        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // Stores the ID
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role) // Important: Stores "Admin" or "Member"
            };

            // Get the secret key from appsettings.json
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return jwt;
        }
    }

    public class UserDto {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Member";
    }
}