// apps/gemini-service/src/tools/agent-registry.ts
//
// Central registry of all available agents.
// Gemini sees the agents as high-level functions.
// LangGraph uses the registry to load the correct tools per agent.

export interface AgentDefinition {
  name: string                    // Function name Gemini will call
  description: string             // Gemini reads this to decide when to use it
  mcpServers: string[]            // Which MCP servers this agent can access
  systemPrompt: string            // Instructions for the inner LLM inside LangGraph
  maxRetries: number              // How many times to retry before giving up
}

export const AGENT_REGISTRY: Record<string, AgentDefinition> = {

  browser_agent: {
    name: 'browser_agent',
    description: 'Use this agent when the user wants to interact with a web browser. Examples: open a website, search YouTube, click a button, fill a form, take a screenshot, extract text from a page.',
    mcpServers: ['playwright'],
    systemPrompt: `You are a browser automation agent. You control a real Chromium browser using Playwright.
When given a task:
1. Break it into small steps (navigate, click, type, wait).
2. After each step, verify the result.
3. If a selector fails, use get_page_snapshot to get the current DOM and try a different selector.
4. When the task is complete, return a concise summary of what you did and any extracted data.`,
    maxRetries: 3,
  },

  email_agent: {
    name: 'email_agent',
    description: 'Use this agent when the user wants to send, read, or manage emails.',
    mcpServers: ['gmail'],
    systemPrompt: `You are an email agent. You can send, read, search, and manage emails using Gmail.
Always confirm the recipient and subject before sending.
Return a summary of what you did.`,
    maxRetries: 2,
  },

  database_agent: {
    name: 'database_agent',
    description: 'Use this agent when the user wants to query, insert, or update data in the database.',
    mcpServers: ['database'],
    systemPrompt: `You are a database agent. Execute SQL queries safely.
Never run DROP or DELETE without explicit user confirmation.
Return the query results in a readable format.`,
    maxRetries: 2,
  },
}

// Generate the Gemini function declarations from the registry.
// Gemini sees ONE function per agent, each taking a single "task" string argument.
export function getGeminiFunctionDeclarations() {
  return Object.values(AGENT_REGISTRY).map(agent => ({
    name: agent.name,
    description: agent.description,
    parameters: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'A natural language description of what the user wants this agent to do.',
        },
      },
      required: ['task'],
    },
  }))
}
