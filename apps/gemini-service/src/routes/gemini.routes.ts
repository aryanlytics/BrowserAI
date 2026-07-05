import type { FastifyPluginAsync } from "fastify";
import config from "../config/config.js";
import { Room, AccessToken} from "livekit-server-sdk";

const geminiRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/api/gemini/connect", async (request, reply) => {
        const roomName = "browser-ai-room";
        const participantIdentity = "gemini-browser-ai";
        const participantName = "Gemini Agent";

        const at = new AccessToken(
        config.LIVEKIT_API_KEY,
        config.LIVEKIT_SECRET_KEY,
        {
            identity: participantIdentity,
            name: participantName,
        }
        );

        
        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        const token = await at.toJwt();
    
        return {
        serverUrl: config.LIVEKIT_URL,
        token,
        };
        
    })
}

export default geminiRoutes;