import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialState,
  recordTokenEvent,
  renderTokenUsageMarkdown,
} from './token-logger-core.js';

test('renders one session summary and deduplicates repeated message updates', () => {
  const state = createInitialState('2026-05-07T00:00:00.000Z');

  const updateEvent = {
    type: 'message.updated',
    properties: {
      sessionID: 'ses_123',
      info: {
        id: 'msg_1',
        sessionID: 'ses_123',
        role: 'assistant',
        modelID: 'gpt-5.5',
        providerID: 'openai',
        agent: 'general',
        cost: 0.012345,
        usage: {
          inputCost: 0.001,
          outputCost: 0.002,
        },
        tokens: {
          input: 100,
          output: 20,
          reasoning: 5,
          cache: { read: 30, write: 10 },
        },
      },
    },
  };

  recordTokenEvent(state, updateEvent);
  recordTokenEvent(state, updateEvent);
  recordTokenEvent(state, { type: 'session.idle', properties: { sessionID: 'ses_123' } });

  const markdown = renderTokenUsageMarkdown(state, '2026-05-07T00:01:00.000Z');

  assert.equal((markdown.match(/## Session Summary/g) ?? []).length, 1);
  assert.match(markdown, /`ses_123`/);
  assert.match(markdown, /`openai\/gpt-5\.5`/);
  assert.match(markdown, /\| Assistant messages \| 1 \|/);
  assert.match(markdown, /\| Input tokens \| 100 \|/);
  assert.match(markdown, /\| Cache read tokens \| 30 \|/);
  assert.match(markdown, /\| Cache write tokens \| 10 \|/);
  assert.match(markdown, /\| Total tokens \| 165 \|/);
  assert.match(markdown, /\| Session \| Model \| Agent \| Assistant messages \| Input tokens \| Input cost \| Output tokens \| Output cost \| Total tokens \| Estimated cost \| Last update \|/);
  assert.match(markdown, /\| `ses_123` \| `openai\/gpt-5\.5` \| `general` \| 1 \| 100 \| \$0\.001000 \| 20 \| \$0\.002000 \| 165 \| \$0\.012345 \|/);
  assert.match(markdown, /## Prompt Completions/);
  assert.match(markdown, /\| Session \| Message \| Model \| Input tokens \| Input cost \| Output tokens \| Output cost \| Total tokens \| Estimated cost \|/);
  assert.match(markdown, /\| `ses_123` \| `msg_1` \| `openai\/gpt-5\.5` \| 100 \| \$0\.001000 \| 20 \| \$0\.002000 \| 165 \| \$0\.012345 \|/);
});
