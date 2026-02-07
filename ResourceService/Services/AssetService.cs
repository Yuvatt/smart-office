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
            var mongoClient = new MongoClient(config.GetConnectionString("MongoDbConnection"));
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
    }
}