import { execFileSync } from "node:child_process";

export type GitMeta = { branch: string; shortSha: string };

const gitOpts = { encoding: "utf-8" as const, cwd: process.cwd() };

export function readGitMeta(): GitMeta {
  try {
    const branch = execFileSync(
      "git",
      ["rev-parse", "--abbrev-ref", "HEAD"],
      { ...gitOpts, stdio: ["ignore", "pipe", "ignore"] },
    ).trim();

    const shortSha = execFileSync(
      "git",
      ["rev-parse", "--short", "HEAD"],
      { ...gitOpts, stdio: ["ignore", "pipe", "ignore"] },
    ).trim();

    return { branch, shortSha };
  } catch {
    return { branch: "", shortSha: "" };
  }
}
