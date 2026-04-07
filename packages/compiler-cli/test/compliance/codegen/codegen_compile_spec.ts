/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {AbsoluteFsPath, FileSystem} from '../../../src/ngtsc/file_system';
import {NgtscTestCompilerHost} from '../../../src/ngtsc/testing';
import {
  getBuildOutputDirectory,
  getOptions,
  getRootDirectory,
  CompileResult,
} from '../test_helpers/compile_test';
import {ComplianceTest} from '../test_helpers/get_compliance_tests';
import {NgtscIsolatedPreprocessor} from '@angular/compiler-cli/src/ngtsc/preprocessor';
import {runTests} from '../test_helpers/test_runner';

runTests('instruction compile', compileTests, {
  checkErrorsOnly: true,
});

function compileTests(fs: FileSystem, test: ComplianceTest): CompileResult {
  const rootDir = getRootDirectory(fs);
  const outDir = getBuildOutputDirectory(fs);
  const compilerOptions = test.compilerOptions;
  const angularCompilerOptions = test.angularCompilerOptions;

  const options = getOptions(rootDir, outDir, compilerOptions, angularCompilerOptions);
  const rootNames = test.inputFiles.map((f) => fs.resolve(rootDir, f));

  const host = new NgtscTestCompilerHost(fs, options);
  const preprocessor = new NgtscIsolatedPreprocessor(rootNames, options, host);

  const transformedFiles = preprocessor.transformAndPrint();

  const emittedFiles: AbsoluteFsPath[] = [];
  const validFiles = new Set<AbsoluteFsPath>();

  for (const file of transformedFiles) {
    if (file.fileName.includes('ngtypecheck.ts')) {
      continue;
    }

    const relativePath = fs.relative(rootDir, fs.resolve(file.fileName));
    const path = fs.resolve(outDir, relativePath);
    fs.ensureDir(fs.dirname(path));
    fs.writeFile(path, file.content);
    emittedFiles.push(path);
    validFiles.add(path);
  }

  const verifyHost = new NgtscTestCompilerHost(fs, options);
  const extraPaths = test.compilerOptions?.['paths'] as unknown as
    | Record<string, string[]>
    | undefined;
  const verifyProgram = ts.createProgram({
    rootNames: [...emittedFiles],
    options: {
      ...test.compilerOptions,
      noEmit: true,
      skipLibCheck: true,
      paths: {
        '*': ['./node_modules/*'],
        ...extraPaths,
      },
      // Use classic Node resolution which works better with the simple mock FS structure
      // than 'Bundler' or 'NodeNext' which expect specific package.json exports.
      moduleResolution: ts.ModuleResolutionKind.Node16,
      module: ts.ModuleKind.Node16,
      strict: true,
      target: ts.ScriptTarget.ES2015,
      experimentalDecorators: true,
      types: [],
    },
    host: verifyHost,
  });

  const verifyDiags = ts.getPreEmitDiagnostics(verifyProgram);

  return {
    emittedFiles: [],
    errors: verifyDiags.map((diagnostic) => {
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      if (diagnostic.file) {
        const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        message = `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
      }
      return message;
    }),
  };
}
