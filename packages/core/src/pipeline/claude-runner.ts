import { spawn } from "node:child_process";
import type { PhaseConfig, PhaseOutput } from "./types.js";

export async function runClaudePhase(
  config: PhaseConfig,
  cwd: string,
  resumeSessionId?: string,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseOutput> {
  const start = Date.now();

  const args = [
    "--print",
    "--output-format", "stream-json",
    "--verbose",
    "--max-turns", String(config.maxTurns ?? 50),
  ];

  // Set model if specified
  if (config.model) {
    args.push("--model", config.model);
  }

  // Set allowed tools
  if (config.allowedTools.length > 0) {
    args.push("--allowedTools", config.allowedTools.join(","));
  }

  // Resume session if provided
  if (resumeSessionId) {
    args.push("--resume", resumeSessionId);
  }

  // Pass prompt via -p flag
  args.push("-p", config.prompt);

  return new Promise<PhaseOutput>((resolve, reject) => {
    const timeout = config.timeout ?? 600_000; // 10 min default
    const startupTimeout = 120_000; // 120s for initial startup (MCP + Chrome can be slow)
    const activityTimeout = config.activityTimeout ?? 120_000; // rolling silence — API calls with thinking can take 60s+
    let sessionId = resumeSessionId ?? "";
    let lastResult = "";
    let isError = false;
    let costUsd: number | undefined;
    let gotActivity = false;

    const proc = spawn("claude", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    });

    // Overall timeout
    const timer = setTimeout(() => {
      proc.kill("SIGTERM");
      const hint = gotActivity
        ? ""
        : "\nHint: No events received — the CLI may be stuck on a prompt or MCP connection.";
      reject(new Error(
        `Phase "${config.name}" timed out after ${timeout}ms${hint}\nstderr: ${stderrOutput.slice(-500)}`,
      ));
    }, timeout);

    // Activity timeout — resets on each stdout chunk.
    // 120s covers both MCP startup and API response latency (thinking can take 60s+).
    const onStall = () => {
      proc.kill("SIGTERM");
      const stage = gotActivity ? activityTimeout : startupTimeout;
      reject(new Error(
        `Phase "${config.name}" — no output from CLI after ${stage / 1000}s. ` +
        `The subprocess may be waiting for input or failing to connect.\n` +
        `stderr: ${stderrOutput.slice(-500)}`,
      ));
    };
    let activityTimer = setTimeout(onStall, startupTimeout);

    let buffer = "";

    proc.stdout.on("data", (data: Buffer) => {
      gotActivity = true;
      clearTimeout(activityTimer);
      activityTimer = setTimeout(onStall, activityTimeout);
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const event = JSON.parse(line) as Record<string, unknown>;

          // Extract session ID from init or system events
          if (event.type === "system" && event.session_id) {
            sessionId = event.session_id as string;
          }

          // Extract result from result events
          if (event.type === "result") {
            lastResult = (event.result as string) ?? "";
            isError = (event.is_error as boolean) ?? false;
            costUsd = event.cost_usd as number | undefined;
            if (event.session_id) {
              sessionId = event.session_id as string;
            }
          }

          // Forward event to callback
          if (onEvent) {
            onEvent(event);
          }
        } catch {
          // Not valid JSON — skip
        }
      }
    });

    let stderrOutput = "";
    proc.stderr.on("data", (data: Buffer) => {
      stderrOutput += data.toString();
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      clearTimeout(activityTimer);

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer) as Record<string, unknown>;
          if (event.type === "result") {
            lastResult = (event.result as string) ?? lastResult;
            isError = (event.is_error as boolean) ?? isError;
            costUsd = event.cost_usd as number | undefined;
            if (event.session_id) {
              sessionId = event.session_id as string;
            }
          }
        } catch {
          // ignore
        }
      }

      if (code !== 0 && !lastResult) {
        reject(
          new Error(
            `Phase "${config.name}" exited with code ${code}.\nstderr: ${stderrOutput}`,
          ),
        );
        return;
      }

      resolve({
        result: lastResult,
        sessionId,
        costUsd,
        isError,
        durationMs: Date.now() - start,
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      clearTimeout(activityTimer);
      reject(
        new Error(
          `Failed to spawn claude for phase "${config.name}": ${err.message}`,
        ),
      );
    });
  });
}
