function numberFrom(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return 0;
}

function formatNumber(value) {
  return value.toLocaleString('en-US');
}

function formatCost(value) {
  if (!value) return '-';
  return `$${value.toFixed(6)}`;
}

function totalTokens(tokens) {
  return tokens.input + tokens.output + tokens.reasoning + tokens.cacheRead + tokens.cacheWrite;
}

function messageTotalTokens(message) {
  return message.input + message.output + message.reasoning + message.cacheRead + message.cacheWrite;
}

function sessionLabel(session) {
  if (session.provider && session.model) return `${session.provider}/${session.model}`;
  return session.model || session.provider || 'unknown';
}

function getSession(state, sessionID) {
  const id = sessionID || 'unknown';
  let session = state.sessions.get(id);
  if (!session) {
    session = {
      id,
      model: 'unknown',
      provider: '',
      agent: 'unknown',
      messages: new Map(),
      lastUpdatedAt: state.startedAt,
    };
    state.sessions.set(id, session);
  }
  return session;
}

export function createInitialState(startedAt = new Date().toISOString()) {
  return {
    startedAt,
    sessions: new Map(),
  };
}

export function recordTokenEvent(state, event, now = new Date().toISOString()) {
  const properties = event?.properties ?? event?.data ?? event ?? {};

  if (event?.type === 'session.idle') {
    getSession(state, properties.sessionID).lastUpdatedAt = now;
    return true;
  }

  if (event?.type !== 'message.updated') return false;

  const info = properties.info ?? properties.message ?? {};
  if (info.role !== 'assistant') return false;

  const session = getSession(state, properties.sessionID ?? info.sessionID);
  session.model = info.modelID ?? info.model ?? session.model;
  session.provider = info.providerID ?? info.provider ?? session.provider;
  session.agent = info.agent ?? session.agent;
  session.lastUpdatedAt = now;

  const messageID = info.id ?? properties.messageID ?? `${session.id}:${session.messages.size + 1}`;
  session.messages.set(messageID, {
    id: messageID,
    model: info.modelID ?? info.model ?? session.model,
    provider: info.providerID ?? info.provider ?? session.provider,
    input: numberFrom(info.tokens?.input, info.usage?.input, info.usage?.inputTokens, info.usage?.input_tokens),
    output: numberFrom(info.tokens?.output, info.usage?.output, info.usage?.outputTokens, info.usage?.output_tokens),
    reasoning: numberFrom(info.tokens?.reasoning, info.usage?.reasoning, info.usage?.reasoningTokens, info.usage?.reasoning_tokens),
    cacheRead: numberFrom(info.tokens?.cache?.read, info.usage?.cacheReadInputTokens, info.usage?.cache_read_input_tokens),
    cacheWrite: numberFrom(info.tokens?.cache?.write, info.usage?.cacheCreationInputTokens, info.usage?.cache_creation_input_tokens),
    inputCost: numberFrom(info.usage?.inputCost, info.usage?.input_cost, info.usage?.promptCost, info.usage?.prompt_cost),
    outputCost: numberFrom(info.usage?.outputCost, info.usage?.output_cost, info.usage?.completionCost, info.usage?.completion_cost),
    cost: numberFrom(info.cost, info.usage?.cost, info.usage?.totalCost, info.usage?.total_cost),
  });

  return true;
}

export function summarizeSession(session) {
  const messages = Array.from(session.messages.values());
  const totals = messages.reduce(
    (acc, message) => ({
      input: acc.input + message.input,
      output: acc.output + message.output,
      reasoning: acc.reasoning + message.reasoning,
      cacheRead: acc.cacheRead + message.cacheRead,
      cacheWrite: acc.cacheWrite + message.cacheWrite,
      inputCost: acc.inputCost + message.inputCost,
      outputCost: acc.outputCost + message.outputCost,
      cost: acc.cost + message.cost,
    }),
    { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, inputCost: 0, outputCost: 0, cost: 0 },
  );

  return {
    id: session.id,
    model: session.model,
    provider: session.provider,
    agent: session.agent,
    messageCount: messages.length,
    lastUpdatedAt: session.lastUpdatedAt,
    ...totals,
    total: totalTokens(totals),
  };
}

export function renderTokenUsageMarkdown(state, updatedAt = new Date().toISOString()) {
  const sessions = Array.from(state.sessions.values()).map(summarizeSession);
  const active = sessions[sessions.length - 1];
  const aggregate = sessions.reduce(
    (acc, session) => ({
      input: acc.input + session.input,
      output: acc.output + session.output,
      reasoning: acc.reasoning + session.reasoning,
      cacheRead: acc.cacheRead + session.cacheRead,
      cacheWrite: acc.cacheWrite + session.cacheWrite,
      total: acc.total + session.total,
      inputCost: acc.inputCost + session.inputCost,
      outputCost: acc.outputCost + session.outputCost,
      cost: acc.cost + session.cost,
      messageCount: acc.messageCount + session.messageCount,
    }),
    { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0, inputCost: 0, outputCost: 0, cost: 0, messageCount: 0 },
  );

  const sessionRows = sessions.length
    ? sessions.map((session) => `| \`${session.id}\` | \`${sessionLabel(session)}\` | \`${session.agent}\` | ${formatNumber(session.messageCount)} | ${formatNumber(session.input)} | ${formatCost(session.inputCost)} | ${formatNumber(session.output)} | ${formatCost(session.outputCost)} | ${formatNumber(session.total)} | ${formatCost(session.cost)} | ${session.lastUpdatedAt} |`).join('\n')
    : '| - | - | - | 0 | 0 | - | 0 | - | 0 | - | - |';

  const completionRows = Array.from(state.sessions.values()).flatMap((session) =>
    Array.from(session.messages.values()).map((message) => `| \`${session.id}\` | \`${message.id}\` | \`${sessionLabel(message)}\` | ${formatNumber(message.input)} | ${formatCost(message.inputCost)} | ${formatNumber(message.output)} | ${formatCost(message.outputCost)} | ${formatNumber(messageTotalTokens(message))} | ${formatCost(message.cost)} |`),
  );

  const promptCompletionRows = completionRows.length
    ? completionRows.join('\n')
    : '| - | - | - | 0 | - | 0 | - | 0 | - |';

  return `# OpenCode Token Usage

Generated by \`.opencode/plugins/token-logger.ts\`.

## Session Summary

| Field | Value |
|---|---:|
| Started | ${state.startedAt} |
| Last updated | ${updatedAt} |
| Session | ${active ? `\`${active.id}\`` : '`unknown`'} |
| Model | ${active ? `\`${sessionLabel(active)}\`` : '`unknown`'} |
| Agent | ${active ? `\`${active.agent}\`` : '`unknown`'} |
| Assistant messages | ${formatNumber(aggregate.messageCount)} |
| Input tokens | ${formatNumber(aggregate.input)} |
| Cache read tokens | ${formatNumber(aggregate.cacheRead)} |
| Cache write tokens | ${formatNumber(aggregate.cacheWrite)} |
| Output tokens | ${formatNumber(aggregate.output)} |
| Reasoning tokens | ${formatNumber(aggregate.reasoning)} |
| Total tokens | ${formatNumber(aggregate.total)} |
| Estimated cost | ${formatCost(aggregate.cost)} |

## Sessions

| Session | Model | Agent | Assistant messages | Input tokens | Input cost | Output tokens | Output cost | Total tokens | Estimated cost | Last update |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
${sessionRows}

## Prompt Completions

| Session | Message | Model | Input tokens | Input cost | Output tokens | Output cost | Total tokens | Estimated cost |
|---|---|---|---:|---:|---:|---:|---:|---:|
${promptCompletionRows}
`;
}
