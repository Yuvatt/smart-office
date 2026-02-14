using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MongoDB.Driver;
using ResourceService.Models;
using ResourceService.Services;

namespace ResourceService.Controllers;

/*
This controller manages operations for assets in the smart office system. 
    It uses MongoDB as the database to store asset information and includes authorization to 
    restrict access to certain operations based on user roles.
*/
[ApiController]
[Route("api/[controller]")]

public class AssetsController : ControllerBase
{
    // MongoDB connection setup
    private readonly IMongoCollection<Asset> _assetsCollection;
    private readonly AssetService _assetService;


    /* Constructor to initialize MongoDB connection and get the
    Assets collection.
    */
    public AssetsController(IConfiguration config, AssetService assetService)
    {
        var mongoClient = new MongoClient(config.GetConnectionString("MongoDb"));
        var mongoDatabase = mongoClient.GetDatabase("SmartOfficeDb");
        _assetsCollection = mongoDatabase.GetCollection<Asset>("Assets");
        _assetService = assetService;
    }

    [HttpGet]
    [Authorize]
    public async Task<List<Asset>> Get() => await _assetsCollection.Find(_ => true).ToListAsync();

    /* Create: (Admin only)
        This function allows creating a new asset.
            It takes an Asset object as input, inserts it into the MongoDB collection,
            and returns a 201 Created response with the location of the newly created asset.
    */
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Asset newAsset)
    {
        if (await _assetService.AssetExistsAsync(newAsset.Name, newAsset.Type))
        {
            return Conflict("Asset already exists.");
        }
        await _assetsCollection.InsertOneAsync(newAsset);
        return CreatedAtAction(nameof(Get), new { id = newAsset.Id }, newAsset);
    }    

    /* Delete: (Admin only)
    This function allows deleting an asset by its ID.
        It uses the MongoDB driver to find the asset by its ID and delete it from the collection. 
        If the asset is successfully deleted, it returns a 204 
    */
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var item = Builders<Asset>.Filter.Eq(x => x.Id, id);
        await _assetsCollection.DeleteOneAsync(item);
        return NoContent();
    }

    /* Update: (Admin only)
    This function allows updating an existing asset.
        If item exist , it replaces the existing document with the updated one. 
        If the item is not found- it returns a 404 Not Found response.
    */
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, Asset updatedAsset)
    {
        if (await _assetService.AssetExistsAsync(updatedAsset.Name, updatedAsset.Type, id))
            return Conflict("Asset already exists.");
        
        var asset = await _assetsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (asset == null)
            return NotFound();
        
        updatedAsset.Id = asset.Id;
        await _assetsCollection.ReplaceOneAsync(x => x.Id == id, updatedAsset);

        return NoContent();
    }

}