from pymongo import MongoClient

uri = "mongodb+srv://jpn900013_db_user:ZoscA8dimL4AO1SV@cluster0.jmx8i6c.mongodb.net/?appName=Cluster0"
client = MongoClient(uri)

try:
    print("Databases:", client.list_database_names())
    print("✅ Connection successful!")
except Exception as e:
    print("❌ Connection failed:", e)
finally:
    client.close()