import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";

export async function GET() {
  try {
    await dbConnect();
    
    // ใช้ .collection เพื่อข้ามการเช็ค Schema ของ Mongoose (Bypass Mongoose Schema)
    // เพื่อให้มั่นใจว่าฟิลด์ role จะถูกเพิ่มเข้าไปใน Database แน่นอน
    const result = await User.collection.updateMany({}, { $set: { role: "admin" } });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully upgraded ${result.modifiedCount} account(s) to Admin! (Bypassed Schema)`,
      instruction: "1. Please click the link again. 2. Log out and Log back in."
    });
  } catch (error: unknown) {
    console.error("Upgrade Error", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
