import { NextResponse } from "next/server";
import axios from "axios";
import dbConnect from "../../../lib/dbConnect";
import SensorHistory from "../../../models/SensorHistory";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Token is required", { status: 400 });
  }

  try {
    const urls = [
      `https://blynk.cloud/external/api/get?token=${token}&v1`,
      `https://blynk.cloud/external/api/get?token=${token}&v2`,
      `https://blynk.cloud/external/api/get?token=${token}&v3`,
      `https://blynk.cloud/external/api/get?token=${token}&v4`,
      `https://blynk.cloud/external/api/get?token=${token}&v6`,
    ];

    const responses = await Promise.all(
      urls.map(url => axios.get(url).catch(() => ({ data: null })))
    );

    const data = {
      v1: String(responses[0].data ?? ""),   // Gas
      v2: String(responses[1].data ?? ""),   // Light
      v3: String(responses[2].data ?? ""),   // Temperature
      v4: String(responses[3].data ?? ""),   // Humidity
      v6: String(responses[4].data ?? ""),   // PM2.5
    };

    // Record history if session exists
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
       await dbConnect();
       await SensorHistory.create({
         userId: session.user.id,
         temp: Number(data.v3) || 0,      // v3 = Temperature
         humidity: Number(data.v4) || 0,  // v4 = Humidity
         pm25: Number(data.v6) || 0,      // v6 = PM2.5
         light: Number(data.v2) || 0,     // v2 = Light
         gas: Number(data.v1) || 0,       // v1 = Gas
       });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Blynk Error", error);
    return new NextResponse("Failed to fetch from Blynk", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { token, pin, value } = await request.json();

    if (!token || !pin) {
      return new NextResponse("Token and pin are required", { status: 400 });
    }

    // Blynk API: update?token={token}&{pin}={value}
    const url = `https://blynk.cloud/external/api/update?token=${token}&${pin}=${value}`;
    await axios.get(url);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Blynk Update Error", error);
    return new NextResponse("Failed to update Blynk", { status: 500 });
  }
}
