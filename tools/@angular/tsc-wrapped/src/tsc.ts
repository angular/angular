/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync} from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import AngularCompilerOptions from './options';

/**
 * Our interface to the TypeScript standard compiler.
 * If you write an Angular compiler plugin for another build tool,
 * you should implement a similar interface.
 */
export interface CompilerInterface {
  readConfiguration(project: string, basePath: string, existingOptions?: ts.CompilerOptions):
      {parsed: ts.ParsedCommandLine, ngOptions: AngularCompilerOptions};
  typeCheck(compilerHost: ts.CompilerHost, program: ts.Program): void;
  emit(program: ts.Program): number;
}

export class UserError extends Error {
  private _nativeError: Error;

  constructor(message: string) {
    // Errors don't use current this, instead they create a new instance.
    // We have to do forward all of our api to the nativeInstance.
    const nativeError = super(message) as any as Error;
    this._nativeError = nativeError;
  }

  get message() { return this._nativeError.message; }
  set message(message) { this._nativeError.message = message; }
  get name() { return 'UserError'; }
  get stack() { return (this._nativeError as any).stack; }
  set stack(value) { (this._nativeError as any).stack = value; }
  toString() { return this._nativeError.toString(); }
}

const DEBUG = false;

function debug(msg: string, ...o: any[]) {
  // tslint:disable-next-line:no-console
  if (DEBUG) console.log(msg, ...o);
}

export function formatDiagnostics(diags: ts.Diagnostic[]): string {
  return diags
      .map((d) => {
        let res = ts.DiagnosticCategory[d.category];
        if (d.file) {
          res += ' at ' + d.file.fileName + ':';
          const {line, character} = d.file.getLineAndCharacterOfPosition(d.start);
          res += (line + 1) + ':' + (character + 1) + ':';
        }
        res += ' ' + ts.flattenDiagnosticMessageText(d.messageText, '\n');
        return res;
      })
      .join('\n');
}

export function check(diags: ts.Diagnostic[]) {
  if (diags && diags.length && diags[0]) {
    throw new UserError(formatDiagnostics(diags));
  }
}

export function validateAngularCompilerOptions(options: AngularCompilerOptions): ts.Diagnostic[] {
  if (options.annotationsAs) {
    switch (options.annotationsAs) {
      case 'decorators':
      case 'static fields':
        break;
      default:
        return [{
          file: null,
          start: null,
          length: null,
          messageText:
              'Angular compiler options "annotationsAs" only supports "static fields" and "decorators"',
          category: ts.DiagnosticCategory.Error,
          code: 0
        }];
    }
  }
}

export class Tsc implements CompilerInterface {
  public ngOptions: AngularCompilerOptions;
  public parsed: ts.ParsedCommandLine;
  private basePath: string;

  constructor(private readFile = ts.sys.readFile, private readDirectory = ts.sys.readDirectory) {}

  readConfiguration(project: string, basePath: string, existingOptions?: ts.CompilerOptions) {
    this.basePath = basePath;

    // Allow a directory containing tsconfig.json as the project value
    // Note, TS@next returns an empty array, while earlier versions throw
    try {
      if (this.readDirectory(project).length > 0) {
        project = path.join(project, 'tsconfig.json');
      }
    } catch (e) {
      // Was not a directory, continue on assuming it's a file
    }

    const {config, error} = ts.readConfigFile(project, this.readFile);
    check([error]);

    // Do not inline `host` into `parseJsonConfigFileContent` until after
    // g3 is updated to the latest TypeScript.
    // The issue is that old typescript only has `readDirectory` while
    // the newer TypeScript has additional `useCaseSensitiveFileNames` and
    // `fileExists`. Inlining will trigger an error of extra parameters.
    const host = {
      useCaseSensitiveFileNames: true,
      fileExists: existsSync,
      readDirectory: this.readDirectory
    };
    this.parsed = ts.parseJsonConfigFileContent(config, host, basePath, existingOptions);

    check(this.parsed.errors);

    // Default codegen goes to the current directory
    // Parsed options are already converted to absolute paths
    this.ngOptions = config.angularCompilerOptions || {};
    this.ngOptions.genDir = path.join(basePath, this.ngOptions.genDir || '.');
    for (const key of Object.keys(this.parsed.options)) {
      this.ngOptions[key] = this.parsed.options[key];
    }
    check(validateAngularCompilerOptions(this.ngOptions));

    return {parsed: this.parsed, ngOptions: this.ngOptions};
  }

  typeCheck(compilerHost: ts.CompilerHost, program: ts.Program): void {
    debug('Checking global diagnostics...');
    check(program.getGlobalDiagnostics());

    const diagnostics: ts.Diagnostic[] = [];
    debug('Type checking...');

    for (const sf of program.getSourceFiles()) {
      diagnostics.push(...ts.getPreEmitDiagnostics(program, sf));
    }
    check(diagnostics);
  }

  emit(program: ts.Program): number {
    debug('Emitting outputs...');
    const emitResult = program.emit();
    const diagnostics: ts.Diagnostic[] = [];
    diagnostics.push(...emitResult.diagnostics);
    return emitResult.emitSkipped ? 1 : 0;
  }
}
export const tsc: CompilerInterface = new Tsc();
