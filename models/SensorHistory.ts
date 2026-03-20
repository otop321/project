import mongoose from "mongoose";

const SensorHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  temp: Number,
  humidity: Number,
  pm25: Number,
  light: Number,
  gas: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.SensorHistory || mongoose.model("SensorHistory", SensorHistorySchema);
