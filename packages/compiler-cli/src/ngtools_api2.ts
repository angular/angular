/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This is a private API for @ngtools/webpack. This API should be stable for NG 5.
 *
 * It contains copies of the interfaces needed and wrapper functions to ensure that
 * they are not broken accidentally.
 *
 * Once the ngc api is public and stable, this can be removed.
 */

/**
 *********************************************************************
 * Changes to this file need to be approved by the Angular CLI team. *
 *********************************************************************
 */

import {ParseSourceSpan} from '@angular/compiler';
import * as ts from 'typescript';

import {formatDiagnostics as formatDiagnosticsOrig} from './perform_compile';
import {Program as ProgramOrig} from './transformers/api';
import {createCompilerHost as createCompilerOrig} from './transformers/compiler_host';
import {createProgram as createProgramOrig} from './transformers/program';


// Interfaces from ./transformers/api;
export interface Diagnostic {
  messageText: string;
  span?: ParseSourceSpan;
  category: ts.DiagnosticCategory;
  code: number;
  source: 'angular';
}

export interface CompilerOptions extends ts.CompilerOptions {
  basePath?: string;
  skipMetadataEmit?: boolean;
  strictMetadataEmit?: boolean;
  skipTemplateCodegen?: boolean;
  flatModuleOutFile?: string;
  flatModuleId?: string;
  generateCodeForLibraries?: boolean;
  annotateForClosureCompiler?: boolean;
  annotationsAs?: 'decorators'|'static fields';
  trace?: boolean;
  disableExpressionLowering?: boolean;
  i18nOutLocale?: string;
  i18nOutFormat?: string;
  i18nOutFile?: string;
  i18nInFormat?: string;
  i18nInLocale?: string;
  i18nInFile?: string;
  i18nInMissingTranslations?: 'error'|'warning'|'ignore';
  preserveWhitespaces?: boolean;
  disableTypeScriptVersionCheck?: boolean;
}

export interface CompilerHost extends ts.CompilerHost {
  moduleNameToFileName?(moduleName: string, containingFile?: string): string|null;
  fileNameToModuleName?(importedFilePath: string, containingFilePath: string): string;
  resourceNameToFileName?(resourceName: string, containingFilePath: string): string|null;
  toSummaryFileName?(fileName: string, referringSrcFileName: string): string;
  fromSummaryFileName?(fileName: string, referringLibFileName: string): string;
  readResource?(fileName: string): Promise<string>|string;
}

export enum EmitFlags {
  DTS = 1 << 0,
  JS = 1 << 1,
  Metadata = 1 << 2,
  I18nBundle = 1 << 3,
  Codegen = 1 << 4,

  Default = DTS | JS | Codegen,
  All = DTS | JS | Metadata | I18nBundle | Codegen,
}

export interface CustomTransformers {
  beforeTs?: ts.TransformerFactory<ts.SourceFile>[];
  afterTs?: ts.TransformerFactory<ts.SourceFile>[];
}

export interface TsEmitArguments {
  program: ts.Program;
  host: CompilerHost;
  options: CompilerOptions;
  targetSourceFile?: ts.SourceFile;
  writeFile?: ts.WriteFileCallback;
  cancellationToken?: ts.CancellationToken;
  emitOnlyDtsFiles?: boolean;
  customTransformers?: ts.CustomTransformers;
}

export interface TsEmitCallback { (args: TsEmitArguments): ts.EmitResult; }

export interface LazyRoute {
  module: {name: string, filePath: string};
  route: string;
  referencedModule: {name: string, filePath: string};
}

export interface Program {
  getTsProgram(): ts.Program;
  getTsOptionDiagnostics(cancellationToken?: ts.CancellationToken): ReadonlyArray<ts.Diagnostic>;
  getNgOptionDiagnostics(cancellationToken?: ts.CancellationToken): ReadonlyArray<Diagnostic>;
  getTsSyntacticDiagnostics(sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken):
      ReadonlyArray<ts.Diagnostic>;
  getNgStructuralDiagnostics(cancellationToken?: ts.CancellationToken): ReadonlyArray<Diagnostic>;
  getTsSemanticDiagnostics(sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken):
      ReadonlyArray<ts.Diagnostic>;
  getNgSemanticDiagnostics(fileName?: string, cancellationToken?: ts.CancellationToken):
      ReadonlyArray<ts.Diagnostic|Diagnostic>;
  loadNgStructureAsync(): Promise<void>;
  listLazyRoutes(entryRoute?: string): LazyRoute[];
  emit({emitFlags, cancellationToken, customTransformers, emitCallback}: {
    emitFlags?: EmitFlags,
    cancellationToken?: ts.CancellationToken,
    customTransformers?: CustomTransformers,
    emitCallback?: TsEmitCallback
  }): ts.EmitResult;
}

// Wrapper for createProgram.
export function createProgram(
    {rootNames, options, host, oldProgram}:
        {rootNames: string[], options: CompilerOptions, host: CompilerHost, oldProgram?: Program}):
    Program {
  return createProgramOrig({rootNames, options, host, oldProgram: oldProgram as any});
}

// Wrapper for createCompilerHost.
export function createCompilerHost(
    {options, tsHost = ts.createCompilerHost(options, true)}:
        {options: CompilerOptions, tsHost?: ts.CompilerHost}): CompilerHost {
  return createCompilerOrig({options, tsHost});
}

// Wrapper for formatDiagnostics.
export type Diagnostics = ReadonlyArray<ts.Diagnostic|Diagnostic>;
export function formatDiagnostics(diags: Diagnostics): string {
  return formatDiagnosticsOrig(diags);
}
