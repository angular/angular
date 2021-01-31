#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
      program: api.Program|undefined,
    },
    modifiedResourceFiles?: Set<string>|null): number {
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
    emitCallback: createEmitCallback(options),
    customTransformers,
    modifiedResourceFiles
  });
  if (programReuse !== undefined) {
    programReuse.program = program;
  }
  return reportErrorsAndExit(compileDiags, options, consoleError);
}

export function mainDiagnosticsForTest(
    args: string[], config?: NgcParsedConfiguration,
    programReuse?: {program: api.Program|undefined},
    modifiedResourceFiles?: Set<string>|null): ReadonlyArray<ts.Diagnostic|api.Diagnostic> {
  let {project, rootNames, options, errors: configErrors, watch, emitFlags} =
      config || readNgcCommandLineAndConfiguration(args);
  if (configErrors.length) {
    return configErrors;
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
    modifiedResourceFiles,
    emitCallback: createEmitCallback(options),
  });

  if (programReuse !== undefined) {
    programReuse.program = program;
  }

  return compileDiags;
}

function createEmitCallback(options: api.CompilerOptions): api.TsEmitCallback|undefined {
  if (!options.annotateForClosureCompiler) {
    return undefined;
  }
  const tsickleHost: Pick<
      tsickle.TsickleHost,
      'shouldSkipTsickleProcessing'|'pathToModuleName'|'shouldIgnoreWarningsForPath'|
      'fileNameToModuleId'|'googmodule'|'untyped'|'convertIndexImportShorthand'|
      'transformDecorators'|'transformTypesToClosure'> = {
    shouldSkipTsickleProcessing: (fileName) => /\.d\.ts$/.test(fileName) ||
        // View Engine's generated files were never intended to be processed with tsickle.
        (!options.enableIvy && GENERATED_FILES.test(fileName)),
    pathToModuleName: (context, importPath) => '',
    shouldIgnoreWarningsForPath: (filePath) => false,
    fileNameToModuleId: (fileName) => fileName,
    googmodule: false,
    untyped: true,
    convertIndexImportShorthand: false,
    // Decorators are transformed as part of the Angular compiler programs. To avoid
    // conflicts, we disable decorator transformations for tsickle.
    transformDecorators: false,
    transformTypesToClosure: true,
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
             // tslint:disable-next-line:no-require-imports only depend on tsickle if requested
      require('tsickle').emitWithTsickle(
          program, {...tsickleHost, options, host, moduleResolutionHost: host}, host, options,
          targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, {
            beforeTs: customTransformers.before,
            afterTs: customTransformers.after,
          });
}

export interface NgcParsedConfiguration extends ParsedConfiguration {
  watch?: boolean;
}

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
  const config = readConfiguration(project, cmdConfig.options);
  const options = {...config.options, ...existingOptions};
  if (options.locale) {
    options.i18nInLocale = options.locale;
  }
  return {
    project,
    rootNames: config.rootNames,
    options,
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
  printDiagnostics(errorsAndWarnings, options, consoleError);
  return exitCodeFromResult(allDiagnostics);
}

export function watchMode(
    project: string, options: api.CompilerOptions, consoleError: (s: string) => void) {
  return performWatchCompilation(createPerformWatchHost(project, diagnostics => {
    printDiagnostics(diagnostics, options, consoleError);
  }, options, options => createEmitCallback(options)));
}

function printDiagnostics(
    diagnostics: ReadonlyArray<ts.Diagnostic|api.Diagnostic>,
    options: api.CompilerOptions|undefined, consoleError: (s: string) => void): void {
  if (diagnostics.length === 0) {
    return;
  }
  const formatHost = getFormatDiagnosticsHost(options);
  consoleError(formatDiagnostics(diagnostics, formatHost));
}

// CLI entry point
if (require.main === module) {
  process.title = 'Angular Compiler (ngc)';
  const args = process.argv.slice(2);
  // We are running the real compiler so run against the real file-system
  setFileSystem(new NodeJSFileSystem());
  process.exitCode = main(args);
}
