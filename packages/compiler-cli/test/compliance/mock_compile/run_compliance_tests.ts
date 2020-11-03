/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, getFileSystem, NodeJSFileSystem, PathSegment} from '../../../src/ngtsc/file_system';
import {initMockFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles, loadTestDirectory, NgtscTestEnvironment} from '../../helpers';
import {expectEmit} from './mock_compile';

export interface ComplianceTestGroup {
  name: string;
  tests: Generator<ComplianceTest>;
}

export interface ExpectedFile {
  expected: string;
  generated: string;
}

export interface Expectation {
  failureMessage: string;
  files: ExpectedFile[];
}

export interface ComplianceTest {
  group: string;
  testPath: AbsoluteFsPath;
  description: string;
  compilerOptions?: ConfigOptions;
  angularCompilerOptions?: ConfigOptions;
  inputFiles: string[];
  expectations: Expectation[];
  focusTest?: boolean;
  excludeTest?: boolean;
}

export type ConfigOptions = Record<string, string|boolean|null>;

const realFs = new NodeJSFileSystem();
const testFiles = loadStandardTestFiles();

export function* getComplianceTests(): Generator<ComplianceTest> {
  const complianceBasePath = realFs.resolve(__dirname, '../test_cases');
  yield* findAllTests(complianceBasePath);
}

export function compileTest(
    testPath: AbsoluteFsPath, files: string[], compilerOptions: ConfigOptions|undefined,
    angularCompilerOptions: ConfigOptions|
    undefined): {fs: FileSystem, env: NgtscTestEnvironment, generatedFiles: AbsoluteFsPath[]} {
  initMockFileSystem('Native');
  const fs = getFileSystem();
  const env = NgtscTestEnvironment.setup(testFiles);
  createTsConfig(env, {target: 'ES2015', ...compilerOptions}, angularCompilerOptions, files);
  loadTestDirectory(fs, testPath, fs.resolve('/'));

  const originalWriteFile = fs.writeFile;
  const generatedFiles: AbsoluteFsPath[] = [];
  try {
    fs.writeFile = (path: AbsoluteFsPath, data: string|Uint8Array, exclusive?: boolean) => {
      generatedFiles.push(path);
      originalWriteFile.call(fs, path, data, exclusive);
    };
    env.driveMain();
  } finally {
    fs.writeFile = originalWriteFile;
  }

  return {fs, env, generatedFiles};
}

export function checkExpectations(
    fs: FileSystem, env: NgtscTestEnvironment, failureMessage: string,
    expectedFiles: ExpectedFile[]): void {
  for (const expectedFile of expectedFiles) {
    const expected = fs.readFile(fs.resolve(expectedFile.expected)).replace(/\/\* … \*\//g, '…');
    const generated = env.getContents(expectedFile.generated);
    expectEmit(generated, expected, failureMessage);
  }
}

function* findAllTests(basePath: AbsoluteFsPath): Generator<ComplianceTest> {
  const testConfigPaths = collectPaths(basePath, segment => segment === 'tests.json');
  for (const testConfigPath of testConfigPaths) {
    const testPath = realFs.dirname(testConfigPath);
    const testConfigJSON = JSON.parse(realFs.readFile(testConfigPath));
    const testConfig = Array.isArray(testConfigJSON) ? testConfigJSON : [testConfigJSON];
    for (const test of testConfig) {
      yield {
        group: realFs.relative(basePath, testPath),
        testPath,
        description: getStringOrFail(test, 'description', testPath),
        inputFiles: getStringArrayOrDefault(test, 'inputFiles', testPath, ['test.ts']),
        expectations: parseExpectations(test.expectations, testPath),
        compilerOptions: getConfigOptions(test, 'compilerOptions', testPath),
        angularCompilerOptions: getConfigOptions(test, 'angularCompilerOptions', testPath),
        focusTest: test.focusTest,
        excludeTest: test.excludeTest,
      };
    }
  }
}

function*
    collectPaths(current: AbsoluteFsPath, predicate: (segment: PathSegment) => boolean):
        Generator<AbsoluteFsPath> {
  if (!realFs.exists(current)) {
    return;
  }
  for (const segment of realFs.readdir(current)) {
    const absPath = realFs.resolve(current, segment);
    if (predicate(segment)) {
      yield absPath;
    } else {
      if (realFs.lstat(absPath).isDirectory()) {
        yield* collectPaths(absPath, predicate);
      }
    }
  }
}

function createTsConfig(
    env: NgtscTestEnvironment, compilerOptions: Record<string, string|boolean|null>,
    angularCompilerOptions: Record<string, string|boolean|null> = {}, files?: string[]): void {
  const tsconfig: Record<string, any> = {
    extends: './tsconfig-base.json',
    compilerOptions,
    angularCompilerOptions,
  };
  if (files !== undefined) {
    tsconfig['files'] = files;
  }
  env.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));
}

function getStringOrFail(container: any, property: string, testPath: AbsoluteFsPath): string {
  const value = container[property];
  if (typeof value !== 'string') {
    throw new Error(`Test is missing "${property}" property in tests.json: ` + testPath);
  }
  return value;
}

function getStringArrayOrDefault(
    container: any, property: string, testPath: AbsoluteFsPath, defaultValue: string[]): string[] {
  const value = container[property];
  if (typeof value === 'undefined') {
    return defaultValue;
  }
  if (!Array.isArray(value) || !value.every(item => typeof item === 'string')) {
    throw new Error(
        `Test has invalid "${property}" property in tests.json - expected array of strings: ` +
        testPath);
  }
  return value;
}

function parseExpectations(value: any, testPath: AbsoluteFsPath): Expectation[] {
  const defaultFailureMessage = 'Incorrect generated output.';
  const defaultFiles = [{expected: 'test.js', generated: 'test.js'}];

  if (typeof value === 'undefined') {
    return [{failureMessage: defaultFailureMessage, files: defaultFiles}];
  }

  if (!Array.isArray(value)) {
    return parseExpectations([value], testPath);
  }

  return value.map((expectation, i) => {
    if (typeof expectation !== 'object') {
      throw new Error(
          `Test has invalid "expectations" property in tests.json - expected array of "expectation" objects: ${
              testPath}`);
    }

    const failureMessage = expectation.failureMessage ?? defaultFailureMessage;

    if (typeof expectation.files === 'undefined') {
      return {failureMessage, files: defaultFiles};
    }

    if (!Array.isArray(expectation.files)) {
      throw new Error(`Test has invalid "expectations[${
          i}].files" property in tests.json - expected array of "expected files": ${testPath}`);
    }
    const files = expectation.files.map((file: any) => {
      if (typeof file === 'string') {
        return {expected: file, generated: file};
      }
      if (typeof file === 'object' && typeof file.expected === 'string' &&
          typeof file.generated === 'string') {
        return file;
      }
      throw new Error(`Test has invalid "expectations[${
          i}].files" property in tests.json - expected each item to be a string or an "expected file" object: ${
          testPath}`);
    });

    return {failureMessage, files};
  });
}

function getConfigOptions(
    container: any, property: string, testPath: AbsoluteFsPath): ConfigOptions|undefined {
  const options = container[property];
  if (options !== undefined && typeof options !== 'object') {
    throw new Error(
        `Test have invalid "${property}" property in tests.json - expected config option object: ` +
        testPath);
  }
  return options;
}
