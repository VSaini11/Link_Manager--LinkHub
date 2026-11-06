import mongoose, { Schema, models, model } from "mongoose";

export interface ILead extends mongoose.Document {
  linkId: mongoose.Types.ObjectId;
  userId: string;
  contact: string; // email or phone number
  name?: string;
  country?: string;
  deviceType?: string;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>({
  linkId: { type: Schema.Types.ObjectId, ref: "Link", required: true },
  userId: { type: String, required: true },
  contact: { type: String, required: true },
  name: { type: String, default: "" },
  country: { type: String, default: "Unknown" },
  deviceType: { type: String, default: "Desktop" },
  createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.Lead) {
  delete mongoose.models.Lead;
}

export default models.Lead || model<ILead>("Lead", LeadSchema);

