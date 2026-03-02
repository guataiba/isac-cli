import chalk from "chalk";
import { logLine } from "./tui.js";

export const log = {
  phase(num: string, label: string) {
    logLine(`\n  ${chalk.bold.dim(`Phase ${num}`)}: ${label}`);
  },

  success(msg: string) {
    logLine(`    ${chalk.green("\u2713")} ${msg}`);
  },

  error(msg: string) {
    logLine(`    ${chalk.red("\u2717")} ${msg}`);
  },

  warn(msg: string) {
    logLine(`    ${chalk.yellow("!")} ${msg}`);
  },

  info(msg: string) {
    logLine(`    ${chalk.dim(msg)}`);
  },

  divider() {
    logLine(`\n  ${"\u2500".repeat(37)}`);
  },

  summary(label: string, value: string) {
    logLine(`  ${chalk.dim(label + ":")} ${value}`);
  },

  elapsed(startMs: number) {
    const elapsed = Date.now() - startMs;
    const secs = Math.floor(elapsed / 1000);
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return mins > 0
      ? `${mins}m ${remainSecs}s`
      : `${remainSecs}s`;
  },
};
