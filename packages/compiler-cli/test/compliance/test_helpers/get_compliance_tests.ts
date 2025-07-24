/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {runfiles} from '@bazel/runfiles';

import {
  AbsoluteFsPath,
  NodeJSFileSystem,
  PathSegment,
  ReadonlyFileSystem,
} from '../../../src/ngtsc/file_system';

export const fs = new NodeJSFileSystem();

/** Path to the test case sources. */
const basePath = fs.resolve(
  runfiles.resolveWorkspaceRelative('packages/compiler-cli/test/compliance/test_cases'),
);

/**
 * Search the `test_cases` directory, in the real file-system, for all the compliance tests.
 *
 * Test are indicated by a `TEST_CASES.json` file which contains one or more test cases.
 */
export function* getAllComplianceTests(): Generator<ComplianceTest> {
  const testConfigPaths = collectPaths(basePath, (segment) => segment === 'TEST_CASES.json');
  for (const testConfigPath of testConfigPaths) {
    yield* getComplianceTests(testConfigPath);
  }
}

/**
 * Extract all the compliance tests from the TEST_CASES.json file at the `testConfigPath`.
 *
 * @param testConfigPath Absolute disk path of the `TEST_CASES.json` file that describes the tests.

 */
export function* getComplianceTests(absTestConfigPath: AbsoluteFsPath): Generator<ComplianceTest> {
  const realTestPath = fs.dirname(absTestConfigPath);
  const testConfigJSON = loadTestCasesFile(fs, absTestConfigPath, basePath).cases;
  const testConfig = Array.isArray(testConfigJSON) ? testConfigJSON : [testConfigJSON];
  for (const test of testConfig) {
    const inputFiles = getStringArrayOrDefault(test, 'inputFiles', realTestPath, ['test.ts']);
    const compilationModeFilter = getStringArrayOrDefault(
      test,
      'compilationModeFilter',
      realTestPath,
      ['linked compile', 'full compile', 'declaration-only emit'],
    ) as CompilationMode[];

    yield {
      relativePath: fs.relative(basePath, realTestPath),
      realTestPath,
      description: getStringOrFail(test, 'description', realTestPath),
      inputFiles,
      compilationModeFilter,
      expectations: parseExpectations(test.expectations, realTestPath, inputFiles),
      compilerOptions: getConfigOptions(test, 'compilerOptions', realTestPath),
      angularCompilerOptions: getConfigOptions(test, 'angularCompilerOptions', realTestPath),
      skipForTemplatePipeline: test.skipForTemplatePipeline,
      focusTest: test.focusTest,
      excludeTest: test.excludeTest,
    };
  }
}

function loadTestCasesFile(
  fs: ReadonlyFileSystem,
  testCasesPath: AbsoluteFsPath,
  basePath: AbsoluteFsPath,
) {
  try {
    return JSON.parse(fs.readFile(testCasesPath)) as {cases: TestCaseJson | TestCaseJson[]};
  } catch (e) {
    throw new Error(
      `Failed to load test-cases at "${fs.relative(basePath, testCasesPath)}":\n ${
        (e as Error).message
      }`,
    );
  }
}

/**
 * Search the file-system from the `current` path to find all paths that satisfy the `predicate`.
 */
function* collectPaths(
  current: AbsoluteFsPath,
  predicate: (segment: PathSegment) => boolean,
): Generator<AbsoluteFsPath> {
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
  container: any,
  property: string,
  testPath: AbsoluteFsPath,
  defaultValue: string[],
): string[] {
  const value = container[property];
  if (typeof value === 'undefined') {
    return defaultValue;
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(
      `Test has invalid "${property}" property in TEST_CASES.json - expected array of strings: ` +
        testPath,
    );
  }
  return value;
}

function parseExpectations(
  value: any,
  testPath: AbsoluteFsPath,
  inputFiles: string[],
): Expectation[] {
  const defaultFailureMessage = 'Incorrect generated output.';
  const tsFiles = inputFiles.filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'));
  const defaultFiles = tsFiles.map((inputFile) => {
    const outputFile = inputFile.replace(/\.ts$/, '.js');
    return {expected: outputFile, generated: outputFile};
  });

  if (typeof value === 'undefined') {
    return [
      {
        failureMessage: defaultFailureMessage,
        files: defaultFiles,
        expectedErrors: [],
        extraChecks: [],
      },
    ];
  }

  if (!Array.isArray(value)) {
    return parseExpectations([value], testPath, inputFiles);
  }

  return value.map((expectation, i) => {
    if (typeof expectation !== 'object') {
      throw new Error(
        `Test has invalid "expectations" property in TEST_CASES.json - expected array of "expectation" objects: ${testPath}`,
      );
    }

    const failureMessage: string = expectation.failureMessage ?? defaultFailureMessage;
    const expectedErrors = parseExpectedErrors(expectation.expectedErrors, testPath);
    const extraChecks = parseExtraChecks(expectation.extraChecks, testPath);

    if (typeof expectation.files === 'undefined') {
      return {failureMessage, files: defaultFiles, expectedErrors, extraChecks};
    }

    if (!Array.isArray(expectation.files)) {
      throw new Error(
        `Test has invalid "expectations[${i}].files" property in TEST_CASES.json - expected array of "expected files": ${testPath}`,
      );
    }
    const files: ExpectedFile[] = expectation.files.map((file: any) => {
      if (typeof file === 'string') {
        return {expected: file, generated: file};
      }
      if (
        typeof file === 'object' &&
        typeof file.expected === 'string' &&
        typeof file.generated === 'string'
      ) {
        return file;
      }
      throw new Error(
        `Test has invalid "expectations[${i}].files" property in TEST_CASES.json - expected each item to be a string or an "expected file" object: ${testPath}`,
      );
    });

    return {failureMessage, files, expectedErrors, extraChecks};
  });
}

function parseExpectedErrors(expectedErrors: any = [], testPath: AbsoluteFsPath): ExpectedError[] {
  if (!Array.isArray(expectedErrors)) {
    throw new Error(
      'Test has invalid "expectedErrors" property in TEST_CASES.json - expected an array: ' +
        testPath,
    );
  }

  return expectedErrors.map((error) => {
    if (
      typeof error !== 'object' ||
      typeof error.message !== 'string' ||
      (error.location && typeof error.location !== 'string')
    ) {
      throw new Error(
        `Test has invalid "expectedErrors" property in TEST_CASES.json - expected an array of ExpectedError objects: ` +
          testPath,
      );
    }
    return {message: parseRegExp(error.message), location: parseRegExp(error.location)};
  });
}

function parseExtraChecks(extraChecks: any = [], testPath: AbsoluteFsPath): ExtraCheck[] {
  if (
    !Array.isArray(extraChecks) ||
    !extraChecks.every((i) => typeof i === 'string' || Array.isArray(i))
  ) {
    throw new Error(
      `Test has invalid "extraChecks" property in TEST_CASES.json - expected an array of strings or arrays: ` +
        testPath,
    );
  }
  return extraChecks as ExtraCheck[];
}

function parseRegExp(str: string | undefined): RegExp {
  return new RegExp(str || '');
}

function getConfigOptions(
  container: any,
  property: string,
  testPath: AbsoluteFsPath,
): ConfigOptions | undefined {
  const options = container[property];
  if (options !== undefined && typeof options !== 'object') {
    throw new Error(
      `Test have invalid "${property}" property in TEST_CASES.json - expected config option object: ` +
        testPath,
    );
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
  /**
   * Only run this test when the input files are compiled using the given compilation
   * modes. The default is to run for all modes.
   */
  compilationModeFilter: CompilationMode[];
  /** A list of expectations to check for this test case. */
  expectations: Expectation[];
  /** If set to `true` this test is skipped when testing with use_template_pipeline */
  skipForTemplatePipeline?: boolean;
  /** If set to `true`, then focus on this test (equivalent to jasmine's 'fit()`). */
  focusTest?: boolean;
  /** If set to `true`, then exclude this test (equivalent to jasmine's 'xit()`). */
  excludeTest?: boolean;
}

export type CompilationMode =
  | 'linked compile'
  | 'full compile'
  | 'local compile'
  | 'declaration-only emit';

export interface Expectation {
  /** The message to display if this expectation fails. */
  failureMessage: string;
  /** A list of pairs of paths to expected and generated files to compare. */
  files: ExpectedFile[];
  /** A collection of errors that should be reported when compiling the generated file. */
  expectedErrors: ExpectedError[];
  /** Additional checks to run against the generated code. */
  extraChecks: ExtraCheck[];
}

/**
 * A pair of paths to expected and generated files that should be compared in an `Expectation`.
 */
export interface ExpectedFile {
  expected: string;
  generated: string;
}

/**
 * Regular expressions that should match an error message.
 */
export interface ExpectedError {
  message: RegExp;
  location: RegExp;
}

/**
 * The name (or name and arguments) of a function to call to run additional checks against the
 * generated code.
 */
export type ExtraCheck = string | [string, ...any];

/**
 * Options to pass to configure the compiler.
 */
export type ConfigOptions = Record<string, string | boolean | null>;

/**
 * Interface espressing the type for the json object found at ../test_cases/test_case_schema.json.
 */
export interface TestCaseJson {
  description: string;
  compilationModeFilter?: ('fulll compile' | 'linked compile')[];
  inputFiles?: string[];
  expectations?: {
    failureMessage?: string;
    files?: ExpectedFile[] | string;
    expectedErrors?: {message: string; location?: string};
    extraChecks?: (string | string[])[];
  };
  compilerOptions?: ConfigOptions;
  angularCompilerOptions?: ConfigOptions;
  skipForTemplatePipeline?: boolean;
  focusTest?: boolean;
  excludeTest?: boolean;
}
