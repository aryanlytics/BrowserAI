import mongoose from 'mongoose'

export interface ISession extends mongoose.Document {
  userId:    mongoose.Types.ObjectId
  token:     string
  ipAddress: string
  userAgent: string
  expiresAt: Date
  createdAt: Date
}

const SessionSchema = new mongoose.Schema<ISession>(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    token: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    ipAddress: {
      type:     String,
      required: true,
    },
    userAgent: {
      type:     String,
      required: true,
    },
    expiresAt: {
      type:     Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only need createdAt
  },
)

// TTL index — MongoDB auto-deletes expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Session = mongoose.model<ISession>('Session', SessionSchema)