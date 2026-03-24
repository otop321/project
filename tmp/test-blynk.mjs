// Test Blynk API - check which pins return valid data
const token = "g23SmvjZXgmOrHN7kqwVLOUM3UC9rWnI";

// Try using the /getMultiple endpoint first which returns all pin values at once
try {
  const res = await fetch(`https://blynk.cloud/external/api/getMultiple?token=${token}&v0=&v1=&v2=&v3=&v4=&v5=&v6=&v7=&v8=&v9=&v10=&v11=`);
  const text = await res.text();
  console.log("Multiple pins response:", text);
} catch (e) {
  console.log("Multiple endpoint error:", e.message);
}

console.log("\n--- Individual pin test ---");
for (let i = 0; i <= 15; i++) {
  const pin = `v${i}`;
  try {
    const res = await fetch(`https://blynk.cloud/external/api/get?token=${token}&${pin}`);
    const text = await res.text();
    const trimmed = text.trim();
    const isError = trimmed.includes('"error"');
    console.log(`${pin}: ${isError ? "❌ error" : "✅ " + trimmed}`);
  } catch (e) {
    console.log(`${pin}: NETWORK ERROR`);
  }
}
