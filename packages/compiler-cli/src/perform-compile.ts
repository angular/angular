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

export function formatDiagnostics(options: api.CompilerOptions, diags: Diagnostics): string {
  if (diags && diags.length) {
    const tsFormatHost: ts.FormatDiagnosticsHost = {
      getCurrentDirectory: () => options.basePath || process.cwd(),
      getCanonicalFileName: fileName => fileName,
      getNewLine: () => ts.sys.newLine
    };
    return diags
        .map(d => {
          if (isTsDiagnostic(d)) {
            return ts.formatDiagnostics([d], tsFormatHost);
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
  rootNames: string[];
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
      return {errors: [error], rootNames: [], options: {}};
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
    return {rootNames, options, errors: parsed.errors};
  } catch (e) {
    const errors: Diagnostics = [{
      category: ts.DiagnosticCategory.Error,
      message: e.stack,
    }];
    return {errors, rootNames: [], options: {}};
  }
}

export function performCompilation(
    {rootNames, options, host, oldProgram, emitCallback, customTransformers}: {
      rootNames: string[],
      options: api.CompilerOptions,
      host?: api.CompilerHost,
      oldProgram?: api.Program,
      emitCallback?: api.TsEmitCallback,
      customTransformers?: api.CustomTransformers
    }): {
  program?: api.Program,
  emitResult?: ts.EmitResult,
  diagnostics: Diagnostics,
} {
  const [major, minor] = ts.version.split('.');

  if (Number(major) < 2 || (Number(major) === 2 && Number(minor) < 3)) {
    throw new Error('Must use TypeScript > 2.3 to have transformer support');
  }

  const allDiagnostics: Diagnostics = [];

  function checkDiagnostics(diags: Diagnostics | undefined) {
    if (diags) {
      allDiagnostics.push(...diags);
      return diags.every(d => d.category !== ts.DiagnosticCategory.Error);
    }
    return true;
  }

  let program: api.Program|undefined;
  let emitResult: ts.EmitResult|undefined;
  try {
    if (!host) {
      host = ng.createCompilerHost({options});
    }

    program = ng.createProgram({rootNames, host, options, oldProgram});

    let shouldEmit = true;
    // Check parameter diagnostics
    shouldEmit = shouldEmit && checkDiagnostics([
                   ...program !.getTsOptionDiagnostics(), ...program !.getNgOptionDiagnostics()
                 ]);

    // Check syntactic diagnostics
    shouldEmit = shouldEmit && checkDiagnostics(program !.getTsSyntacticDiagnostics());

    // Check TypeScript semantic and Angular structure diagnostics
    shouldEmit =
        shouldEmit &&
        checkDiagnostics(
            [...program !.getTsSemanticDiagnostics(), ...program !.getNgStructuralDiagnostics()]);

    // Check Angular semantic diagnostics
    shouldEmit = shouldEmit && checkDiagnostics(program !.getNgSemanticDiagnostics());

    if (shouldEmit) {
      emitResult = program !.emit({
        emitCallback,
        customTransformers,
        emitFlags: api.EmitFlags.Default |
            ((options.skipMetadataEmit || options.flatModuleOutFile) ? 0 : api.EmitFlags.Metadata)
      });
      allDiagnostics.push(...emitResult.diagnostics);
    }
  } catch (e) {
    let errMsg: string;
    if (isSyntaxError(e)) {
      // don't report the stack for syntax errors as they are well known errors.
      errMsg = e.message;
    } else {
      errMsg = e.stack;
    }
    allDiagnostics.push({
      category: ts.DiagnosticCategory.Error,
      message: errMsg,
    });
  }
  return {program, emitResult, diagnostics: allDiagnostics};
}