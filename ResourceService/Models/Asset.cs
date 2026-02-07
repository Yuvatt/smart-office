using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ResourceService.Models
{
    public class Asset
    {
        // MongoDB uses strictly ObjectId strings for ID
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("Name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("Type")]
        public string Type { get; set; } = string.Empty; // e.g., "Laptop", "Chair"

        [BsonElement("Location")]
        public string Location { get; set; } = string.Empty; // e.g., "Room 302"
    }
}