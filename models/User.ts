import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  blynkToken?: string;
  blynkTemplateId?: string;
  role: "user" | "admin";
  pm25_limit?: number;
  temp_limit?: number;
  humidity_limit?: number;
  gas_limit?: number;
  notification_enabled?: boolean;
  username?: string;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  blynkToken: {
    type: String,
    required: false,
  },
  blynkTemplateId: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  pm25_limit: { type: Number, default: 50 },
  temp_limit: { type: Number, default: 40 },
  humidity_limit: { type: Number, default: 80 },
  gas_limit: { type: Number, default: 500 },
  notification_enabled: { type: Boolean, default: true },
  username: { type: String, unique: false, required: false },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
