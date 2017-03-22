#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* tslint:disable:no-console  */

// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';

import * as path from 'path';
import * as ts from 'typescript';
import * as assert from 'assert';
import {tsc} from '@angular/tsc-wrapped/src/tsc';
import {AngularCompilerOptions, CodeGenerator, CompilerHostContext, NodeCompilerHostContext} from '@angular/compiler-cli';

/**
 * Main method.
 * Standalone program that executes the real codegen and tests that
 * ngsummary.json files are used for libraries.
 */
function main() {
  console.log(`testing usage of ngsummary.json files in libraries...`);
  const basePath = path.resolve(__dirname, '..');
  const project = path.resolve(basePath, 'tsconfig-build.json');
  const readFiles: string[] = [];
  const writtenFiles: {fileName: string, content: string}[] = [];

  class AssertingHostContext extends NodeCompilerHostContext {
    readFile(fileName: string): string {
      if (/.*\/node_modules\/.*/.test(fileName) && !/.*ngsummary\.json$/.test(fileName) &&
          !/package\.json$/.test(fileName)) {
        // Only allow to read summaries and package.json files from node_modules
        // TODO (mhevery): Fix this. TypeScript.d.ts does not allow returning null.
        return null !;
      }
      readFiles.push(path.relative(basePath, fileName));
      return super.readFile(fileName);
    }
    readResource(s: string): Promise<string> {
      readFiles.push(path.relative(basePath, s));
      return super.readResource(s);
    }
  }

  const config = tsc.readConfiguration(project, basePath);
  config.ngOptions.basePath = basePath;
  // This flag tells ngc do not recompile libraries.
  config.ngOptions.generateCodeForLibraries = false;

  console.log(`>>> running codegen for ${project}`);
  codegen(
      config,
      (host) => {
        host.writeFile = (fileName: string, content: string) => {
          fileName = path.relative(basePath, fileName);
          writtenFiles.push({fileName, content});
        };
        return new AssertingHostContext();
      })
      .then((exitCode: any) => {
        console.log(`>>> codegen done, asserting read files`);
        assertSomeFileMatch(readFiles, /^node_modules\/.*\.ngsummary\.json$/);
        assertNoFileMatch(readFiles, /^node_modules\/.*\.metadata.json$/);
        assertNoFileMatch(readFiles, /^node_modules\/.*\.html$/);
        assertNoFileMatch(readFiles, /^node_modules\/.*\.css$/);

        assertNoFileMatch(readFiles, /^src\/.*\.ngsummary\.json$/);
        assertSomeFileMatch(readFiles, /^src\/.*\.html$/);
        assertSomeFileMatch(readFiles, /^src\/.*\.css$/);

        console.log(`>>> asserting written files`);
        assertWrittenFile(writtenFiles, /^src\/module\.ngfactory\.ts$/, /class MainModuleInjector/);

        console.log(`done, no errors.`);
        process.exit(exitCode);
      })
      .catch((e: any) => {
        console.error(e.stack);
        console.error('Compilation failed');
        process.exit(1);
      });
}

/**
 * Simple adaption of tsc-wrapped main to just run codegen with a CompilerHostContext
 */
function codegen(
    config: {parsed: ts.ParsedCommandLine, ngOptions: AngularCompilerOptions},
    hostContextFactory: (host: ts.CompilerHost) => CompilerHostContext) {
  const host = ts.createCompilerHost(config.parsed.options, true);

  // HACK: patch the realpath to solve symlink issue here:
  // https://github.com/Microsoft/TypeScript/issues/9552
  // todo(misko): remove once facade symlinks are removed
  host.realpath = (path) => path;

  const program = ts.createProgram(config.parsed.fileNames, config.parsed.options, host);

  return CodeGenerator.create(config.ngOptions, {
                      } as any, program, host, hostContextFactory(host)).codegen();
}

function assertSomeFileMatch(fileNames: string[], pattern: RegExp) {
  assert(
      fileNames.some(fileName => pattern.test(fileName)),
      `Expected some read files match ${pattern}`);
}

function assertNoFileMatch(fileNames: string[], pattern: RegExp) {
  const matches = fileNames.filter(fileName => pattern.test(fileName));
  assert(
      matches.length === 0,
      `Expected no read files match ${pattern}, but found: \n${matches.join('\n')}`);
}

function assertWrittenFile(
    files: {fileName: string, content: string}[], filePattern: RegExp, contentPattern: RegExp) {
  assert(
      files.some(file => filePattern.test(file.fileName) && contentPattern.test(file.content)),
      `Expected some written files for ${filePattern} and content ${contentPattern}`);
}

main();
