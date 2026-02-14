using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ResourceService.Models
{
    /*
    This class represents an asset in the smart office system. 
        It includes properties for the asset's ID, name, type, and location. 
    */
    public class Asset
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("Name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("Type")]
        public string Type { get; set; } = string.Empty;

        [BsonElement("Location")]
        public string Location { get; set; } = string.Empty; 
    }
}