import mongoose from 'mongoose'

export interface ISession extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  token: string
  expiresAt: Date
  createdAt: Date
}

const SessionSchema = new mongoose.Schema<ISession>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const Session = mongoose.model<ISession>('Session', SessionSchema)
