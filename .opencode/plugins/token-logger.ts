import type { Plugin } from '@opencode-ai/plugin';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  createInitialState,
  recordTokenEvent,
  renderTokenUsageMarkdown,
} from './token-logger-core.js';

export const TokenLogger: Plugin = async ({ directory, client }) => {
  const logDir = join(directory, '.opencode');
  const logFile = join(logDir, 'token-usage.md');
  const state = createInitialState();

  await mkdir(logDir, { recursive: true });
  await writeFile(logFile, renderTokenUsageMarkdown(state));

  await client.app.log({
    body: {
      service: 'token-logger',
      level: 'info',
      message: 'Token logger initialized',
      extra: { logFile },
    },
  });

  return {
    event: async ({ event }) => {
      if (!recordTokenEvent(state, event)) return;
      await writeFile(logFile, renderTokenUsageMarkdown(state));
    },
  };
};
