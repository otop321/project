import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://otop321_db_user:otop321@otop.hv5hxcs.mongodb.net/?appName=otop";

const client = new MongoClient(MONGODB_URI);
try {
  await client.connect();
  const db = client.db('test');
  const users = await db.collection('users').find({}, { projection: { email: 1, name: 1, role: 1 } }).toArray();
  console.log("Users in database:");
  users.forEach(u => console.log(` - ${u.email} (${u.name}) [${u.role}]`));
} catch (err) {
  console.error("Error:", err.message);
} finally {
  await client.close();
}
