/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import fs from 'fs';
import path from 'path';
import {setOutput} from '@actions/core';
import {GitClient, Log, bold, green, yellow} from '@angular/ng-dev';
import {select} from '@inquirer/prompts';
import yargs from 'yargs';
import {collectBenchmarkResults} from './results.mts';
import {
  type ResolvedTarget,
  findBenchmarkTargets,
  getTestlogPath,
  resolveTarget,
} from './targets.mts';
import {exec, projectDir} from './utils.mts';

const benchmarkTestFlags = [
  '--cache_test_results=no',
  '--color=yes',
  '--curses=no',
  // We may have RBE set up, but test should run locally on the same machine to
  // reduce fluctuation. Output streamed ensures that deps can build with RBE, but
  // tests run locally while also providing useful output for debugging.
  '--test_output=streamed',
  // In the comparison run, we create a hybrid workspace (main files + PR scripts/lockfiles).
  // This causes a lockfile mismatch, so we must allow Bazel to update the lockfile in memory.
  '--lockfile_mode=update',
];

await yargs(process.argv.slice(2))
  .command(
    'run-compare <compare-ref> [bazel-target]',
    'Runs a benchmark between two SHAs',
    (argv) =>
      argv
        .positional('compare-ref', {
          description: 'Comparison SHA',
          type: 'string',
          demandOption: true,
        })
        .positional('bazel-target', {description: 'Bazel target', type: 'string'}),
    (args) => runCompare(args.bazelTarget, args.compareRef),
  )
  .command(
    'run [bazel-target]',
    'Runs a benchmark',
    (argv) => argv.positional('bazel-target', {description: 'Bazel target', type: 'string'}),
    (args) => runBenchmarkCmd(args.bazelTarget),
  )
  .command(
    'prepare-for-github-action <comment-body>',
    false, // Do not show in help.
    (argv) => argv.positional('comment-body', {demandOption: true, type: 'string'}),
    (args) => prepareForGitHubAction(args.commentBody),
  )
  .demandCommand()
  .scriptName('$0')
  .help()
  .strict()
  .parseAsync();

/** Prompts for a benchmark target. */
async function promptForBenchmarkTarget(): Promise<string> {
  const targets = await findBenchmarkTargets();

  return await select({
    message: 'Select benchmark target to run:',
    choices: targets.map((t) => ({value: t, name: t})),
  });
}

/**
 * Prepares a benchmark comparison running via GitHub action. This command is
 * used by the GitHub action YML workflow and is responsible for extracting
 * e.g. command information or fetching/resolving Git refs of the comparison range.
 *
 * This is a helper used by the GitHub action to perform benchmark
 * comparisons. Commands follow the format of: `/benchmark-compare <sha> <target>`.
 */
async function prepareForGitHubAction(commentBody: string): Promise<void> {
  const matches = /\/[^ ]+ ([^ ]+) ([^ ]+)/.exec(commentBody);
  if (matches === null) {
    Log.error('Could not extract information from comment', commentBody);
    process.exit(1);
  }

  const git = await GitClient.get();
  const [_, compareRefRaw, benchmarkTarget] = matches;

  // We assume the PR is checked out and therefore `HEAD` is the PR head SHA.
  const prHeadSha = git.run(['rev-parse', 'HEAD']).stdout.trim();

  setOutput('benchmarkTarget', benchmarkTarget);
  setOutput('prHeadSha', prHeadSha);

  // Attempt to find the compare SHA. The commit may be either part of the
  // pull request, or might be a commit unrelated to the PR- but part of the
  // upstream repository. We attempt to fetch/resolve the SHA in both remotes.
  const compareRefResolve = git.runGraceful(['rev-parse', '--', compareRefRaw]);
  let compareRefSha = compareRefResolve.stdout.trim();
  if (compareRefSha === '' || compareRefResolve.status !== 0) {
    git.run(['fetch', '--depth=1', git.getRepoGitUrl(), compareRefRaw]);
    compareRefSha = git.run(['rev-parse', '--', 'FETCH_HEAD']).stdout.trim();
  }

  setOutput('compareSha', compareRefSha);
}

/** Runs a specified benchmark, or a benchmark selected via prompt. */
async function runBenchmarkCmd(bazelTargetRaw: string | undefined): Promise<void> {
  if (bazelTargetRaw === undefined) {
    bazelTargetRaw = await promptForBenchmarkTarget();
  }
  const bazelTarget = await resolveTarget(bazelTargetRaw);
  const testlogPath = await getTestlogPath(bazelTarget);

  await runBenchmarkTarget(bazelTarget);

  const workingDirResults = await collectBenchmarkResults(testlogPath);

  Log.info('\n\n\n');
  Log.info(bold(green('Results!')));
  Log.info(workingDirResults.summaryConsoleText);
}

/** Runs a benchmark Bazel target. */
async function runBenchmarkTarget(bazelTarget: ResolvedTarget, cwd?: string): Promise<void> {
  await exec('pnpm', ['bazel', 'test', bazelTarget, ...benchmarkTestFlags], cwd);
}

/**
 * Performs a comparison of benchmark results between the current
 * working stage and the comparison Git reference.
 */
async function runCompare(bazelTargetRaw: string | undefined, compareRef: string): Promise<void> {
  const git = await GitClient.get();
  const currentRef = git.getCurrentBranchOrRevision();

  if (bazelTargetRaw === undefined) {
    bazelTargetRaw = await promptForBenchmarkTarget();
  }

  const bazelTarget = await resolveTarget(bazelTargetRaw);
  const testlogPath = await getTestlogPath(bazelTarget);

  Log.log(green(`Test log path: ${testlogPath}`));

  // Run benchmark with the current working stage.
  await runBenchmarkTarget(bazelTarget);

  const workingDirResults = await collectBenchmarkResults(testlogPath);

  // Define isolated temporary workspace inside `dist/` so it is ignored by git.
  const tempDir = path.join(projectDir, 'dist/benchmark-compare-temp');
  let comparisonResults: any = null;

  try {
    Log.log(green(`Creating isolated workspace in ${tempDir}`));
    try {
      git.run(['worktree', 'remove', '--force', tempDir]);
    } catch (e) {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, {recursive: true, force: true});
      }
      try {
        git.run(['worktree', 'prune']);
      } catch (pruneError) {
        // Ignore prune errors
      }
    }

    // Ensure the comparison ref is fetched on the main repository if not already present.
    const hasCommit = git.runGraceful(['cat-file', '-e', `${compareRef}^{commit}`]).status === 0;
    if (!hasCommit) {
      Log.log(green(`Fetching comparison revision ${compareRef}...`));
      git.run(['fetch', git.getRepoGitUrl(), compareRef]);
    } else {
      Log.log(
        green(`Comparison revision ${compareRef} is already available locally. Skipping fetch.`),
      );
    }

    // Create isolated workspace instantly using native git worktree.
    Log.log(green(`Creating isolated worktree for ${compareRef} in ${tempDir}`));
    git.run(['worktree', 'add', '--detach', tempDir, compareRef]);

    // Copy the current PR's benchmark scripts and packages into the isolated workspace.
    // Explicitly exclude node_modules to avoid copying broken relative symlinks.
    Log.log(green('Copying PR benchmark scripts and packages into isolated workspace...'));
    const dirsToCopy = ['scripts/benchmarks', 'packages/benchpress'];
    for (const relDir of dirsToCopy) {
      const src = path.join(projectDir, relDir);
      const dest = path.join(tempDir, relDir);
      fs.rmSync(dest, {recursive: true, force: true});
      fs.cpSync(src, dest, {
        recursive: true,
        filter: (srcPath) => !srcPath.split(path.sep).includes('node_modules'),
      });
    }

    // Copy `.bazelrc.user` if it exists, otherwise create it.
    const bazelrcUser = path.join(projectDir, '.bazelrc.user');
    const tempBazelrcUser = path.join(tempDir, '.bazelrc.user');
    if (fs.existsSync(bazelrcUser)) {
      fs.copyFileSync(bazelrcUser, tempBazelrcUser);
    } else {
      fs.writeFileSync(tempBazelrcUser, '');
    }

    // Run pnpm install inside the isolated workspace.
    Log.log(green('Installing dependencies in isolated workspace...'));
    await exec('pnpm', ['install', '--no-frozen-lockfile', '--prefer-offline'], tempDir);

    // Run the benchmark on the comparison workspace.
    Log.log(green('Running benchmark in isolated workspace...'));
    await runBenchmarkTarget(bazelTarget, tempDir);

    // Resolve testlog path and collect results from the isolated workspace.
    Log.log(green('Collecting comparison results...'));
    const tempTestlogPath = await getTestlogPath(bazelTarget, tempDir);
    comparisonResults = await collectBenchmarkResults(tempTestlogPath);
  } finally {
    Log.log(green('Cleaning up isolated workspace...'));
    try {
      git.run(['worktree', 'remove', '--force', tempDir]);
    } catch (e) {
      Log.warn(`Failed to clean up isolated worktree: ${e}`);
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, {recursive: true, force: true});
      }
      try {
        git.run(['worktree', 'prune']);
      } catch (pruneError) {
        // Ignore prune errors
      }
    }
  }

  // If we are running in a GitHub action, expose the benchmark text
  // results as outputs. Useful if those are exposed as a GitHub comment then.
  if (process.env.GITHUB_ACTION !== undefined) {
    setOutput('comparisonResultsText', comparisonResults.summaryMarkdownText);
    setOutput('workingStageResultsText', workingDirResults.summaryMarkdownText);
  }

  Log.info('\n\n\n');
  Log.info(bold(green('Results!')));

  Log.info(bold(yellow(`Comparison reference (${compareRef}) results:`)), '\n');
  Log.info(comparisonResults.summaryConsoleText);

  Log.info(bold(yellow(`Working stage (${currentRef}) results:`)), '\n');
  Log.info(workingDirResults.summaryConsoleText);
}
