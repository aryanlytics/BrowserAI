import type { FastifyPluginAsync } from "fastify";
import { config } from "../config/config.js";
import { AccessToken } from "livekit-server-sdk";

const voiceRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/api/voice/temp-token", async (request, reply)=>{
        const roomName = "browser-ai-room";
        const participantIdentity = "aryan-browser-ai";
        const participantName = "Aryan";

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

export default voiceRoutes

