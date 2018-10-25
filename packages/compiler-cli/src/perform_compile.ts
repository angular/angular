/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Position, isSyntaxError, syntaxError} from '@angular/compiler';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import * as api from './transformers/api';
import * as ng from './transformers/entry_points';
import {createMessageDiagnostic} from './transformers/util';

const TS_EXT = /\.ts$/;

export type Diagnostics = ReadonlyArray<ts.Diagnostic|api.Diagnostic>;

export function filterErrorsAndWarnings(diagnostics: Diagnostics): Diagnostics {
  return diagnostics.filter(d => d.category !== ts.DiagnosticCategory.Message);
}

const defaultFormatHost: ts.FormatDiagnosticsHost = {
  getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
  getCanonicalFileName: fileName => fileName,
  getNewLine: () => ts.sys.newLine
};

function displayFileName(fileName: string, host: ts.FormatDiagnosticsHost): string {
  return path.relative(host.getCurrentDirectory(), host.getCanonicalFileName(fileName));
}

export function formatDiagnosticPosition(
    position: Position, host: ts.FormatDiagnosticsHost = defaultFormatHost): string {
  return `${displayFileName(position.fileName, host)}(${position.line + 1},${position.column+1})`;
}

export function flattenDiagnosticMessageChain(
    chain: api.DiagnosticMessageChain, host: ts.FormatDiagnosticsHost = defaultFormatHost): string {
  let result = chain.messageText;
  let indent = 1;
  let current = chain.next;
  const newLine = host.getNewLine();
  while (current) {
    result += newLine;
    for (let i = 0; i < indent; i++) {
      result += '  ';
    }
    result += current.messageText;
    const position = current.position;
    if (position) {
      result += ` at ${formatDiagnosticPosition(position, host)}`;
    }
    current = current.next;
    indent++;
  }
  return result;
}

export function formatDiagnostic(
    diagnostic: api.Diagnostic, host: ts.FormatDiagnosticsHost = defaultFormatHost) {
  let result = '';
  const newLine = host.getNewLine();
  const span = diagnostic.span;
  if (span) {
    result += `${formatDiagnosticPosition({
      fileName: span.start.file.url,
      line: span.start.line,
      column: span.start.col
    }, host)}: `;
  } else if (diagnostic.position) {
    result += `${formatDiagnosticPosition(diagnostic.position, host)}: `;
  }
  if (diagnostic.span && diagnostic.span.details) {
    result += `: ${diagnostic.span.details}, ${diagnostic.messageText}${newLine}`;
  } else if (diagnostic.chain) {
    result += `${flattenDiagnosticMessageChain(diagnostic.chain, host)}.${newLine}`;
  } else {
    result += `: ${diagnostic.messageText}${newLine}`;
  }
  return result;
}

export function formatDiagnostics(
    diags: Diagnostics, host: ts.FormatDiagnosticsHost = defaultFormatHost): string {
  if (diags && diags.length) {
    return diags
        .map(diagnostic => {
          if (api.isTsDiagnostic(diagnostic)) {
            return ts.formatDiagnostics([diagnostic], host);
          } else {
            return formatDiagnostic(diagnostic, host);
          }
        })
        .join('');
  } else {
    return '';
  }
}

export interface ParsedConfiguration {
  project: string;
  options: api.CompilerOptions;
  rootNames: string[];
  emitFlags: api.EmitFlags;
  errors: Diagnostics;
}

export function calcProjectFileAndBasePath(project: string):
    {projectFile: string, basePath: string} {
  const projectIsDir = fs.lstatSync(project).isDirectory();
  const projectFile = projectIsDir ? path.join(project, 'tsconfig.json') : project;
  const projectDir = projectIsDir ? project : path.dirname(project);
  const basePath = path.resolve(process.cwd(), projectDir);
  return {projectFile, basePath};
}

export function createNgCompilerOptions(
    basePath: string, config: any, tsOptions: ts.CompilerOptions): api.CompilerOptions {
  return {...tsOptions, ...config.angularCompilerOptions, genDir: basePath, basePath};
}

export function readConfiguration(
    project: string, existingOptions?: ts.CompilerOptions): ParsedConfiguration {
  try {
    const {projectFile, basePath} = calcProjectFileAndBasePath(project);

    const readExtendedConfigFile =
        (configFile: string, existingConfig?: any): {config?: any, error?: ts.Diagnostic} => {
          const {config, error} = ts.readConfigFile(configFile, ts.sys.readFile);

          if (error) {
            return {error};
          }

          // we are only interested into merging 'angularCompilerOptions' as
          // other options like 'compilerOptions' are merged by TS
          const baseConfig = existingConfig || config;
          if (existingConfig) {
            baseConfig.angularCompilerOptions = {...config.angularCompilerOptions,
                                                 ...baseConfig.angularCompilerOptions};
          }

          if (config.extends) {
            let extendedConfigPath = path.resolve(path.dirname(configFile), config.extends);
            extendedConfigPath = path.extname(extendedConfigPath) ? extendedConfigPath :
                                                                    `${extendedConfigPath}.json`;

            if (fs.existsSync(extendedConfigPath)) {
              // Call read config recursively as TypeScript only merges CompilerOptions
              return readExtendedConfigFile(extendedConfigPath, baseConfig);
            }
          }

          return {config: baseConfig};
        };

    const {config, error} = readExtendedConfigFile(projectFile);

    if (error) {
      return {
        project,
        errors: [error],
        rootNames: [],
        options: {},
        emitFlags: api.EmitFlags.Default
      };
    }
    const parseConfigHost = {
      useCaseSensitiveFileNames: true,
      fileExists: fs.existsSync,
      readDirectory: ts.sys.readDirectory,
      readFile: ts.sys.readFile
    };
    const parsed =
        ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingOptions);
    const rootNames = parsed.fileNames.map(f => path.normalize(f));

    const options = createNgCompilerOptions(basePath, config, parsed.options);
    let emitFlags = api.EmitFlags.Default;
    if (!(options.skipMetadataEmit || options.flatModuleOutFile)) {
      emitFlags |= api.EmitFlags.Metadata;
    }
    if (options.skipTemplateCodegen) {
      emitFlags = emitFlags & ~api.EmitFlags.Codegen;
    }
    return {project: projectFile, rootNames, options, errors: parsed.errors, emitFlags};
  } catch (e) {
    const errors: Diagnostics = [{
      category: ts.DiagnosticCategory.Error,
      messageText: e.stack,
      source: api.SOURCE,
      code: api.UNKNOWN_ERROR_CODE
    }];
    return {project: '', errors, rootNames: [], options: {}, emitFlags: api.EmitFlags.Default};
  }
}

export interface PerformCompilationResult {
  diagnostics: Diagnostics;
  program?: api.Program;
  emitResult?: ts.EmitResult;
}

export function exitCodeFromResult(diags: Diagnostics | undefined): number {
  if (!diags || filterErrorsAndWarnings(diags).length === 0) {
    // If we have a result and didn't get any errors, we succeeded.
    return 0;
  }

  // Return 2 if any of the errors were unknown.
  return diags.some(d => d.source === 'angular' && d.code === api.UNKNOWN_ERROR_CODE) ? 2 : 1;
}

export function performCompilation({rootNames, options, host, oldProgram, emitCallback,
                                    mergeEmitResultsCallback,
                                    gatherDiagnostics = defaultGatherDiagnostics,
                                    customTransformers, emitFlags = api.EmitFlags.Default}: {
  rootNames: string[],
  options: api.CompilerOptions,
  host?: api.CompilerHost,
  oldProgram?: api.Program,
  emitCallback?: api.TsEmitCallback,
  mergeEmitResultsCallback?: api.TsMergeEmitResultsCallback,
  gatherDiagnostics?: (program: api.Program) => Diagnostics,
  customTransformers?: api.CustomTransformers,
  emitFlags?: api.EmitFlags
}): PerformCompilationResult {
  let program: api.Program|undefined;
  let emitResult: ts.EmitResult|undefined;
  let allDiagnostics: Array<ts.Diagnostic|api.Diagnostic> = [];
  try {
    if (!host) {
      host = ng.createCompilerHost({options});
    }

    program = ng.createProgram({rootNames, host, options, oldProgram});

    const beforeDiags = Date.now();
    allDiagnostics.push(...gatherDiagnostics(program !));
    if (options.diagnostics) {
      const afterDiags = Date.now();
      allDiagnostics.push(
          createMessageDiagnostic(`Time for diagnostics: ${afterDiags - beforeDiags}ms.`));
    }

    if (!hasErrors(allDiagnostics)) {
      emitResult =
          program !.emit({emitCallback, mergeEmitResultsCallback, customTransformers, emitFlags});
      allDiagnostics.push(...emitResult.diagnostics);
      return {diagnostics: allDiagnostics, program, emitResult};
    }
    return {diagnostics: allDiagnostics, program};
  } catch (e) {
    let errMsg: string;
    let code: number;
    if (isSyntaxError(e)) {
      // don't report the stack for syntax errors as they are well known errors.
      errMsg = e.message;
      code = api.DEFAULT_ERROR_CODE;
    } else {
      errMsg = e.stack;
      // It is not a syntax error we might have a program with unknown state, discard it.
      program = undefined;
      code = api.UNKNOWN_ERROR_CODE;
    }
    allDiagnostics.push(
        {category: ts.DiagnosticCategory.Error, messageText: errMsg, code, source: api.SOURCE});
    return {diagnostics: allDiagnostics, program};
  }
}
function defaultGatherDiagnostics(program: api.Program): Diagnostics {
  const allDiagnostics: Array<ts.Diagnostic|api.Diagnostic> = [];

  function checkDiagnostics(diags: Diagnostics | undefined) {
    if (diags) {
      allDiagnostics.push(...diags);
      return !hasErrors(diags);
    }
    return true;
  }

  let checkOtherDiagnostics = true;
  // Check parameter diagnostics
  checkOtherDiagnostics = checkOtherDiagnostics &&
      checkDiagnostics([...program.getTsOptionDiagnostics(), ...program.getNgOptionDiagnostics()]);

  // Check syntactic diagnostics
  checkOtherDiagnostics =
      checkOtherDiagnostics && checkDiagnostics(program.getTsSyntacticDiagnostics() as Diagnostics);

  // Check TypeScript semantic and Angular structure diagnostics
  checkOtherDiagnostics =
      checkOtherDiagnostics &&
      checkDiagnostics(
          [...program.getTsSemanticDiagnostics(), ...program.getNgStructuralDiagnostics()]);

  // Check Angular semantic diagnostics
  checkOtherDiagnostics =
      checkOtherDiagnostics && checkDiagnostics(program.getNgSemanticDiagnostics() as Diagnostics);

  return allDiagnostics;
}

function hasErrors(diags: Diagnostics) {
  return diags.some(d => d.category === ts.DiagnosticCategory.Error);
}
