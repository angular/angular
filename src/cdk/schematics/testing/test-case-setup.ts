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
import {mkdirpSync, readFileSync, writeFileSync, removeSync} from 'fs-extra';
import {sync as globSync} from 'glob';
import {dirname, join, basename, relative, sep} from 'path';
import {createTestApp, runPostScheduledTasks} from '../testing';

/** Suffix that indicates whether a given file is a test case input. */
const TEST_CASE_INPUT_SUFFIX = '_input.ts';

/** Suffix that indicates whether a given file is an expected output of a test case. */
const TEST_CASE_OUTPUT_SUFFIX = '_expected_output.ts';

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

  return {appTree, tempPath, removeTempDir: () => removeSync(tempPath)};
}

export async function runTestCases(migrationName: string, collectionPath: string,
                                   inputFiles: string[]) {

  const runner = new SchematicTestRunner('schematics', collectionPath);
  const initialWorkingDir = process.cwd();

  let logOutput = '';
  runner.logger.subscribe(entry => logOutput += entry.message);

  const {appTree, tempPath, removeTempDir} = createFileSystemTestApp(runner);

  // Write each test-case input to the file-system. This is necessary because otherwise
  // TSLint won't be able to pick up the test cases.
  inputFiles.forEach(inputFilePath => {
    const inputTestName = basename(inputFilePath);
    const tempInputPath = join(tempPath, `projects/cdk-testing/src/test-cases/${inputTestName}.ts`);

    mkdirpSync(dirname(tempInputPath));
    writeFileSync(tempInputPath, readFileContent(inputFilePath));
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

  return {tempPath, logOutput, removeTempDir};
}

/**
 * Resolves all test cases for specified path using Bazel's runfile manifest. Note that we
 * cannot just use "glob" since the test case files are not copied to the Bazel bin directory
 * and are just runfiles.
 */
export function findBazelVersionTestCases(basePath: string) {
  const testCasesMap = new Map<string, string[]>();
  const manifestPath = process.env['RUNFILES_MANIFEST_FILE']!;
  const runfilesDir = process.env['RUNFILES'];

  // In case we are not on Windows where runfiles are symlinked, we just find all
  // test case files by using "glob" and store them in our result map.
  if (!manifestPath) {
    const runfilesBaseDir = join(runfilesDir, basePath);
    const inputFiles = globSync(`**/*${TEST_CASE_INPUT_SUFFIX}`, {cwd: runfilesBaseDir});

    inputFiles.forEach(inputFile => {
      // The target version of an input file will be determined from the first
      // path segment. (e.g. "v6/my_rule_input.ts" will be for "v6")
      const targetVersion = inputFile.split(sep)[0];
      const resolvedInputPath = join(runfilesBaseDir, inputFile);

      testCasesMap.set(targetVersion,
        (testCasesMap.get(targetVersion) || []).concat(resolvedInputPath));
    });

    return testCasesMap;
  }

  // In case runfiles are not symlinked (e.g. on Windows), we resolve all test case files using
  // the Bazel runfiles manifest. Read more about the manifest here: https://git.io/fhIZE
  readFileSync(manifestPath, 'utf8').split('\n').forEach(line => {
    const [runfilePath, realPath] = line.split(' ');

    // In case the mapped runfile starts with the specified base path and ends with "_input.ts",
    // we store it in our result map because we assume that this is a test case.
    if (runfilePath.startsWith(basePath) && runfilePath.endsWith(TEST_CASE_INPUT_SUFFIX)) {
      // The target version of an input file will be determined from the first
      // path segment. (e.g. "v6/my_rule_input.ts" will be for "v6")
      const targetVersion = relative(basePath, runfilePath).split(sep)[0];
      testCasesMap.set(targetVersion, (testCasesMap.get(targetVersion) || []).concat(realPath));
    }
  });

  return testCasesMap;
}

/**
 * Sets up the specified test cases using Jasmine by creating the appropriate jasmine
 * spec definitions. This should be used within a "describe" jasmine closure.
 */
export function defineJasmineTestCases(versionName: string, collectionFile: string,
                                inputFiles: string[] | undefined) {
  // No test cases for the given version are available. Skip setting up tests for that
  // version.
  if (!inputFiles) {
    return;
  }

  let testCasesOutputPath: string;
  let cleanupTestApp: () => void;

  beforeAll(async () => {
    const {tempPath, removeTempDir} =
      await runTestCases(`migration-${versionName}`, collectionFile, inputFiles);

    testCasesOutputPath = join(tempPath, 'projects/cdk-testing/src/test-cases/');
    cleanupTestApp = removeTempDir;
  });

  afterAll(() => cleanupTestApp());

  // Iterates through every test case directory and generates a jasmine test block that will
  // verify that the update schematics properly updated the test input to the expected output.
  inputFiles.forEach(inputFile => {
    const inputTestName = basename(inputFile);

    it(`should apply update schematics to test case: ${inputTestName}`, () => {
      expect(readFileContent(join(testCasesOutputPath, `${inputTestName}.ts`)))
        .toBe(readFileContent(inputFile.replace(TEST_CASE_INPUT_SUFFIX, TEST_CASE_OUTPUT_SUFFIX)));
    });
  });
}
