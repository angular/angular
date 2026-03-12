/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Script that can be used to compare the local `npm_package` snapshot artifact
 * with the snapshot artifact from GitHub at upstream `HEAD`.
 *
 * This is useful during the `rules_js` migration to verify the npm artifact
 * doesn't differ unexpectedly.
 *
 * Example command: pnpm diff-release-package @angular/cli
 */

import {GitClient} from '@angular/ng-dev';
import childProcess from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {glob} from 'tinyglobby';
import {parseArgs} from 'node:util';

// Do not remove `.git` as we use Git for comparisons later.
// Also preserve `uniqueId` as it's irrelevant for the diff and not included via Bazel.
// The `README.md` is also put together outside of Bazel, so ignore it too.
const SKIP_FILES = [/^README\.md$/, /^uniqueId$/, /\.map$/];

const {positionals, values: flags} = parseArgs({
  options: {
    write: {
      type: 'boolean',
      short: 'w',
      default: false,
    },
  },
  allowPositionals: true,
});
const packageName = positionals[0];
if (!packageName) {
  console.error('Expected package name to be specified.');
  process.exit(1);
}

try {
  await main(packageName);
} catch (e) {
  console.error(e);
  process.exitCode = 1;
}

async function main(packageName: string) {
  const bazel = process.env.BAZEL ?? 'bazel';
  const git = await GitClient.get();
  const targetDir = packageName;

  const snapshotRepoName = `angular/${packageName}-builds`;

  const tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), `diff-release-package-${snapshotRepoName.replace(/\//g, '_')}`),
  );
  try {
    console.info(`Cloning snapshot repo (${snapshotRepoName}) into ${tmpDir}..`);
    git.run(['clone', '--depth=1', `https://github.com/${snapshotRepoName}.git`, tmpDir]);
    console.info(`--> Cloned snapshot repo.`);

    // TODO: Remove --ignore_all_rc_files flag once a repository can be loaded in bazelrc during info
    // commands again. See https://github.com/bazelbuild/bazel/issues/25145 for more context.
    const bazelBinDir = childProcess
      .spawnSync(bazel, ['--ignore_all_rc_files', 'info', 'bazel-bin'], {
        shell: true,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'inherit'],
      })
      .stdout.trim();
    if (bazelBinDir === '') {
      throw new Error('Could not determine bazel-bin directory.');
    }

    const outputPath = path.join(bazelBinDir, 'packages/', targetDir, 'npm_package');

    // Delete old directory to avoid surprises, or stamping being outdated.
    await deleteDir(outputPath);

    childProcess.spawnSync(
      bazel,
      [
        'build',
        `//packages/${targetDir}:npm_package`,
        '--config=snapshot-build',
        '--nocheck_visibility',
      ],
      {
        shell: true,
        stdio: 'inherit',
        encoding: 'utf8',
      },
    );

    console.error('--> Built npm package with --config=snapshot-build');
    console.error(`--> Output: ${outputPath}`);

    const removeTasks: Promise<void>[] = [];
    for (const subentry of await glob('**/*', {
      dot: true,
      cwd: tmpDir,
      onlyFiles: true,
      ignore: ['.git'],
    })) {
      if (!SKIP_FILES.some((s) => s.test(subentry))) {
        continue;
      }

      removeTasks.push(fs.promises.rm(path.join(tmpDir, subentry), {maxRetries: 3}));
    }
    await Promise.all(removeTasks);

    // Stage all removed files that were skipped; to exclude them from the diff.
    git.run(['add', '-A'], {cwd: tmpDir});
    git.run(['commit', '--allow-empty', '-m', 'Delete skipped files for diff'], {cwd: tmpDir});

    // Remove all old content, so that e.g. potential file renames or new files are properly
    // detected.
    const removeAllOldContentTasks: Promise<void>[] = [];
    for (const subentry of await glob('**/*', {
      dot: true,
      cwd: tmpDir,
      onlyFiles: true,
      ignore: ['.git'],
    })) {
      removeAllOldContentTasks.push(fs.promises.rm(path.join(tmpDir, subentry), {maxRetries: 3}));
    }
    await Promise.all(removeAllOldContentTasks);

    const copyTasks: Promise<void>[] = [];
    for (const subentry of await glob('**/*', {
      dot: true,
      cwd: outputPath,
      onlyFiles: true,
      ignore: ['.git'],
    })) {
      if (SKIP_FILES.some((s) => s.test(subentry))) {
        continue;
      }

      copyTasks.push(
        fs.promises.cp(path.join(outputPath, subentry), path.join(tmpDir, subentry), {
          recursive: true,
        }),
      );
    }
    await Promise.all(copyTasks);

    git.run(['config', 'core.filemode', 'false'], {cwd: tmpDir});

    // Add all files so that new untracked files are also visible in the diff.
    git.run(['add', '-A'], {cwd: tmpDir});
    const diff = git.run(['diff', 'HEAD', flags.write ? '--no-color' : '--color'], {
      cwd: tmpDir,
    }).stdout;
    if (flags.write) {
      const outputFilePath = path.join(process.cwd(), `${packageName}.diff`);
      fs.writeFileSync(outputFilePath, diff, 'utf-8');
      console.info(`Saved diff to: ${outputFilePath}`);
    } else {
      console.info('\n\n----- Diff ------');
      console.info(diff);
    }
  } finally {
    await deleteDir(tmpDir);
  }
}

async function deleteDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  // Needed as Bazel artifacts are readonly and cannot be deleted otherwise.
  recursiveChmod(dirPath);
  await fs.promises.rm(dirPath, {recursive: true, force: true, maxRetries: 3});
}

function recursiveChmod(dirPath: string) {
  const stats = fs.statSync(dirPath);

  // Add user write permission to existing permissions.
  fs.chmodSync(dirPath, stats.mode | 0o200);

  if (stats.isDirectory()) {
    for (const file of fs.readdirSync(dirPath)) {
      recursiveChmod(path.join(dirPath, file));
    }
  }
}
