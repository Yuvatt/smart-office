using IdentityService.Data;
using IdentityService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace IdentityService.Controllers;


/*** 
This controller handles user registration and login, 
allowing users to create accounts and authenticate themselves. 
It uses JWT for token-based authentication, enabling secure access to protected resources. 
***/

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    //Injecting AppDbContext and IConfiguration to access database and configuration setting 
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context; 
        _configuration = configuration; 
        
    }

    public record RegisterRequest(string Username, string Password, string Role);
    public record LoginRequest(string Username, string Password);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        
        var isUser = await _context.Users.FirstOrDefaultAsync(user => user.Username == request.Username);
        if (isUser != null)
            return BadRequest("username already exists");

        if (request.Role != "Admin" && request.Role != "Member")
        {
            return BadRequest("Role must be either 'Admin' or 'Member'");
        }

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Create the user with the selected role
        var user = new User
        {
            Username = request.Username,
            PasswordHash = hashedPassword,
            Role = request.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("User registered successfully");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(user => user.Username == request.Username);
        if (user == null)
            return Unauthorized("Invalid username");
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Invalid password");
        

        // Generate JWT token and return it to the client
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return Ok(new { Token = tokenString, Role = user.Role });
    }
}