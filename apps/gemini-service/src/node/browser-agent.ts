// apps/gemini-service/src/node/browser-agent.ts
//
// Browser Agent subgraph.
// Uses a secondary LLM (Gemini 2.5 Flash) to reason about browser actions.
// LangChain's ToolNode handles MCP tool execution.

import { StateGraph } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import { AgentState } from '../orchestration/state.js'
import { AGENT_REGISTRY } from '../tools/agent-registry.js'
import { getToolsForAgent } from '../tools/mcp-manager.js'
import type { AgentStateType } from '../orchestration/state.js'

export function buildBrowserAgentGraph() {
  const agentDef = AGENT_REGISTRY['browser_agent']
  const tools = getToolsForAgent('browser_agent')

  // The inner LLM — this is NOT Gemini Live. This is a standard chat model
  // that LangGraph uses to decide which MCP tool to call next.
  const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY,
  }).bindTools(tools)

  // ─── Agent Node: LLM decides next action ─────────────────────────
  async function agentNode(state: AgentStateType) {
    // Check retry limit
    if (state.errorCount >= agentDef.maxRetries) {
      return {
        finalResult: `Failed after ${state.errorCount} attempts. Last error: ${state.lastError}`,
        status: 'failed',
      }
    }

    // Build the message list for the inner LLM
    const messages = [
      new SystemMessage(agentDef.systemPrompt),
      new HumanMessage(`Task: ${state.task}`),
      ...state.messages,
    ]

    const response = await llm.invoke(messages)

    return { messages: [response] }
  }

  // ─── Tool Node: Executes MCP tools via LangChain ──────────────────
  const toolNode = new ToolNode(tools)

  // Wrapped tool node that catches errors and records them in state
  async function safeToolNode(state: AgentStateType) {
    try {
      const result = await toolNode.invoke(state)
      return result
    } catch (error: any) {
      return {
        lastError: error.message,
        errorCount: 1,  // +1 via reducer
        messages: [{
          role: 'tool',
          content: `ERROR: ${error.message}`,
          name: 'error_handler',
        }],
      }
    }
  }

  // ─── Router: Should we call a tool, or are we done? ───────────────
  function shouldContinue(state: AgentStateType): string {
    if (state.status === 'failed') return '__end__'

    const lastMsg = state.messages[state.messages.length - 1]

    // If the LLM wants to call a tool, go to tools node
    if (lastMsg && 'tool_calls' in lastMsg && (lastMsg as any).tool_calls?.length > 0) {
      return 'tools'
    }

    // Otherwise the LLM returned a text answer — we're done
    // Extract the final text as the result
    const content = lastMsg && 'content' in lastMsg ? String((lastMsg as any).content) : ''
    return '__end__'
  }

  // ─── Build the subgraph ────────────────────────────────────────────
  const workflow = new StateGraph(AgentState)
    .addNode('agent', agentNode)
    .addNode('tools', safeToolNode)
    .addEdge('__start__', 'agent')
    .addConditionalEdges('agent', shouldContinue)
    .addEdge('tools', 'agent')  // After tool execution, ALWAYS loop back to agent

  return workflow.compile()
}
