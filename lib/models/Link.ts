import mongoose, { Schema, models, model } from "mongoose";

export interface ILink extends mongoose.Document {
  userId: string;
  originalUrl: string;
  customName: string;
  shortUrl: string;
  clicks: number;
  createdAt: Date;
}

const LinkSchema = new Schema<ILink>({
  userId: { type: String, required: true },
  originalUrl: { type: String, required: true },
  customName: { type: String },
  shortUrl: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default models.Link || model<ILink>("Link", LinkSchema);
