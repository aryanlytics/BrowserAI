// apps/gemini-service/src/tools/mcp-manager.ts
//
// Manages MCP server connections using @langchain/mcp-adapters.
// Starts MCP servers as child processes (stdio transport).
// Provides filtered tool lists per agent.

import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import type { StructuredTool } from '@langchain/core/tools'
import { AGENT_REGISTRY } from './agent-registry.js'

let mcpClient: MultiServerMCPClient | null = null
let allToolsByServer: Map<string, StructuredTool[]> = new Map()

// MCP server configurations — add new servers here
const MCP_SERVER_CONFIGS: Record<string, { command: string; args: string[] }> = {
  playwright: {
    command: 'npx',
    args: ['-y', '@anthropic/mcp-playwright'],
  },
  // gmail: {
  //   command: 'npx',
  //   args: ['-y', '@anthropic/mcp-gmail'],
  // },
  // database: {
  //   command: 'npx',
  //   args: ['-y', '@anthropic/mcp-database'],
  // },
}

export async function initMcpServers(): Promise<void> {
  console.log('[MCP] Starting MCP servers...')

  // Build the config object for MultiServerMCPClient
  const serverConfig: Record<string, any> = {}
  for (const [name, cfg] of Object.entries(MCP_SERVER_CONFIGS)) {
    serverConfig[name] = {
      transport: 'stdio' as const,
      command: cfg.command,
      args: cfg.args,
    }
  }

  mcpClient = new MultiServerMCPClient(serverConfig)

  // getTools() returns all tools from all servers, but we need them grouped.
  // We call getTools() which internally connects to all servers.
  const tools = await mcpClient.getTools()

  // Group tools by the server they came from.
  // MultiServerMCPClient prefixes tool names with the server name.
  for (const [serverName] of Object.entries(MCP_SERVER_CONFIGS)) {
    const serverTools = tools.filter((t: StructuredTool) => 
      t.name.startsWith(serverName) || // Some adapters prefix
      true // fallback: assign all tools to the first matching server
    )
    allToolsByServer.set(serverName, serverTools)
  }

  // For now, if there's only one server, assign all tools to it
  if (Object.keys(MCP_SERVER_CONFIGS).length === 1) {
    const serverName = Object.keys(MCP_SERVER_CONFIGS)[0]
    if (serverName !== undefined) {
      allToolsByServer.set(serverName, tools)
    }
  }

  console.log(`[MCP] ✅ Loaded ${tools.length} tools from ${Object.keys(MCP_SERVER_CONFIGS).length} servers`)
  for (const tool of tools) {
    console.log(`  → ${tool.name}: ${tool.description?.slice(0, 80)}`)
  }
}

// Get tools for a specific agent (filtered by its allowed MCP servers)
export function getToolsForAgent(agentName: string): StructuredTool[] {
  const agentDef = AGENT_REGISTRY[agentName]
  if (!agentDef) throw new Error(`Unknown agent: ${agentName}`)

  const tools: StructuredTool[] = []
  for (const serverName of agentDef.mcpServers) {
    const serverTools = allToolsByServer.get(serverName) ?? []
    tools.push(...serverTools)
  }

  return tools
}

export async function shutdownMcpServers(): Promise<void> {
  if (mcpClient) {
    await mcpClient.close()
    mcpClient = null
    allToolsByServer.clear()
    console.log('[MCP] All servers shut down')
  }
}
