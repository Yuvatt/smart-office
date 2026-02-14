using ResourceService.Models;
using MongoDB.Driver;
using Microsoft.Extensions.Options;

namespace ResourceService.Services
{
    public class AssetService
    {
        private readonly IMongoCollection<Asset> _assetsCollection;

        public AssetService(IConfiguration config)
        {
            // Connect to MongoDB
            var mongoDbConnectionString = config.GetConnectionString("MongoDb"); 
            var mongoClient = new MongoClient(mongoDbConnectionString);
            var mongoDatabase = mongoClient.GetDatabase("SmartOfficeDb");
            
            // Get access to the "Assets" table (collection)
            _assetsCollection = mongoDatabase.GetCollection<Asset>("Assets");
        }

        // Get all assets
        public async Task<List<Asset>> GetAsync() =>
            await _assetsCollection.Find(_ => true).ToListAsync();

        // Create a new asset
        public async Task CreateAsync(Asset newAsset) =>
            await _assetsCollection.InsertOneAsync(newAsset);
        
        /*  It returns true if such an asset exists, and false otherwise.
        */
        public async Task<bool> AssetExistsAsync(string name, string type, string? excludeId = null)
        {
            return await _assetsCollection.Find(x => x.Name == name && x.Type == type).AnyAsync();
        }
    }
}