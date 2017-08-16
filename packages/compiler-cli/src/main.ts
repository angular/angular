#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';

import * as ts from 'typescript';
import * as tsc from '@angular/tsc-wrapped';
import * as fs from 'fs';
import * as path from 'path';
import * as tsickle from 'tsickle';
import * as api from './transformers/api';
import * as ngc from './transformers/entry_points';
import {performCompilation, readConfiguration, formatDiagnostics, Diagnostics, ParsedConfiguration} from './perform-compile';

import {isSyntaxError} from '@angular/compiler';
import {CodeGenerator} from './codegen';

export function main(
    args: string[], consoleError: (s: string) => void = console.error): Promise<number> {
  const parsedArgs = require('minimist')(args);
  const {rootNames, options, errors: configErrors} = readCommandLineAndConfiguration(parsedArgs);
  if (configErrors.length) {
    return Promise.resolve(reportErrorsAndExit(options, configErrors, consoleError));
  }
  if (options.disableTransformerPipeline) {
    return disabledTransformerPipelineNgcMain(parsedArgs, consoleError);
  }
  const {diagnostics: compileDiags} =
      performCompilation({rootNames, options, emitCallback: createEmitCallback(options)});
  return Promise.resolve(reportErrorsAndExit(options, compileDiags, consoleError));
}

export function mainSync(
    args: string[], consoleError: (s: string) => void = console.error): number {
  const parsedArgs = require('minimist')(args);
  const {rootNames, options, errors: configErrors} = readCommandLineAndConfiguration(parsedArgs);
  if (configErrors.length) {
    return reportErrorsAndExit(options, configErrors, consoleError);
  }
  const {diagnostics: compileDiags} =
      performCompilation({rootNames, options, emitCallback: createEmitCallback(options)});
  return reportErrorsAndExit(options, compileDiags, consoleError);
}

function createEmitCallback(options: api.CompilerOptions): api.TsEmitCallback {
  const tsickleOptions: tsickle.TransformerOptions = {
    googmodule: false,
    untyped: true,
    convertIndexImportShorthand: true,
    transformDecorators: options.annotationsAs !== 'decorators',
    transformTypesToClosure: options.annotateForClosureCompiler,
  };

  const tsickleHost: tsickle.TransformerHost = {
    shouldSkipTsickleProcessing: (fileName) => /\.d\.ts$/.test(fileName),
    pathToModuleName: (context, importPath) => '',
    shouldIgnoreWarningsForPath: (filePath) => false,
    fileNameToModuleId: (fileName) => fileName,
  };

  return ({
           program,
           targetSourceFile,
           writeFile,
           cancellationToken,
           emitOnlyDtsFiles,
           customTransformers = {},
           host,
           options
         }) =>
             tsickle.emitWithTsickle(
                 program, tsickleHost, tsickleOptions, host, options, targetSourceFile, writeFile,
                 cancellationToken, emitOnlyDtsFiles, {
                   beforeTs: customTransformers.before,
                   afterTs: customTransformers.after,
                 });
}

function readCommandLineAndConfiguration(args: any): ParsedConfiguration {
  const project = args.p || args.project || '.';
  const allDiagnostics: Diagnostics = [];
  const config = readConfiguration(project);
  const options = mergeCommandLineParams(args, config.options);
  return {rootNames: config.rootNames, options, errors: config.errors};
}

function reportErrorsAndExit(
    options: api.CompilerOptions, allDiagnostics: Diagnostics,
    consoleError: (s: string) => void = console.error): number {
  const exitCode = allDiagnostics.some(d => d.category === ts.DiagnosticCategory.Error) ? 1 : 0;
  if (allDiagnostics.length) {
    consoleError(formatDiagnostics(options, allDiagnostics));
  }
  return exitCode;
}

function mergeCommandLineParams(
    cliArgs: {[k: string]: string}, options: api.CompilerOptions): api.CompilerOptions {
  // TODO: also merge in tsc command line parameters by calling
  // ts.readCommandLine.
  if (cliArgs.i18nFile) options.i18nInFile = cliArgs.i18nFile;
  if (cliArgs.i18nFormat) options.i18nInFormat = cliArgs.i18nFormat;
  if (cliArgs.locale) options.i18nInLocale = cliArgs.locale;
  const mt = cliArgs.missingTranslation;
  if (mt === 'error' || mt === 'warning' || mt === 'ignore') {
    options.i18nInMissingTranslations = mt;
  }
  return options;
}

function disabledTransformerPipelineNgcMain(
    args: any, consoleError: (s: string) => void = console.error): Promise<number> {
  const cliOptions = new tsc.NgcCliOptions(args);
  const project = args.p || args.project || '.';
  return tsc.main(project, cliOptions, disabledTransformerPipelineCodegen)
      .then(() => 0)
      .catch(e => {
        if (e instanceof tsc.UserError || isSyntaxError(e)) {
          consoleError(e.message);
        } else {
          consoleError(e.stack);
        }
        return Promise.resolve(1);
      });
}

function disabledTransformerPipelineCodegen(
    ngOptions: tsc.AngularCompilerOptions, cliOptions: tsc.NgcCliOptions, program: ts.Program,
    host: ts.CompilerHost) {
  if (ngOptions.enableSummariesForJit === undefined) {
    // default to false
    ngOptions.enableSummariesForJit = false;
  }
  return CodeGenerator.create(ngOptions, cliOptions, program, host).codegen();
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  main(args).then((exitCode: number) => process.exitCode = exitCode);
}
