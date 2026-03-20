import { NextResponse } from "next/server";
import axios from "axios";
import dbConnect from "../../../lib/dbConnect";
import SensorHistory from "../../../models/SensorHistory";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Token is required", { status: 400 });
  }

  try {
    const urls = [
      `https://blynk.cloud/external/api/get?token=${token}&v0`,
      `https://blynk.cloud/external/api/get?token=${token}&v1`,
      `https://blynk.cloud/external/api/get?token=${token}&v2`,
      `https://blynk.cloud/external/api/get?token=${token}&v3`,
      `https://blynk.cloud/external/api/get?token=${token}&v4`,
      `https://blynk.cloud/external/api/get?token=${token}&v5`,
      `https://blynk.cloud/external/api/get?token=${token}&v7`,
      `https://blynk.cloud/external/api/get?token=${token}&v10`,
      `https://blynk.cloud/external/api/get?token=${token}&v11`,
      `https://blynk.cloud/external/api/get?token=${token}&v12`,
      `https://blynk.cloud/external/api/get?token=${token}&v13`,
      `https://blynk.cloud/external/api/get?token=${token}&v14`,
      `https://blynk.cloud/external/api/get?token=${token}&v15`
    ];

    const responses = await Promise.all(
      urls.map(url => axios.get(url).catch(() => ({ data: null })))
    );

    const data = {
      v0: responses[0].data,
      v1: responses[1].data,
      v2: responses[2].data,
      v3: responses[3].data,
      v4: responses[4].data,
      v5: responses[5].data,
      v7: responses[6].data,
      v10: responses[7].data,
      v11: responses[8].data,
      v12: responses[9].data,
      v13: responses[10].data,
      v14: responses[11].data,
      v15: responses[12].data,
    };

    // Record history if session exists
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
       await dbConnect();
       await SensorHistory.create({
         userId: session.user.id,
         temp: Number(data.v0) || 0,
         humidity: Number(data.v1) || 0,
         pm25: Number(data.v3) || 0,
         light: Number(data.v4) || 0,
         gas: Number(data.v5) || 0,
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
