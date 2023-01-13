/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {execSync} from 'child_process';
import {join, dirname} from 'path';
import {BuiltPackage} from '@angular/ng-dev';
import {fileURLToPath} from 'url';
import sh from 'shelljs';

// ShellJS should exit if a command fails.
sh.set('-e');

/** Path to the project directory. */
export const projectDir = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** Command that runs Bazel. */
export const bazelCmd = process.env.BAZEL || `yarn -s bazel`;

/** Name of the Bazel tag that will be used to find release package targets. */
const releaseTargetTag = 'release-with-framework';

/** Command that queries Bazel for all release package targets. */
const queryPackagesCmd =
  `${bazelCmd} query --output=label "attr('tags', '\\[.*${releaseTargetTag}.*\\]', //packages/...) ` +
  `intersect kind('ng_package|pkg_npm', //packages/...)"`;

/** Path for the default distribution output directory. */
const defaultDistPath = join(projectDir, 'dist/packages-dist');

/** Builds the release packages for NPM. */
export function performNpmReleaseBuild(): BuiltPackage[] {
  return buildReleasePackages(defaultDistPath, /* isSnapshotBuild */ false);
}

/**
 * Builds the release packages as snapshot build. This means that the current
 * Git HEAD SHA is included in the version (for easier debugging and back tracing).
 */
export function performDefaultSnapshotBuild(): BuiltPackage[] {
  return buildReleasePackages(defaultDistPath, /* isSnapshotBuild */ true, [
    // For snapshot builds, the Bazel package is still built. We want to have
    // GitHub snapshot builds for it.
    '//packages/bazel:npm_package',
  ]);
}

/**
 * Builds the release packages with the given compile mode and copies
 * the package output into the given directory.
 */
function buildReleasePackages(
  distPath: string,
  isSnapshotBuild: boolean,
  additionalTargets: string[] = []
): BuiltPackage[] {
  console.info('######################################');
  console.info('  Building release packages...');
  console.info('######################################');

  // List of targets to build. e.g. "packages/core:npm_package", or "packages/forms:npm_package".
  const targets = exec(queryPackagesCmd, true).split(/\r?\n/).concat(additionalTargets);
  const packageNames = getPackageNamesOfTargets(targets);
  const bazelBinPath = exec(`${bazelCmd} info bazel-bin`, true);
  const getBazelOutputPath = (pkgName: string) =>
    join(bazelBinPath, 'packages', pkgName, 'npm_package');
  const getDistPath = (pkgName: string) => join(distPath, pkgName);

  // Build with "--config=release" or `--config=snapshot-build` so that Bazel
  // runs the workspace stamping script. The stamping script ensures that the
  // version placeholder is populated in the release output.
  const stampConfigArg = `--config=${isSnapshotBuild ? 'snapshot-build' : 'release'}`;

  // Walk through each release package and clear previous "npm_package" outputs. This is
  // a workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1219. We need to
  // do this to ensure that the version placeholders are properly populated.
  packageNames.forEach((pkgName) => {
    const outputPath = getBazelOutputPath(pkgName);
    if (sh.test('-d', outputPath)) {
      sh.chmod('-R', 'u+w', outputPath);
      sh.rm('-rf', outputPath);
    }
  });

  exec(`${bazelCmd} build ${stampConfigArg} ${targets.join(' ')}`);

  // Delete the distribution directory so that the output is guaranteed to be clean. Re-create
  // the empty directory so that we can copy the release packages into it later.
  sh.rm('-rf', distPath);
  sh.mkdir('-p', distPath);

  // Copy the package output into the specified distribution folder.
  packageNames.forEach((pkgName) => {
    const outputPath = getBazelOutputPath(pkgName);
    const targetFolder = getDistPath(pkgName);
    console.info(`> Copying package output to "${targetFolder}"`);
    sh.cp('-R', outputPath, targetFolder);
    sh.chmod('-R', 'u+w', targetFolder);
  });

  return packageNames.map((pkg) => {
    return {
      name: `@angular/${pkg}`,
      outputPath: getDistPath(pkg),
    };
  });
}

/**
 * Gets the package names of the specified Bazel targets.
 * e.g. //packages/core:npm_package => core
 */
function getPackageNamesOfTargets(targets: string[]): string[] {
  return targets.map((targetName) => {
    const matches = targetName.match(/\/\/packages\/(.*):npm_package/);
    if (matches === null) {
      throw Error(
        `Found Bazel target with "${releaseTargetTag}" tag, but could not ` +
          `determine release output name: ${targetName}`
      );
    }
    return matches[1];
  });
}

/** Executes the given command in the project directory. */
export function exec(command: string): void;
/** Executes the given command in the project directory and returns its stdout. */
export function exec(command: string, captureStdout: true): string;
export function exec(command: string, captureStdout?: true) {
  const stdout = execSync(command, {
    cwd: projectDir,
    stdio: ['inherit', captureStdout ? 'pipe' : 'inherit', 'inherit'],
  });

  if (captureStdout) {
    process.stdout.write(stdout);
    return stdout.toString().trim();
  }
}
