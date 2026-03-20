const { MongoClient } = require('mongodb');
const MONGODB_URI = "mongodb+srv://otop321_db_user:otop321@otop.hv5hxcs.mongodb.net/?appName=otop";

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("Connected to Atlas");
    const db = client.db('test'); 
    const collection = db.collection('users');
    
    // List all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log("Indexes found:", indexes.map(i => i.name));
    
    if (indexes.find(i => i.name === "username_1")) {
       await collection.dropIndex("username_1");
       console.log("Dropped username_1 successfully");
    } else {
       console.log("username_1 not found");
    }
  } catch (err) {
    console.error("Critical Error:", err.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}
run();
