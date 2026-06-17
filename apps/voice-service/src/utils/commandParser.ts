// ─── Command parser ───────────────────────────────────────────────────────────
// Converts a plain-text voice command into structured browser actions.

export interface BrowserAction {
  type:    'navigate' | 'click' | 'type' | 'scroll' | 'search' | 'unknown'
  payload: Record<string, unknown>
}

export async function parseCommand(command: string): Promise<BrowserAction[]> {
  // TODO: use an LLM (GPT-4o, Gemini, etc.) to extract intent + parameters.
  // Example prompt structure:
  //
  // const response = await openai.chat.completions.create({
  //   model: 'gpt-4o',
  //   messages: [
  //     { role: 'system', content: SYSTEM_PROMPT },
  //     { role: 'user',   content: command },
  //   ],
  //   response_format: { type: 'json_object' },
  // })
  // return JSON.parse(response.choices[0].message.content).actions

  console.log('parseCommand called with:', command)
  return [{ type: 'unknown', payload: { raw: command } }]
}
