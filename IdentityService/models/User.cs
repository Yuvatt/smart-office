namespace IdentityService.Models
{
    /*
    This class represents a user in the system. 
    It contains properties for the user's ID, username, password hash, and role. 
    The Role property is used to determine the user's permissions
    within the application. By default, new users are assigned the "Member" role,
    but this can be changed to "Admin" for users with administrative privileges.
    */

    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Member";
    }

    public static class UserRoles
    {
        public const string Admin = "Admin";
        public const string Member = "Member";
    }
}