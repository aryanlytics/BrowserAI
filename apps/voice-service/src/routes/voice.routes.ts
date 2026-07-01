import type { FastifyPluginAsync } from "fastify";
import { config } from "../config/config.js";
import { AccessToken } from "livekit-server-sdk";

const voiceRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/api/voice/temp-token", async (request, reply)=>{
        try {
            const token = await fastify.post(config.LIVEKIT_URL + "/room-tokens", {
                headers: {
                    "Authorization": `Bearer ${config.LIVEKIT_API_KEY}`
                }
            })
            
        } catch (error) {
            
        }    
    })
}

export default voiceRoutes

