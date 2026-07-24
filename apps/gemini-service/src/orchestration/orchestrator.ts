// apps/gemini-service/src/orchestration/orchestrator.ts
//
// Bridges Gemini Live API WebSocket ↔ LangGraph.
// When Gemini sends a toolCall, this invokes the LangGraph main graph
// and sends the result back to Gemini as a tool_response frame.

import { mainGraph } from './graph.js'
import type { WebSocket } from 'ws'


export async function handleToolCall(
  ws: WebSocket,
  functionCall: { name: string; args: Record<string, any> },
): Promise<void> {
  const { name: agentName, args } = functionCall
  const task = args.task as string

  console.log(`[Orchestrator] Gemini called agent: ${agentName}`)
  console.log(`[Orchestrator] Task: "${task}"`)

  try {
    // Invoke the LangGraph main graph
    const finalState = await mainGraph.invoke({
      activeAgent: agentName,
      task: task,
      messages: [],
      context: {},
      errorCount: 0,
      lastError: '',
      finalResult: '',
      status: 'running',
    })

    console.log(`[Orchestrator] Agent finished with status: ${finalState.status}`)
    console.log(`[Orchestrator] Result: ${finalState.finalResult?.slice(0, 200)}`)

    // Send the result back to Gemini Live API as a tool_response
    ws.send(JSON.stringify({
      tool_response: {
        function_responses: [{
          name: agentName,
          response: {
            result: finalState.finalResult,
            status: finalState.status,
            context: finalState.context,
          },
        }],
      },
    }))

  } catch (error: any) {
    console.error(`[Orchestrator] Agent crashed:`, error.message)

    // Tell Gemini the agent failed so it can respond to the user
    ws.send(JSON.stringify({
      tool_response: {
        function_responses: [{
          name: agentName,
          response: {
            error: error.message,
            status: 'crashed',
          },
        }],
      },
    }))
  }
}
