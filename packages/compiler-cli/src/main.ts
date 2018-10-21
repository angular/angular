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
import * as tsickle from 'tsickle';

import {replaceTsWithNgInErrors} from './ngtsc/diagnostics';
import * as api from './transformers/api';
import {GENERATED_FILES} from './transformers/util';

import {exitCodeFromResult, performCompilation, readConfiguration, formatDiagnostics, Diagnostics, ParsedConfiguration, PerformCompilationResult, filterErrorsAndWarnings} from './perform_compile';
import {performWatchCompilation, createPerformWatchHost} from './perform_watch';

export function main(
    args: string[], consoleError: (s: string) => void = console.error,
    config?: NgcParsedConfiguration): number {
  let {project, rootNames, options, errors: configErrors, watch, emitFlags} =
      config || readNgcCommandLineAndConfiguration(args);
  if (configErrors.length) {
    return reportErrorsAndExit(configErrors, /*options*/ undefined, consoleError);
  }
  if (watch) {
    const result = watchMode(project, options, consoleError);
    return reportErrorsAndExit(result.firstCompileResult, options, consoleError);
  }
  const {diagnostics: compileDiags} = performCompilation(
      {rootNames, options, emitFlags, emitCallback: createEmitCallback(options)});
  return reportErrorsAndExit(compileDiags, options, consoleError);
}

export function mainDiagnosticsForTest(
    args: string[], config?: NgcParsedConfiguration): ReadonlyArray<ts.Diagnostic|api.Diagnostic> {
  let {project, rootNames, options, errors: configErrors, watch, emitFlags} =
      config || readNgcCommandLineAndConfiguration(args);
  if (configErrors.length) {
    return configErrors;
  }
  const {diagnostics: compileDiags} = performCompilation(
      {rootNames, options, emitFlags, emitCallback: createEmitCallback(options)});
  return compileDiags;
}

function createEmitCallback(options: api.CompilerOptions): api.TsEmitCallback|undefined {
  const transformDecorators = options.enableIvy !== 'ngtsc' && options.enableIvy !== 'tsc' &&
      options.annotationsAs !== 'decorators';
  const transformTypesToClosure = options.annotateForClosureCompiler;
  if (!transformDecorators && !transformTypesToClosure) {
    return undefined;
  }
  if (transformDecorators) {
    // This is needed as a workaround for https://github.com/angular/tsickle/issues/635
    // Otherwise tsickle might emit references to non imported values
    // as TypeScript elided the import.
    options.emitDecoratorMetadata = true;
  }
  const tsickleHost: Pick<
      tsickle.TsickleHost, 'shouldSkipTsickleProcessing'|'pathToModuleName'|
      'shouldIgnoreWarningsForPath'|'fileNameToModuleId'|'googmodule'|'untyped'|
      'convertIndexImportShorthand'|'transformDecorators'|'transformTypesToClosure'> = {
    shouldSkipTsickleProcessing: (fileName) =>
                                     /\.d\.ts$/.test(fileName) || GENERATED_FILES.test(fileName),
    pathToModuleName: (context, importPath) => '',
    shouldIgnoreWarningsForPath: (filePath) => false,
    fileNameToModuleId: (fileName) => fileName,
    googmodule: false,
    untyped: true,
    convertIndexImportShorthand: false, transformDecorators, transformTypesToClosure,
  };

  if (options.annotateForClosureCompiler || options.annotationsAs === 'static fields') {
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
               // tslint:disable-next-line:no-require-imports only depend on tsickle if requested
        require('tsickle').emitWithTsickle(
            program, {...tsickleHost, options, host}, host, options, targetSourceFile, writeFile,
            cancellationToken, emitOnlyDtsFiles, {
              beforeTs: customTransformers.before,
              afterTs: customTransformers.after,
            });
  } else {
    return ({
             program,
             targetSourceFile,
             writeFile,
             cancellationToken,
             emitOnlyDtsFiles,
             customTransformers = {},
           }) =>
               program.emit(
                   targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles,
                   {after: customTransformers.after, before: customTransformers.before});
  }
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
    allDiagnostics: Diagnostics, options?: api.CompilerOptions,
    consoleError: (s: string) => void = console.error): number {
  const errorsAndWarnings = filterErrorsAndWarnings(allDiagnostics);
  if (errorsAndWarnings.length) {
    let currentDir = options ? options.basePath : undefined;
    const formatHost: ts.FormatDiagnosticsHost = {
      getCurrentDirectory: () => currentDir || ts.sys.getCurrentDirectory(),
      getCanonicalFileName: fileName => fileName,
      getNewLine: () => ts.sys.newLine
    };
    if (options && (options.enableIvy === true || options.enableIvy === 'ngtsc')) {
      const ngDiagnostics = errorsAndWarnings.filter(api.isNgDiagnostic);
      const tsDiagnostics = errorsAndWarnings.filter(api.isTsDiagnostic);
      consoleError(replaceTsWithNgInErrors(
          ts.formatDiagnosticsWithColorAndContext(tsDiagnostics, formatHost)));
      consoleError(formatDiagnostics(ngDiagnostics, formatHost));
    } else {
      consoleError(formatDiagnostics(errorsAndWarnings, formatHost));
    }
  }
  return exitCodeFromResult(allDiagnostics);
}

export function watchMode(
    project: string, options: api.CompilerOptions, consoleError: (s: string) => void) {
  return performWatchCompilation(createPerformWatchHost(project, diagnostics => {
    consoleError(formatDiagnostics(diagnostics));
  }, options, options => createEmitCallback(options)));
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  process.exitCode = main(args);
}
