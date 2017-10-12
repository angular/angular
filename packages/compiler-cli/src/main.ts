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
import * as fs from 'fs';
import * as path from 'path';
import * as tsickle from 'tsickle';
import * as api from './transformers/api';
import * as ngc from './transformers/entry_points';
import {GENERATED_FILES} from './transformers/util';

import {exitCodeFromResult, performCompilation, readConfiguration, formatDiagnostics, Diagnostics, ParsedConfiguration, PerformCompilationResult, filterErrorsAndWarnings} from './perform_compile';
import {performWatchCompilation, createPerformWatchHost} from './perform_watch';
import {isSyntaxError} from '@angular/compiler';

export function main(
    args: string[], consoleError: (s: string) => void = console.error,
    config?: NgcParsedConfiguration): number {
  let {project, rootNames, options, errors: configErrors, watch, emitFlags} =
      config || readNgcCommandLineAndConfiguration(args);
  if (configErrors.length) {
    return reportErrorsAndExit(options, configErrors, consoleError);
  }
  if (watch) {
    const result = watchMode(project, options, consoleError);
    return reportErrorsAndExit({}, result.firstCompileResult, consoleError);
  }
  const {diagnostics: compileDiags} = performCompilation(
      {rootNames, options, emitFlags, emitCallback: createEmitCallback(options)});
  return reportErrorsAndExit(options, compileDiags, consoleError);
}

function createEmitCallback(options: api.CompilerOptions): api.TsEmitCallback|undefined {
  const transformDecorators = options.annotationsAs !== 'decorators';
  const transformTypesToClosure = options.annotateForClosureCompiler;
  if (!transformDecorators && !transformTypesToClosure) {
    return undefined;
  }
  const tsickleHost: tsickle.TsickleHost = {
    shouldSkipTsickleProcessing: (fileName) =>
                                     /\.d\.ts$/.test(fileName) || GENERATED_FILES.test(fileName),
    pathToModuleName: (context, importPath) => '',
    shouldIgnoreWarningsForPath: (filePath) => false,
    fileNameToModuleId: (fileName) => fileName,
    googmodule: false,
    untyped: true,
    convertIndexImportShorthand: false, transformDecorators, transformTypesToClosure,
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
                 program, tsickleHost, host, options, targetSourceFile, writeFile,
                 cancellationToken, emitOnlyDtsFiles, {
                   beforeTs: customTransformers.before,
                   afterTs: customTransformers.after,
                 });
}

export interface NgcParsedConfiguration extends ParsedConfiguration { watch?: boolean; }

function readNgcCommandLineAndConfiguration(args: string[]): NgcParsedConfiguration {
  const options: api.CompilerOptions = {};
  const parsedArgs = require('minimist')(args);
  if (parsedArgs.i18nFile) options.i18nInFile = parsedArgs.i18nFile;
  if (parsedArgs.i18nFormat) options.i18nInFormat = parsedArgs.i18nFormat;
  if (parsedArgs.locale) options.i18nInLocale = parsedArgs.locale;
  const mt = parsedArgs.missingTranslation;
  if (mt === 'error' || mt === 'warning' || mt === 'ignore') {
    options.i18nInMissingTranslations = mt;
  }
  const config = readCommandLineAndConfiguration(
      args, options, ['i18nFile', 'i18nFormat', 'locale', 'missingTranslation', 'watch']);
  const watch = parsedArgs.w || parsedArgs.watch;
  return {...config, watch};
}

export function readCommandLineAndConfiguration(
    args: string[], existingOptions: api.CompilerOptions = {},
    ngCmdLineOptions: string[] = []): ParsedConfiguration {
  let cmdConfig = ts.parseCommandLine(args);
  const project = cmdConfig.options.project || '.';
  const cmdErrors = cmdConfig.errors.filter(e => {
    if (typeof e.messageText === 'string') {
      const msg = e.messageText;
      return !ngCmdLineOptions.some(o => msg.indexOf(o) >= 0);
    }
    return true;
  });
  if (cmdErrors.length) {
    return {
      project,
      rootNames: [],
      options: cmdConfig.options,
      errors: cmdErrors,
      emitFlags: api.EmitFlags.Default
    };
  }
  const allDiagnostics: Diagnostics = [];
  const config = readConfiguration(project, cmdConfig.options);
  const options = {...config.options, ...existingOptions};
  if (options.locale) {
    options.i18nInLocale = options.locale;
  }
  return {
    project,
    rootNames: config.rootNames, options,
    errors: config.errors,
    emitFlags: config.emitFlags
  };
}

function reportErrorsAndExit(
    options: api.CompilerOptions, allDiagnostics: Diagnostics,
    consoleError: (s: string) => void = console.error): number {
  const errorsAndWarnings = filterErrorsAndWarnings(allDiagnostics);
  if (errorsAndWarnings.length) {
    consoleError(formatDiagnostics(options, errorsAndWarnings));
  }
  return exitCodeFromResult(allDiagnostics);
}

export function watchMode(
    project: string, options: api.CompilerOptions, consoleError: (s: string) => void) {
  return performWatchCompilation(createPerformWatchHost(project, diagnostics => {
    consoleError(formatDiagnostics(options, diagnostics));
  }, options, options => createEmitCallback(options)));
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  process.exitCode = main(args);
}
