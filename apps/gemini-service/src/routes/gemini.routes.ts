import type { FastifyPluginAsync } from "fastify";
import config from "../config/config.js";

const geminiRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/api/gemini/connect", async (request, reply) => {
        
    })
}

export default geminiRoutes;