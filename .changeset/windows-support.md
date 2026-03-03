---
"@guataiba/isac-core": patch
---

fix: Windows compatibility for Claude CLI spawning

- Resolve the actual `cli.js` entry point on Windows instead of relying on POSIX shell shims that `child_process.spawn` cannot execute
- Strip the `CLAUDECODE` environment variable from child processes to allow running ISAC from within a Claude Code session
