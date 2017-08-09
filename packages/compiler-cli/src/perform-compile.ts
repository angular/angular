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

export type Diagnostics = Array<ts.Diagnostic|api.Diagnostic>;

function isTsDiagnostic(diagnostic: any): diagnostic is ts.Diagnostic {
  return diagnostic && (diagnostic.file || diagnostic.messageText);
}

export function formatDiagnostics(cwd: string, diags: Diagnostics): string {
  if (diags && diags.length) {
    return diags
        .map(d => {
          let output = '';
          if (isTsDiagnostic(d)) {
            if (d.file) {
              const {line, character} = ts.getLineAndCharacterOfPosition(d.file, d.start);
              const fileName = d.file.fileName;
              const relativeFileName = path.relative(cwd, fileName);
              output += `${relativeFileName}(${line + 1},${character + 1}): `;
            }

            const category = ts.DiagnosticCategory[d.category].toLowerCase();
            output +=
                `${category} TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, ts.sys.newLine)}${ts.sys.newLine}`;
            return output;
          } else {
            let res = ts.DiagnosticCategory[d.category];
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
          }
        })
        .join();
  } else
    return '';
}

export interface ParsedConfiguration {
  options: api.CompilerOptions;
  fileNames: string[];
  errors: ts.Diagnostic[];
}

export function readConfiguration(
    project: string, basePath: string, existingOptions?: ts.CompilerOptions): ParsedConfiguration {
  // Allow a directory containing tsconfig.json as the project value
  // Note, TS@next returns an empty array, while earlier versions throw
  const projectFile =
      fs.lstatSync(project).isDirectory() ? path.join(project, 'tsconfig.json') : project;
  let {config, error} = ts.readConfigFile(projectFile, ts.sys.readFile);

  if (error) {
    return {errors: [error], fileNames: [], options: {}};
  }
  const parseConfigHost = {
    useCaseSensitiveFileNames: true,
    fileExists: fs.existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: ts.sys.readFile
  };
  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingOptions);

  const ngOptions: api.CompilerOptions =
      {...parsed.options, ...config.angularCompilerOptions, genDir: basePath, basePath};

  return {fileNames: parsed.fileNames, options: ngOptions, errors: parsed.errors};
}

export interface PerformCompilationHost {
  reportDiagnostics(diags: Diagnostics): void;
  shouldAbortCompilation(diags: Diagnostics): boolean;
  readConfiguration(): ParsedConfiguration;
  createCompilerHost(options: api.CompilerOptions): api.CompilerHost;
}

export function createPerformCompilationHost(
    configFileName: string, basePath: string,
    consoleError: (s: string) => void = console.error): PerformCompilationHost {
  return {
    reportDiagnostics: (diags: Diagnostics) => consoleError(formatDiagnostics(basePath, diags)),
    shouldAbortCompilation: (diags: Diagnostics) => diags &&
        diags.filter(d => d.category === ts.DiagnosticCategory.Error).length > 0,
    createCompilerHost: (options: api.CompilerOptions) => ng.createHost({options}),
    readConfiguration: () => readConfiguration(configFileName, basePath),
  };
}

export enum CompileExitCode {
  Ok = 0,
  Diagnostics = 1,
  UnexpectedErrors = 2
}

export function performCompilation(
    configFileName: string, basePath: string,
    host: PerformCompilationHost = createPerformCompilationHost(configFileName, basePath),
    oldProgram?: api.Program): {
  exitCode: CompileExitCode,
  emitResult?: api.EmitResult,
  program?: api.Program,
  parsedConfig?: ParsedConfiguration,
  compilerHost?: api.CompilerHost
} {
  const [major, minor] = ts.version.split('.');

  if (+major < 2 || (+major === 2 && +minor < 3)) {
    throw new Error('Must use TypeScript > 2.3 to have transformer support');
  }

  const allDiagnostics: Diagnostics = [];

  function checkAndAddDiagnostics(diags: Diagnostics | undefined) {
    if (diags) {
      allDiagnostics.push(...diags);
      return !host.shouldAbortCompilation(diags);
    }
    return true;
  }

  let program: api.Program|undefined;
  let parsedConfig: ParsedConfiguration|undefined;
  let compilerHost: api.CompilerHost|undefined;
  let exitCode: CompileExitCode;
  let emitResult: api.EmitResult|undefined;
  try {
    let shouldEmit = true;

    parsedConfig = host.readConfiguration();
    shouldEmit = shouldEmit && checkAndAddDiagnostics(parsedConfig.errors);

    if (parsedConfig.errors.length) {
      shouldEmit = false;
      allDiagnostics.push(...parsedConfig.errors);
    }
    if (parsedConfig.options.disableTransformerPipeline) {
      shouldEmit = false;
    }
    if (shouldEmit) {
      compilerHost = host.createCompilerHost(parsedConfig.options);
      program = ng.createProgram({
        rootNames: parsedConfig.fileNames,
        host: compilerHost,
        options: parsedConfig.options, oldProgram
      });
    }

    // Check parameter diagnostics
    shouldEmit = shouldEmit && checkAndAddDiagnostics([
                   ...program !.getTsOptionDiagnostics(), ...program !.getNgOptionDiagnostics()
                 ]);

    // Check syntactic diagnostics
    shouldEmit = shouldEmit && checkAndAddDiagnostics(program !.getTsSyntacticDiagnostics());

    // Check TypeScript semantic and Angular structure diagnostics
    shouldEmit =
        shouldEmit &&
        checkAndAddDiagnostics(
            [...program !.getTsSemanticDiagnostics(), ...program !.getNgStructuralDiagnostics()]);

    // Check Angular semantic diagnostics
    shouldEmit = shouldEmit && checkAndAddDiagnostics(program !.getNgSemanticDiagnostics());

    if (shouldEmit) {
      const emitResult = program !.emit({
        emitFlags: api.EmitFlags.Default |
            ((parsedConfig.options.skipMetadataEmit || parsedConfig.options.flatModuleOutFile) ?
                 0 :
                 api.EmitFlags.Metadata)
      });
      allDiagnostics.push(...emitResult.diagnostics);
      exitCode = CompileExitCode.Ok;
    } else {
      exitCode = allDiagnostics.length ? CompileExitCode.Ok : CompileExitCode.Diagnostics;
    }
  } catch (e) {
    let errMsg: string;
    if (isSyntaxError(e)) {
      exitCode = CompileExitCode.Diagnostics;
      errMsg = e.message;
    } else {
      exitCode = CompileExitCode.UnexpectedErrors;
      errMsg = e.stack;
    }
    allDiagnostics.push({
      category: ts.DiagnosticCategory.Error,
      message: errMsg,
    });
  }
  if (allDiagnostics.length) {
    host.reportDiagnostics(allDiagnostics);
  }
  return {exitCode, parsedConfig, compilerHost, program, emitResult};
}