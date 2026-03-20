import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "../../../../lib/dbConnect";
import SensorHistory from "../../../../models/SensorHistory";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    
    // Get last 24 hours of data or last 50 points
    const history = await SensorHistory.find({ userId: session.user.id })
      .sort({ timestamp: -1 })
      .limit(50);

    return NextResponse.json(history.reverse());
  } catch (error: unknown) {
    console.error("History Error", error);
    return new NextResponse("Failed to fetch history", { status: 500 });
  }
}
