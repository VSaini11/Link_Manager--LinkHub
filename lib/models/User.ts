// lib/models/User.ts
import mongoose, { Schema, model, models, InferSchemaType } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export type IUser = InferSchemaType<typeof UserSchema>;

const User = models.User || model<IUser>("User", UserSchema);
export default User;

