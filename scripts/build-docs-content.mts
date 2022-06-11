/**
 * Script that builds the docs content NPM package and moves it into a conveniently
 * accessible distribution directory (the project `dist/` directory).
 */

import sh from 'shelljs';
import {BuiltPackage} from '@angular/dev-infra-private/ng-dev';
import {fileURLToPath} from 'url';
import {join, dirname} from 'path';

/** Path to the project directory. */
const projectDir = join(dirname(fileURLToPath(import.meta.url)), '../');

/** Path to the distribution directory. */
const distDir = join(projectDir, 'dist/');

/**
 * Path to the directory where the docs-content package is copied to. Note: When
 * changing the path, also change the path in the docs-content deploy script.
 */
const outputDir = join(distDir, 'docs-content-pkg');

/** Command that runs Bazel. */
const bazelCmd = process.env.BAZEL || `yarn -s bazel`;

/**
 * Builds the docs content NPM package in snapshot mode.
 *
 * @returns an object describing the built package and its output path.
 */
export function buildDocsContentPackage(): BuiltPackage {
  // ShellJS should exit if a command fails.
  sh.set('-e');

  // Go to project directory.
  sh.cd(projectDir);

  /** Path to the bazel bin output directory. */
  const bazelBinPath = sh.exec(`${bazelCmd} info bazel-bin`).stdout.trim();

  /** Path where the NPM package is built into by Bazel. */
  const bazelBinOutDir = join(bazelBinPath, 'src/components-examples/npm_package');

  // Clean the output directory to ensure that the docs-content package
  // will not contain outdated files from previous builds.
  sh.rm('-rf', outputDir);
  sh.mkdir('-p', distDir);

  // Build the docs-content package with the snapshot-build mode. That will help
  // determining which commit is associated with the built docs-content.
  sh.exec(`${bazelCmd} build src/components-examples:npm_package --config=snapshot-build`);

  // Copy the package output into the dist path. Also update the permissions
  // as Bazel by default marks files in the bazel-out as readonly.
  sh.cp('-R', bazelBinOutDir, outputDir);
  sh.chmod('-R', 'u+w', outputDir);

  return {
    name: '@angular/components-examples',
    outputPath: outputDir,
  };
}
