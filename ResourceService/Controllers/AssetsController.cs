using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MongoDB.Driver;
using ResourceService.Models;

namespace ResourceService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssetsController : ControllerBase
{
    private readonly IMongoCollection<Asset> _assetsCollection;

    public AssetsController(IConfiguration config)
    {
        var mongoClient = new MongoClient(config.GetConnectionString("MongoDb"));
        var mongoDatabase = mongoClient.GetDatabase("SmartOfficeDb");
        _assetsCollection = mongoDatabase.GetCollection<Asset>("Assets");
    }

    [HttpGet]
    [Authorize]
    public async Task<List<Asset>> Get() =>
        await _assetsCollection.Find(_ => true).ToListAsync();

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Asset newAsset)
    {
        await _assetsCollection.InsertOneAsync(newAsset);
        return CreatedAtAction(nameof(Get), new { id = newAsset.Id }, newAsset);
    }    

    // --- פונקציית המחיקה (DELETE) ---
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var filter = Builders<Asset>.Filter.Eq(x => x.Id, id);
        await _assetsCollection.DeleteOneAsync(filter);
        return NoContent();
    }

    // --- פונקציית העריכה (PUT) ---
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, Asset updatedAsset)
    {
        var asset = await _assetsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        if (asset == null)
        {
            return NotFound();
        }

        updatedAsset.Id = asset.Id; // שומרים על ה-ID המקורי
        await _assetsCollection.ReplaceOneAsync(x => x.Id == id, updatedAsset);

        return NoContent();
    }
}