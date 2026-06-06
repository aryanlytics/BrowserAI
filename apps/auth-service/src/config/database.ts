import mongoose from 'mongoose'
import { Redis } from 'ioredis'
import { config } from './config.js'

// ─── MongoDB ──────────────────────────────────────────────────────────────────

export async function connectMongo(): Promise<void> {
  try {
    await mongoose.connect(config.MONGO_URL, {
      serverSelectionTimeoutMS: 8000,
    })
    console.log('[MongoDB] ✅ Connected')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[MongoDB] ❌ Failed to connect — ${message}`)
    console.error('[MongoDB]    Check your MONGO_URL in .env')
  }
}

// ─── Redis ────────────────────────────────────────────────────────────────────

export const redis = new Redis(config.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
})

redis.on('error', (err) => {
  console.error(`[Redis] ❌ Connection error — ${err.message}`)
})

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect()
    console.log('[Redis]   ✅ Connected')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[Redis]   ❌ Failed to connect — ${message}`)
    console.error('[Redis]      Check your REDIS_URL in .env')
  }
}

// ─── Connect all ──────────────────────────────────────────────────────────────
//     Runs both in parallel. One failing does NOT stop the other.

export async function connectDatabases(): Promise<void> {
  console.log('\n[DB] Connecting...')
  await Promise.allSettled([
    connectMongo(),
    connectRedis(),
  ])
  console.log()
}