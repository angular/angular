/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, NodeJSFileSystem, PathSegment} from '../../../src/ngtsc/file_system';

const fs = new NodeJSFileSystem();
const basePath = fs.resolve(__dirname, '../test_cases');

/**
 * Search the `test_cases` directory, in the real file-system, for all the compliance tests.
 *
 * Test are indicated by a `TEST_CASES.json` file which contains one or more test cases.
 */
export function* getAllComplianceTests(): Generator<ComplianceTest> {
  const testConfigPaths = collectPaths(basePath, segment => segment === 'TEST_CASES.json');
  for (const testConfigPath of testConfigPaths) {
    yield* getComplianceTests(testConfigPath);
  }
}

/**
 * Extract all the compliance tests from the TEST_CASES.json file at the `testConfigPath`.
 *
 * @param testConfigPath The path, relative to the `test_cases` basePath, of the `TEST_CASES.json`
 *     config file.
 */
export function* getComplianceTests(testConfigPath: string): Generator<ComplianceTest> {
  const absTestConfigPath = fs.resolve(basePath, testConfigPath);
  const realTestPath = fs.dirname(absTestConfigPath);
  const testConfigJSON = JSON.parse(fs.readFile(absTestConfigPath)).cases;
  const testConfig = Array.isArray(testConfigJSON) ? testConfigJSON : [testConfigJSON];
  for (const test of testConfig) {
    const inputFiles = getStringArrayOrDefault(test, 'inputFiles', realTestPath, ['test.ts']);
    yield {
      relativePath: fs.relative(basePath, realTestPath),
      realTestPath,
      description: getStringOrFail(test, 'description', realTestPath),
      inputFiles,
      expectations: parseExpectations(test.expectations, realTestPath, inputFiles),
      compilerOptions: getConfigOptions(test, 'compilerOptions', realTestPath),
      angularCompilerOptions: getConfigOptions(test, 'angularCompilerOptions', realTestPath),
      focusTest: test.focusTest,
      excludeTest: test.excludeTest,
    };
  }
}

/**
 * Search the file-system from the `current` path to find all paths that satisfy the `predicate`.
 */
function*
    collectPaths(current: AbsoluteFsPath, predicate: (segment: PathSegment) => boolean):
        Generator<AbsoluteFsPath> {
  if (!fs.exists(current)) {
    return;
  }
  for (const segment of fs.readdir(current)) {
    const absPath = fs.resolve(current, segment);
    if (predicate(segment)) {
      yield absPath;
    } else {
      if (fs.lstat(absPath).isDirectory()) {
        yield* collectPaths(absPath, predicate);
      }
    }
  }
}

function getStringOrFail(container: any, property: string, testPath: AbsoluteFsPath): string {
  const value = container[property];
  if (typeof value !== 'string') {
    throw new Error(`Test is missing "${property}" property in TEST_CASES.json: ` + testPath);
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
        `Test has invalid "${property}" property in TEST_CASES.json - expected array of strings: ` +
        testPath);
  }
  return value;
}

function parseExpectations(
    value: any, testPath: AbsoluteFsPath, inputFiles: string[]): Expectation[] {
  const defaultFailureMessage = 'Incorrect generated output.';
  const tsFiles = inputFiles.filter(f => /[^.][^d]\.ts$/.test(f));
  const defaultFiles = tsFiles.map(inputFile => {
    const outputFile = inputFile.replace(/\.ts$/, '.js');
    return {expected: outputFile, generated: outputFile};
  });

  if (typeof value === 'undefined') {
    return [{failureMessage: defaultFailureMessage, files: defaultFiles}];
  }

  if (!Array.isArray(value)) {
    return parseExpectations([value], testPath, inputFiles);
  }

  return value.map((expectation, i) => {
    if (typeof expectation !== 'object') {
      throw new Error(
          `Test has invalid "expectations" property in TEST_CASES.json - expected array of "expectation" objects: ${
              testPath}`);
    }

    const failureMessage = expectation.failureMessage ?? defaultFailureMessage;

    if (typeof expectation.files === 'undefined') {
      return {failureMessage, files: defaultFiles};
    }

    if (!Array.isArray(expectation.files)) {
      throw new Error(`Test has invalid "expectations[${
          i}].files" property in TEST_CASES.json - expected array of "expected files": ${
          testPath}`);
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
          i}].files" property in TEST_CASES.json - expected each item to be a string or an "expected file" object: ${
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
        `Test have invalid "${
            property}" property in TEST_CASES.json - expected config option object: ` +
        testPath);
  }
  return options;
}

/**
 * Describes a compliance test, as defined in a `TEST_CASES.json` file.
 */
export interface ComplianceTest {
  /** The path, relative to the test_cases directory, of the directory containing this test. */
  relativePath: string;
  /** The absolute path (on the real file-system) to the test case containing this test. */
  realTestPath: AbsoluteFsPath;
  /** A description of this particular test. */
  description: string;
  /**
   * Any additional options to pass to the TypeScript compiler when compiling this test's source
   * files. These are equivalent to what you would put in `tsconfig.json`.
   */
  compilerOptions?: ConfigOptions;
  /**
   * Any additional options to pass to the Angular compiler when compiling this test's source
   * files. These are equivalent to what you would put in `tsconfig.json`.
   */
  angularCompilerOptions?: ConfigOptions;
  /** A list of paths to source files that should be compiled for this test case. */
  inputFiles: string[];
  /** A list of expectations to check for this test case. */
  expectations: Expectation[];
  /** If set to `true`, then focus on this test (equivalent to jasmine's 'fit()`). */
  focusTest?: boolean;
  /** If set to `true`, then exclude this test (equivalent to jasmine's 'xit()`). */
  excludeTest?: boolean;
}

export interface Expectation {
  /** The message to display if this expectation fails. */
  failureMessage: string;
  /** A list of pairs of paths to expected and generated files to compare. */
  files: ExpectedFile[];
}

/**
 * A pair of paths to expected and generated files that should be compared in an `Expectation`.
 */
export interface ExpectedFile {
  expected: string;
  generated: string;
}

/**
 * Options to pass to configure the compiler.
 */
export type ConfigOptions = Record<string, string|boolean|null>;
