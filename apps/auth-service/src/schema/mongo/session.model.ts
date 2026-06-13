import mongoose from 'mongoose'

export interface ISession extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  token: string
  ipAddress: string
  userAgent: string
  expiresAt: Date
  createdAt: Date
}

const SessionSchema = new mongoose.Schema<ISession>({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token:     { type: String, required: true, unique: true, index: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // auto-delete expired sessions
  createdAt: { type: Date, default: Date.now },
})

export const Session = mongoose.model<ISession>('Session', SessionSchema)