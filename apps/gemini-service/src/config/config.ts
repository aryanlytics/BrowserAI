import "dotenv/config";

const required = [
    "PORT",
    "GEMINI_API_KEY",
    "NODE_ENV",
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
    NODE_ENV: process.env['NODE_ENV'] ?? 'development',
    GEMINI_API_KEY: process.env['GEMINI_API_KEY'],
} as const;

export default config;
