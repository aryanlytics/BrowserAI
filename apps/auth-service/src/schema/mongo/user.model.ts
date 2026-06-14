import mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
  name:          string
  email:         string
  passwordHash:  string
  emailVerified: boolean
  createdAt:     Date
  updatedAt:     Date
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
      index:     true,
    },
    passwordHash: {
      type:     String,
      required: true,
      select:   false, // never returned in queries unless explicitly asked
    },
    emailVerified: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

export const User = mongoose.model<IUser>('User', UserSchema)
