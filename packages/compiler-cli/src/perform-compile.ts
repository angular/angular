/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isSyntaxError, syntaxError} from '@angular/compiler';
import {createBundleIndexHost} from '@angular/tsc-wrapped';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import * as api from './transformers/api';
import * as ng from './transformers/entry_points';

const TS_EXT = /\.ts$/;

export type Diagnostics = ts.Diagnostic[] | api.Diagnostic[];

function isTsDiagnostics(diagnostics: any): diagnostics is ts.Diagnostic[] {
  return diagnostics && diagnostics[0] && (diagnostics[0].file || diagnostics[0].messageText);
}

function formatDiagnostics(cwd: string, diags: Diagnostics): string {
  if (diags && diags.length) {
    if (isTsDiagnostics(diags)) {
      return ts.formatDiagnostics(diags, {
        getCurrentDirectory: () => cwd,
        getCanonicalFileName: fileName => fileName,
        getNewLine: () => ts.sys.newLine
      });
    } else {
      return diags
          .map(d => {
            let res = api.DiagnosticCategory[d.category];
            if (d.span) {
              res +=
                  ` at ${d.span.start.file.url}(${d.span.start.line + 1},${d.span.start.col + 1})`;
            }
            if (d.span && d.span.details) {
              res += `: ${d.span.details}, ${d.message}\n`;
            } else {
              res += `: ${d.message}\n`;
            }
            return res;
          })
          .join();
    }
  } else
    return '';
}

/**
 * Throw a syntax error exception with a message formatted for output
 * if the args parameter contains diagnostics errors.
 *
 * @param cwd   The directory to report error as relative to.
 * @param args  A list of potentially empty diagnostic errors.
 */
export function throwOnDiagnostics(cwd: string, ...args: Diagnostics[]) {
  if (args.some(diags => !!(diags && diags[0]))) {
    throw syntaxError(args.map(diags => {
                            if (diags && diags[0]) {
                              return formatDiagnostics(cwd, diags);
                            }
                          })
                          .filter(message => !!message)
                          .join(''));
  }
}

export function readConfiguration(
    project: string, basePath: string,
    checkFunc: (cwd: string, ...args: any[]) => void = throwOnDiagnostics,
    existingOptions?: ts.CompilerOptions) {
  // Allow a directory containing tsconfig.json as the project value
  // Note, TS@next returns an empty array, while earlier versions throw
  const projectFile =
      fs.lstatSync(project).isDirectory() ? path.join(project, 'tsconfig.json') : project;
  let {config, error} = ts.readConfigFile(projectFile, ts.sys.readFile);

  if (error) checkFunc(basePath, [error]);
  const parseConfigHost = {
    useCaseSensitiveFileNames: true,
    fileExists: fs.existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: ts.sys.readFile
  };
  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingOptions);

  checkFunc(basePath, parsed.errors);

  // Default codegen goes to the current directory
  // Parsed options are already converted to absolute paths
  const ngOptions = config.angularCompilerOptions || {};
  // Ignore the genDir option
  ngOptions.genDir = basePath;

  return {parsed, ngOptions};
}

/**
 * Returns an object with two properties:
 * - `errorCode` is 0 when the compilation was successful,
 * - `result` is an `EmitResult` when the errorCode is 0, `undefined` otherwise.
 */
export function performCompilation(
    basePath: string, files: string[], options: ts.CompilerOptions, ngOptions: api.CompilerOptions,
    consoleError: (s: string) => void = console.error,
    checkFunc: (cwd: string, ...args: any[]) => void = throwOnDiagnostics,
    tsCompilerHost?: ts.CompilerHost): {errorCode: number, result?: api.EmitResult} {
  const [major, minor] = ts.version.split('.');

  if (+major < 2 || (+major === 2 && +minor < 3)) {
    throw new Error('Must use TypeScript > 2.3 to have transformer support');
  }

  try {
    ngOptions.basePath = basePath;
    ngOptions.genDir = basePath;

    let host = tsCompilerHost || ts.createCompilerHost(options, true);
    host.realpath = p => p;

    const rootFileNames = files.map(f => path.normalize(f));

    const addGeneratedFileName = (fileName: string) => {
      if (fileName.startsWith(basePath) && TS_EXT.exec(fileName)) {
        rootFileNames.push(fileName);
      }
    };

    if (ngOptions.flatModuleOutFile && !ngOptions.skipMetadataEmit) {
      const {host: bundleHost, indexName, errors} =
          createBundleIndexHost(ngOptions, rootFileNames, host);
      if (errors) checkFunc(basePath, errors);
      if (indexName) addGeneratedFileName(indexName);
      host = bundleHost;
    }

    const ngHostOptions = {...options, ...ngOptions};
    const ngHost = ng.createHost({tsHost: host, options: ngHostOptions});

    const ngProgram =
        ng.createProgram({rootNames: rootFileNames, host: ngHost, options: ngHostOptions});

    // Check parameter diagnostics
    checkFunc(basePath, ngProgram.getTsOptionDiagnostics(), ngProgram.getNgOptionDiagnostics());

    // Check syntactic diagnostics
    checkFunc(basePath, ngProgram.getTsSyntacticDiagnostics());

    // Check TypeScript semantic and Angular structure diagnostics
    checkFunc(
        basePath, ngProgram.getTsSemanticDiagnostics(), ngProgram.getNgStructuralDiagnostics());

    // Check Angular semantic diagnostics
    checkFunc(basePath, ngProgram.getNgSemanticDiagnostics());

    const result = ngProgram.emit({
      emitFlags: api.EmitFlags.Default |
          ((ngOptions.skipMetadataEmit || ngOptions.flatModuleOutFile) ? 0 : api.EmitFlags.Metadata)
    });

    checkFunc(basePath, result.diagnostics);

    return {errorCode: 0, result};
  } catch (e) {
    if (isSyntaxError(e)) {
      consoleError(e.message);
      return {errorCode: 1};
    }

    throw e;
  }
}