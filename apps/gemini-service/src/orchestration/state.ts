// apps/gemini-service/src/orchestration/state.ts
//
// LangGraph state definition.
// The state is GENERIC — agents can write arbitrary key-value data
// into the `context` map as the workflow evolves.

import { Annotation, MessagesAnnotation } from '@langchain/langgraph'

export const AgentState = Annotation.Root({
  // The full message history (HumanMessage, AIMessage, ToolMessage).
  // LangGraph's MessagesAnnotation automatically appends new messages.
  ...MessagesAnnotation.spec,

  // Which agent is currently executing
  activeAgent: Annotation<string>({
    reducer: (_old, newVal) => newVal,
    default: () => '',
  }),

  // The original task description from Gemini
  task: Annotation<string>({
    reducer: (_old, newVal) => newVal,
    default: () => '',
  }),

  // Dynamic key-value store. Agents can write any data here.
  // Example: { "found_url": "https://youtube.com/watch?v=123", "page_title": "Avengers" }
  context: Annotation<Record<string, any>>({
    reducer: (oldCtx, newCtx) => ({ ...oldCtx, ...newCtx }),
    default: () => ({}),
  }),

  // Error tracking for retry logic
  errorCount: Annotation<number>({
    reducer: (old, delta) => old + delta,
    default: () => 0,
  }),

  lastError: Annotation<string>({
    reducer: (_old, newVal) => newVal,
    default: () => '',
  }),

  // Final result to send back to Gemini
  finalResult: Annotation<string>({
    reducer: (_old, newVal) => newVal,
    default: () => '',
  }),

  // Status flag: "running" | "completed" | "failed"
  status: Annotation<string>({
    reducer: (_old, newVal) => newVal,
    default: () => 'running',
  }),
})

export type AgentStateType = typeof AgentState.State
