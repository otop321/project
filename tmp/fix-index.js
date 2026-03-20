const mongoose = require('mongoose');

async function fixIndex() {
  const MONGODB_URI = "mongodb+srv://otop321_db_user:otop321@otop.hv5hxcs.mongodb.net/?appName=otop";
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas");
    
    // The collection name might be 'users' (from mongoose.model('User'))
    const collection = mongoose.connection.db.collection('users');
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes.map(i => i.name));
    
    if (indexes.find(i => i.name === 'username_1')) {
      await collection.dropIndex('username_1');
      console.log("Successfully dropped 'username_1' index");
    } else if (indexes.find(i => i.name === 'username')) {
      await collection.dropIndex('username');
      console.log("Successfully dropped 'username' index");
    } else {
      console.log("problematic index not found by name, checking keys...");
      // Also check key pattern
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixIndex();
