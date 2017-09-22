/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isSyntaxError, syntaxError} from '@angular/compiler';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import * as api from './transformers/api';
import * as ng from './transformers/entry_points';

const TS_EXT = /\.ts$/;

export type Diagnostics = Array<ts.Diagnostic|api.Diagnostic>;

export function formatDiagnostics(options: api.CompilerOptions, diags: Diagnostics): string {
  if (diags && diags.length) {
    const tsFormatHost: ts.FormatDiagnosticsHost = {
      getCurrentDirectory: () => options.basePath || process.cwd(),
      getCanonicalFileName: fileName => fileName,
      getNewLine: () => ts.sys.newLine
    };
    return diags
        .map(d => {
          if (api.isTsDiagnostic(d)) {
            return ts.formatDiagnostics([d], tsFormatHost);
          } else {
            let res = ts.DiagnosticCategory[d.category];
            if (d.span) {
              res +=
                  ` at ${d.span.start.file.url}(${d.span.start.line + 1},${d.span.start.col + 1})`;
            }
            if (d.span && d.span.details) {
              res += `: ${d.span.details}, ${d.messageText}\n`;
            } else {
              res += `: ${d.messageText}\n`;
            }
            return res;
          }
        })
        .join('');
  } else
    return '';
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

    let {config, error} = ts.readConfigFile(projectFile, ts.sys.readFile);

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
  if (!diags || diags.length === 0) {
    // If we have a result and didn't get any errors, we succeeded.
    return 0;
  }

  // Return 2 if any of the errors were unknown.
  return diags.some(d => d.source === 'angular' && d.code === api.UNKNOWN_ERROR_CODE) ? 2 : 1;
}

export function performCompilation({rootNames, options, host, oldProgram, emitCallback,
                                    gatherDiagnostics = defaultGatherDiagnostics,
                                    customTransformers, emitFlags = api.EmitFlags.Default}: {
  rootNames: string[],
  options: api.CompilerOptions,
  host?: api.CompilerHost,
  oldProgram?: api.Program,
  emitCallback?: api.TsEmitCallback,
  gatherDiagnostics?: (program: api.Program) => Diagnostics,
  customTransformers?: api.CustomTransformers,
  emitFlags?: api.EmitFlags
}): PerformCompilationResult {
  let program: api.Program|undefined;
  let emitResult: ts.EmitResult|undefined;
  let allDiagnostics: Diagnostics = [];
  try {
    if (!host) {
      host = ng.createCompilerHost({options});
    }

    program = ng.createProgram({rootNames, host, options, oldProgram});

    allDiagnostics.push(...gatherDiagnostics(program !));

    if (!hasErrors(allDiagnostics)) {
      emitResult = program !.emit({emitCallback, customTransformers, emitFlags});
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
  const allDiagnostics: Diagnostics = [];

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
      checkOtherDiagnostics && checkDiagnostics(program.getTsSyntacticDiagnostics());

  // Check TypeScript semantic and Angular structure diagnostics
  checkOtherDiagnostics =
      checkOtherDiagnostics &&
      checkDiagnostics(
          [...program.getTsSemanticDiagnostics(), ...program.getNgStructuralDiagnostics()]);

  // Check Angular semantic diagnostics
  checkOtherDiagnostics =
      checkOtherDiagnostics && checkDiagnostics(program.getNgSemanticDiagnostics());

  return allDiagnostics;
}

function hasErrors(diags: Diagnostics) {
  return diags.some(d => d.category === ts.DiagnosticCategory.Error);
}
