import {getSystemPath, normalize} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import * as virtualFs from '@angular-devkit/core/src/virtual-fs/host';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {runPostScheduledTasks} from '../../test-setup/post-scheduled-tasks';
import {readFileSync, writeFileSync, mkdirpSync} from 'fs-extra';
import {join, dirname} from 'path';
import {createTestApp, migrationCollection} from '../../test-setup/test-app';

/** Module name suffix for data files of the `jasmine_node_test` Bazel rule. */
const bazelModuleSuffix = 'angular_material/src/lib/schematics/update/test-cases';

/** Reads the UTF8 content of the specified file. Normalizes the path and ensures that */
export function readFileContent(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

/**
 * Resolves the original file path of the specified file that has been to the `data` of the
 * jasmine_node_test Bazel rule.
 *
 * Adding the test case files to the data of the `jasmine_node_test` Bazel rule does not mean
 * that the files are being copied over to the Bazel bin output. Bazel just patches the NodeJS
 * resolve function and maps the module paths to the original file location.
 */
export function resolveBazelDataFile(filePath: string) {
  return require.resolve(`${bazelModuleSuffix}/${filePath}`);
}

/**
 * Creates a test app schematic tree that will be copied over to a real filesystem location.
 * This is necessary because TSLint is not able to read from the virtual filesystem tree.
 */
export function createFileSystemTestApp() {
  const tempFileSystemHost = new TempScopedNodeJsSyncHost();
  const appTree = createTestApp();
  const tempPath = getSystemPath(tempFileSystemHost.root);

  // Since the TSLint fix task expects all files to be present on the real file system, we
  // map every file in the app tree to a temporary location on the file system.
  appTree.files.map(f => normalize(f)).forEach(f => {
    tempFileSystemHost.sync.write(f, virtualFs.stringToFileBuffer(appTree.readContent(f)));
  });

  return {appTree, tempPath};
}

export async function runTestCases(migrationName: string, inputs: {[name: string]: string}) {
  const runner = new SchematicTestRunner('schematics', migrationCollection);
  const inputNames = Object.keys(inputs);
  const initialWorkingDir = process.cwd();

  let logOutput = '';
  runner.logger.subscribe(entry => logOutput += entry.message);

  const {appTree, tempPath} = createFileSystemTestApp();

  // Write each test-case input to the file-system. This is necessary because otherwise
  // TSLint won't be able to pick up the test cases.
  inputNames.forEach(inputName => {
    const tempInputPath = join(tempPath, `projects/material/src/test-cases/${inputName}.ts`);

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
