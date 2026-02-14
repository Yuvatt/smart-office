using IdentityService.Data;
using Microsoft.EntityFrameworkCore;
using IdentityService.Models;

/*
This is the main entry point of the IdentityService application. 
It sets up the web application, configures services,
and defines the middleware pipeline.
-- development environment only: Swagger is used for API
documentation and testing, but it is commented out to avoid exposing
it in production.
*/

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();

/* builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); */

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddCors(options =>
{ 
    options.AddPolicy("AllowAll",
        policy =>
        { 
            policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }); 
});

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        Console.WriteLine($">>> error creating database: {ex.Message}");
    }
}


/*
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
*/

app.UseCors("AllowAll");

app.UseAuthorization();
app.MapControllers();

app.Run();