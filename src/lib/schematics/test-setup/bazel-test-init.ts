/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * NOTE: This file will run before the actual tests start inside of Bazel.
 *
 * It automatically runs before all spec files because the spec files are blocked
 * until Jasmine runs the `describe`  blocks.
 *
 * We copy all needed files into the proper Bazel bin output in order to be able to test
 * the schematics. Workaround for: https://github.com/bazelbuild/rules_typescript/issues/154
 */

import {sync as globSync} from 'glob';
import {dirname, join} from 'path';
import {copySync} from 'fs-extra';

// Adding the test case files to the data of the `jasmine_node_test` Bazel rule does not mean
// that the files are being copied over to the Bazel bin output. Bazel just patches the NodeJS
// resolve function and maps the module paths to the original file location. Since we want to copy
// the files to the bazel test directory because TSLint and the schematic test runner expect a real
// file system, we need to resolve the original file path through a Bazel mapped file.
const sourceDirectory = dirname(
    require.resolve('angular_material/src/lib/schematics/collection.json'));

const bazelBinDir = join(__dirname, '../');

// Copy all schema files to the bazel bin directory.
globSync('**/schema.json', {cwd: sourceDirectory})
  .forEach(file => copySync(join(sourceDirectory, file), join(bazelBinDir, file)));

// Copy all template files to the bazel bin directory.
globSync('**/files/**/*', {cwd: sourceDirectory})
  .forEach(file => copySync(join(sourceDirectory, file), join(bazelBinDir, file)));

// Copy the collection.json and migration.json file to the bazel bin directory.
globSync('+(collection|migration).json', {cwd: sourceDirectory})
  .forEach(file => copySync(join(sourceDirectory, file), join(bazelBinDir, file)));
