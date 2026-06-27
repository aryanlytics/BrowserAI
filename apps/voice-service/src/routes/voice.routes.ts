import axios from "axios";
import { config } from "../config/config.js";
import type { FastifyPluginAsync } from "fastify";


const voiceRoutes: FastifyPluginAsync = async (fastify) => {
    // ─── TEMP TOKEN ───────────────────────────────────────────────────────────────
    fastify.post("/api/voice/temp-token", async (request, reply) => {
        try{
            const res = await axios.post(
                `https://mp.speechmatics.com/v1/api_keys?type=rt`,
                { ttl: 300 },
                {
                    headers: {
                        Authorization: `Bearer ${config.SPEECHMATICS_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return reply.status(200).send({
                token: res.data.key_value,
                expiresIn: 300,
            })
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const errText =
                    typeof err.response?.data === 'string'
                        ? err.response.data
                        : JSON.stringify(err.response?.data ?? err.message)

                request.log.error(`[Speechmatics] Failed to get token: ${errText}`)
            } else {
                request.log.error(err, 'Voice token error')
            }

            return reply.status(500).send({
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'Failed to request voice token',
            })
        }
    })
}
export default voiceRoutes