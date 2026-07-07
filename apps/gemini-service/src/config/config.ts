import "dotenv/config";

const required = [
    "PORT",
    "GRPC_PORT",
    "GEMINI_API_KEY",
    "NODE_ENV",
    "LIVEKIT_URL",
    "LIVEKIT_API_KEY",
    "LIVEKIT_SECRET_KEY",
] as const;

for (const key of required){
    if(!process.env[key]){
        console.error(`\n[Config] ❌ Missing required env var: ${key}`)
        console.error(`[Config]    Add it to your .env file and restart\n`)
        process.exit(1)
    }
}

export const config = {
    PORT: parseInt(process.env['PORT'] ?? '4003', 10),
    GRPC_PORT: parseInt(process.env['GRPC_PORT'] ?? '50051', 10),
    NODE_ENV: process.env['NODE_ENV'] ?? 'development',
    GEMINI_API_KEY: process.env['GEMINI_API_KEY'],
    LIVEKIT_URL: process.env['LIVEKIT_URL'],
    LIVEKIT_API_KEY: process.env['LIVEKIT_API_KEY'],
    LIVEKIT_SECRET_KEY: process.env['LIVEKIT_SECRET_KEY'],
} as const;

export default config;

