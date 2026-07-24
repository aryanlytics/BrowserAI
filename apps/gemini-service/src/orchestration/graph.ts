// apps/gemini-service/src/orchestration/graph.ts
//
// Main LangGraph StateGraph.
// Routes incoming agent requests to the correct agent subgraph.

import { StateGraph } from '@langchain/langgraph'
import { AgentState } from './state.js'
import { buildBrowserAgentGraph } from '../node/browser-agent.js'
import type { AgentStateType } from './state.js'

// Pre-compile agent subgraphs at startup
let browserAgent: ReturnType<typeof buildBrowserAgentGraph>

export function initializeGraph() {
  browserAgent = buildBrowserAgentGraph()
  console.log('[LangGraph] ✅ Agent subgraphs compiled')
}

// ─── Router Node ──────────────────────────────────────────────────────
// Looks at state.activeAgent and dispatches to the correct subgraph
async function routerNode(state: AgentStateType) {
  const { activeAgent, task } = state
  console.log(`[LangGraph] Routing to agent: ${activeAgent} with task: "${task}"`)

  let result: AgentStateType

  switch (activeAgent) {
    case 'browser_agent':
      result = await browserAgent.invoke({
        task,
        activeAgent,
        messages: [],
        context: state.context,
        errorCount: 0,
        lastError: '',
        finalResult: '',
        status: 'running',
      })
      break

    // case 'email_agent':
    //   result = await emailAgent.invoke({ ... })
    //   break

    default:
      return {
        finalResult: `Unknown agent: ${activeAgent}`,
        status: 'failed',
      }
  }

  // Extract the final answer from the subgraph result
  const lastMsg = result.messages[result.messages.length - 1]
  const finalText = lastMsg && 'content' in lastMsg
    ? String((lastMsg as any).content)
    : result.finalResult || 'Agent completed without a response.'

  return {
    finalResult: finalText,
    status: result.status || 'completed',
    context: result.context,
  }
}

// ─── Build the main graph ──────────────────────────────────────────────
const mainWorkflow = new StateGraph(AgentState)
  .addNode('router', routerNode)
  .addEdge('__start__', 'router')
  .addEdge('router', '__end__')

export const mainGraph = mainWorkflow.compile()
