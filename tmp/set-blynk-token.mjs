import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://otop321_db_user:otop321@otop.hv5hxcs.mongodb.net/?appName=otop";
const EMAIL = "aektanawat@gmail.com";
const BLYNK_TOKEN = "g23SmvjZXgmOrHN7kqwVLOUM3UC9rWnI";
const BLYNK_TEMPLATE_ID = "TMPL6mpiwkPqK";

const client = new MongoClient(MONGODB_URI);
try {
  await client.connect();
  const db = client.db('test');
  const result = await db.collection('users').updateOne(
    { email: EMAIL },
    { $set: { blynkToken: BLYNK_TOKEN, blynkTemplateId: BLYNK_TEMPLATE_ID } }
  );
  if (result.matchedCount === 0) {
    console.log(`❌ User not found: ${EMAIL}`);
  } else {
    console.log(`✅ Updated blynkToken and blynkTemplateId for ${EMAIL}`);
  }
} catch (err) {
  console.error("Error:", err.message);
} finally {
  await client.close();
}
