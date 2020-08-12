#!/usr/bin/env node

/**
 * Script that builds the docs content NPM package and moves it into an conveniently
 * accessible distribution directory (the project `dist/` directory).
 */

const {join} = require('path');
const {chmod, cd, cp, mkdir, rm, set, exec} = require('shelljs');

/** Path to the project directory. */
const projectDir = join(__dirname, '../');

/** Path to the distribution directory. */
const distDir = join(projectDir, 'dist/');

/**
 * Path to the directory where the docs-content package is copied to. Note: When
 * changing the path, also change the path in the docs-content deploy script.
 */
const outputDir = join(distDir, 'docs-content-pkg');

/** Command that runs Bazel. */
const bazelCmd = process.env.BAZEL_COMMAND || `yarn -s bazel`;

// ShellJS should exit if a command fails.
set('-e');

// Go to project directory.
cd(projectDir);

/** Path to the bazel bin output directory. */
const bazelBinPath = exec(`${bazelCmd} info bazel-bin`).stdout.trim();

/** Path where the NPM package is built into by Bazel. */
const bazelBinOutDir = join(bazelBinPath, 'src/components-examples/npm_package');

// Build the docs-content package with the snapshot-build mode. That will help
// determining which commit is associated with the built docs-content.
exec(`${bazelCmd} build src/components-examples:npm_package --config=snapshot-build`);

// Clean the output directory to ensure that the docs-content package
// will not contain outdated files from previous builds.
rm('-rf', outputDir);
mkdir('-p', distDir);

// Copy the package output into the dist path. Also update the permissions
// as Bazel by default marks files in the bazel-out as readonly.
cp('-R', bazelBinOutDir, outputDir);
chmod('-R', 'u+w', outputDir);

console.info(`Built docs-content into: ${outputDir}`);
