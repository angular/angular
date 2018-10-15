/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import * as virtualFs from '@angular-devkit/core/src/virtual-fs/host';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {readFileSync, writeFileSync, mkdirpSync} from 'fs-extra';
import {join, dirname} from 'path';
import {createTestApp, runPostScheduledTasks} from '../testing';

/** Reads the UTF8 content of the specified file. Normalizes the path and ensures that */
export function readFileContent(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

/**
 * Creates a test app schematic tree that will be copied over to a real filesystem location.
 * This is necessary because TSLint is not able to read from the virtual filesystem tree.
 */
export function createFileSystemTestApp(runner: SchematicTestRunner) {
  const tempFileSystemHost = new TempScopedNodeJsSyncHost();
  const appTree = createTestApp(runner, {name: 'cdk-testing'});
  const tempPath = getSystemPath(tempFileSystemHost.root);

  // Since the TSLint fix task expects all files to be present on the real file system, we
  // map every file in the app tree to a temporary location on the file system.
  appTree.files.map(f => normalize(f)).forEach(f => {
    tempFileSystemHost.sync.write(f, virtualFs.stringToFileBuffer(appTree.readContent(f)));
  });

  return {appTree, tempPath};
}

export async function runTestCases(migrationName: string, collectionPath: string,
                                   inputs: {[name: string]: string}) {

  const runner = new SchematicTestRunner('schematics', collectionPath);
  const inputNames = Object.keys(inputs);
  const initialWorkingDir = process.cwd();

  let logOutput = '';
  runner.logger.subscribe(entry => logOutput += entry.message);

  const {appTree, tempPath} = createFileSystemTestApp(runner);

  // Write each test-case input to the file-system. This is necessary because otherwise
  // TSLint won't be able to pick up the test cases.
  inputNames.forEach(inputName => {
    const tempInputPath = join(tempPath, `projects/cdk-testing/src/test-cases/${inputName}.ts`);

    mkdirpSync(dirname(tempInputPath));
    writeFileSync(tempInputPath, readFileContent(inputs[inputName]));
  });

  runner.runSchematic(migrationName, {}, appTree);

  // Switch to the new temporary directory because otherwise TSLint cannot read the files.
  process.chdir(tempPath);

  // Run the scheduled TSLint fix task from the update schematic. This task is responsible for
  // identifying outdated code parts and performs the fixes. Since tasks won't run automatically
  // within a `SchematicTestRunner`, we manually need to run the scheduled task.
  await runPostScheduledTasks(runner, 'tslint-fix').toPromise();

  // Switch back to the initial working directory.
  process.chdir(initialWorkingDir);

  return {tempPath, logOutput};
}
