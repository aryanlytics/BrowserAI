// Next.js automatically loads .env files and exposes NEXT_PUBLIC_* variables
// to both the server and the browser — no dotenv import needed here.

export const config = {
  apiGatewayUrl:
    process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000',
} as const