---
name: context7-policy
description: Use this when a task involves third-party libraries, frameworks, SDKs, package APIs, setup, configuration, migrations, or deprecated API errors. It tells the agent when to use Context7 and when not to.
compatibility: opencode
---

## Context7 Usage Rules

Use Context7 when:

- The task depends on external library/framework behavior.
- You need current API docs, setup steps, examples, migration guidance, or version-specific behavior.
- The user asks to make code align with latest docs.
- There is an error likely caused by deprecated or changed APIs.

Avoid Context7 when:

- The answer is available from the repository itself.
- The task is internal business logic.
- The task is simple formatting, local refactor, naming, or UI copy.

Efficient lookup process:

1. Read the relevant local files first.
2. Identify exact package name and version from package.json or lockfile.
3. Resolve the exact Context7 library ID if needed.
4. Query only the narrow topic needed.
5. Apply docs to the repo’s existing architecture, not as a full rewrite.
6. Summarize which docs influenced the change.
