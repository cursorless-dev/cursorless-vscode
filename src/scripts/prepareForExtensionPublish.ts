import * as semver from "semver";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";

const execAsync = promisify(exec);

/**
 * Prepares the directory for extension publication. Does the following:
 *
 * 1. Changes the package version so that the patch number is the number of
 *    commits on the current branch
 * 2. Writes a file called `build-info.json` for provenance
 */
async function main() {
  const { major, minor } = semver.parse(process.env.npm_package_version)!;

  const commitCount = await runCommand("git rev-list --count head");

  const newVersion = `${major}.${minor}.${commitCount}`;

  await runCommand(`npm --no-git-tag-version version ${newVersion}`);

  const repository = process.env["GITHUB_REPOSITORY"];
  const runId = process.env["GITHUB_RUN_ID"];

  await writeFile(
    "build-info.json",
    JSON.stringify({
      gitSha: strip(await runCommand("git rev-parse HEAD")),
      buildUrl: `https://github.com/${repository}/actions/runs/${runId}`,
    })
  );
}

/**
 * Strips leading and trailing whitespace from string
 *
 * From https://stackoverflow.com/a/1418059
 * @param str The string to process
 * @returns The stripped string
 */
function strip(str: string): string {
  return str.replace(/^\s+|\s+$/g, "");
}

async function runCommand(command: string) {
  const { stdout, stderr } = await execAsync(command);

  if (stderr) {
    throw new Error(stderr);
  }

  return stdout;
}

main();
