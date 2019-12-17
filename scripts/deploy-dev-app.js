#!/usr/bin/env node

/**
 * Script that builds the dev-app as a static web package that will be
 * deployed to the currently configured Firebase project.
 */

const {exec, set, cd, cp, rm} = require('shelljs');
const {join} = require('path');

// ShellJS should throw if any command fails.
set('-e');

/** Path to the project directory. */
const projectDirPath = join(__dirname, '../');

// Go to project directory.
cd(projectDirPath);

/** Path to the bazel-bin directory. */
const bazelBinPath = exec(`yarn -s bazel info bazel-bin`).stdout.trim();

/** Output path for the Bazel dev-app web package target. */
const webPackagePath = join(bazelBinPath, 'src/dev-app/web_package');

/** Destination path where the web package should be copied to. */
const distPath = join(projectDirPath, 'dist/dev-app-web-pkg');

// Build web package output.
exec('yarn -s bazel build //src/dev-app:web_package');

// Clear previous deployment artifacts.
rm('-Rf', distPath);

// Copy the web package from the bazel-bin directory to the project dist
// path. This is necessary because the Firebase CLI does not support deployment
// of a public folder outside of the "firebase.json" file.
cp('-R', webPackagePath, distPath);

// Run the Firebase CLI to deploy the hosting target.
exec(`yarn -s firebase deploy --only hosting`);
