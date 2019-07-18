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

import {exitCodeFromResult, performCompilation, readConfiguration, formatDiagnostics, Diagnostics, ParsedConfiguration, filterErrorsAndWarnings} from './perform_compile';
import {performWatchCompilation, createPerformWatchHost} from './perform_watch';
import {NodeJSFileSystem, setFileSystem} from './ngtsc/file_system';

export function main(
    args: string[], consoleError: (s: string) => void = console.error,
    config?: NgcParsedConfiguration, customTransformers?: api.CustomTransformers, programReuse?: {
      program: api.Program | undefined,
    },
    modifiedResourceFiles?: Set<string>| null): number {
  let {project, rootNames, options, errors: configErrors, watch, emitFlags} =
      config || readNgcCommandLineAndConfiguration(args);
  if (configErrors.length) {
    return reportErrorsAndExit(configErrors, /*options*/ undefined, consoleError);
  }
  if (watch) {
    const result = watchMode(project, options, consoleError);
    return reportErrorsAndExit(result.firstCompileResult, options, consoleError);
  }

  let oldProgram: api.Program|undefined;
  if (programReuse !== undefined) {
    oldProgram = programReuse.program;
  }

  const {diagnostics: compileDiags, program} = performCompilation({
    rootNames,
    options,
    emitFlags,
    oldProgram,
    emitCallback: createEmitCallback(options), customTransformers, modifiedResourceFiles
  });
  if (programReuse !== undefined) {
    programReuse.program = program;
  }
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
  const transformDecorators = !options.enableIvy && options.annotationsAs !== 'decorators';
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
            program, {...tsickleHost, options, host, moduleResolutionHost: host}, host, options,
            targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, {
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

export function readNgcCommandLineAndConfiguration(args: string[]): NgcParsedConfiguration {
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

function getFormatDiagnosticsHost(options?: api.CompilerOptions): ts.FormatDiagnosticsHost {
  const basePath = options ? options.basePath : undefined;
  return {
    getCurrentDirectory: () => basePath || ts.sys.getCurrentDirectory(),
    // We need to normalize the path separators here because by default, TypeScript
    // compiler hosts use posix canonical paths. In order to print consistent diagnostics,
    // we also normalize the paths.
    getCanonicalFileName: fileName => fileName.replace(/\\/g, '/'),
    getNewLine: () => {
      // Manually determine the proper new line string based on the passed compiler
      // options. There is no public TypeScript function that returns the corresponding
      // new line string. see: https://github.com/Microsoft/TypeScript/issues/29581
      if (options && options.newLine !== undefined) {
        return options.newLine === ts.NewLineKind.LineFeed ? '\n' : '\r\n';
      }
      return ts.sys.newLine;
    },
  };
}

function reportErrorsAndExit(
    allDiagnostics: Diagnostics, options?: api.CompilerOptions,
    consoleError: (s: string) => void = console.error): number {
  const errorsAndWarnings = filterErrorsAndWarnings(allDiagnostics);
  if (errorsAndWarnings.length) {
    const formatHost = getFormatDiagnosticsHost(options);
    if (options && options.enableIvy === true) {
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
    consoleError(formatDiagnostics(diagnostics, getFormatDiagnosticsHost(options)));
  }, options, options => createEmitCallback(options)));
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  // We are running the real compiler so run against the real file-system
  setFileSystem(new NodeJSFileSystem());
  process.exitCode = main(args);
}
