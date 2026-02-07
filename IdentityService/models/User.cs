namespace IdentityService.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        // Role can be "Admin" or "Member"
        public string Role { get; set; } = "Member";
    }
}