import type { FastifyPluginAsync } from "fastify";
import { config } from "../config/config.js";
import { AccessToken } from "livekit-server-sdk";

const voiceRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/api/voice/temp-token", async (request, reply)=>{
        const token = new AccessToken(config.LIVEKIT_API_KEY, config.LIVEKIT_SECRET_KEY);
        
    
  })
}

export default voiceRoutes

