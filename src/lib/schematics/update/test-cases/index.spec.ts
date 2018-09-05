import {getSystemPath, normalize} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import * as virtualFs from '@angular-devkit/core/src/virtual-fs/host';
import {readFileSync} from 'fs';
import {createTestApp} from '../../test-setup/test-app';

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
 * Creates a test app schematic tree that includes the specified test case as TypeScript
 * entry point file. Also writes the app tree to a real file system location in order to be
 * able to test the tslint fix rules.
 */
export function createTestAppWithTestCase(testCaseInputPath: string) {
  const tempFileSystemHost = new TempScopedNodeJsSyncHost();
  const appTree = createTestApp();

  appTree.overwrite('/projects/material/src/main.ts', readFileContent(testCaseInputPath));

  // Since the TSLint fix task expects all files to be present on the real file system, we
  // map every file in the app tree to a temporary location on the file system.
  appTree.files.map(f => normalize(f)).forEach(f => {
    tempFileSystemHost.sync.write(f, virtualFs.stringToFileBuffer(appTree.readContent(f)));
  });

  // Switch to the new temporary directory because otherwise TSLint cannot read the files.
  process.chdir(getSystemPath(tempFileSystemHost.root));

  return appTree;
}
