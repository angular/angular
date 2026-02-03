/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {checkExpectations} from '../test_helpers/check_expectations';
import {checkNoUnexpectedErrors} from '../test_helpers/check_errors';
import {FileSystem} from '../../../src/ngtsc/file_system';
import {NgtscIsolatedPreprocessor} from '../../../src/ngtsc/preprocessor';
import {NgtscTestCompilerHost} from '../../../src/ngtsc/testing';
import {
  CompileResult,
  getBuildOutputDirectory,
  initMockTestFileSystem,
  getOptions,
  getRootDirectory,
} from '../test_helpers/compile_test';
import {ComplianceTest, getAllComplianceTests} from '../test_helpers/get_compliance_tests';

describe('isolated compliance tests', () => {
  for (const test of getAllComplianceTests()) {
    if (!test.relativePath.includes('isolated')) {
      continue;
    }
    describe(`[${test.relativePath}]`, () => {
      it(test.description, async () => {
        const fs = initMockTestFileSystem(test.realTestPath);
        const {errors, emittedFiles} = await compileTests(fs, test);
        // Custom check for isolated tests which might not match standard compliance expectations
        // actually we want to reuse checkExpectations?
        // The issue is standard runTests expects .js files for 'local compile'.
        // Our isolated tests expect .ts files.
        // So we need our own runner loop.
        for (const expectation of test.expectations) {
          // Don't transform expectations for local compile (renaming to .local.js)
          // just check them directly.
          checkExpectations(
            fs,
            test.relativePath,
            expectation.failureMessage,
            expectation.files,
            expectation.extraChecks,
          );
          checkNoUnexpectedErrors(test.relativePath, errors);
        }
      });
    });
  }
});

async function compileTests(fs: FileSystem, test: ComplianceTest): Promise<CompileResult> {
  const rootDir = getRootDirectory(fs);
  const outDir = getBuildOutputDirectory(fs);
  const compilerOptions = test.compilerOptions;
  const angularCompilerOptions = test.angularCompilerOptions;

  const options = getOptions(rootDir, outDir, compilerOptions, angularCompilerOptions);
  // Resolve inputs relative to rootDir.
  const rootNames = test.inputFiles.map((f) => fs.resolve(rootDir, f));

  const host = new NgtscTestCompilerHost(fs, options);
  const preprocessor = new NgtscIsolatedPreprocessor(rootNames, options, host);
  await preprocessor.analyze();

  const transformedFiles = preprocessor.transformAndPrint();

  const emittedFiles: string[] = [];
  const validFiles = new Set<string>();

  for (const file of transformedFiles) {
    const relativePath = fs.relative(rootDir, fs.resolve(file.fileName));
    const path = fs.resolve(outDir, relativePath);
    fs.ensureDir(fs.dirname(path));
    fs.writeFile(path, file.content);
    emittedFiles.push(path);
    validFiles.add(path);
  }

  const verifyHost = new NgtscTestCompilerHost(fs, options);
  const verifyProgram = ts.createProgram({
    rootNames: [...emittedFiles],
    options: {
      ...test.compilerOptions,
      noEmit: true,
      skipLibCheck: true,
      // Ensure we can resolve the imports in the mock FS
      baseUrl: rootDir,
      paths: {
        '*': ['node_modules/*'],
      },
      // Use classic Node resolution which works better with the simple mock FS structure
      // than 'Bundler' or 'NodeNext' which expect specific package.json exports.
      moduleResolution: ts.ModuleResolutionKind.Node10,
      strict: true,
      // TODO: enable once we fix the generated code
      noImplicitAny: false,
      target: ts.ScriptTarget.ES2015,
      types: [],
    },
    host: verifyHost,
  });

  const verifyDiags = ts.getPreEmitDiagnostics(verifyProgram);

  return {
    emittedFiles: emittedFiles as any,
    errors: verifyDiags.map((d) => {
      let message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
      if (d.file) {
        const {line, character} = d.file.getLineAndCharacterOfPosition(d.start!);
        message = `${d.file.fileName} (${line + 1},${character + 1}): ${message}`;
      }
      return message;
    }),
  };
}
