/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import yargs from 'yargs';

import {
  exitCodeFromResult,
  formatDiagnostics,
  ParsedConfiguration,
  performCompilation,
  readConfiguration,
} from './perform_compile';
import {createPerformWatchHost, performWatchCompilation} from './perform_watch';
import * as api from './transformers/api';

export function main(
  args: string[],
  consoleError: (s: string) => void = console.error,
  config?: NgcParsedConfiguration,
  customTransformers?: api.CustomTransformers,
  programReuse?: {
    program: api.Program | undefined;
  },
  modifiedResourceFiles?: Set<string> | null,
): number {
  let {
    project,
    rootNames,
    options,
    errors: configErrors,
    watch,
    emitFlags,
  } = config || readNgcCommandLineAndConfiguration(args);
  if (configErrors.length) {
    return reportErrorsAndExit(configErrors, /*options*/ undefined, consoleError);
  }
  if (watch) {
    const result = watchMode(project, options, consoleError);
    return reportErrorsAndExit(result.firstCompileResult, options, consoleError);
  }

  let oldProgram: api.Program | undefined;
  if (programReuse !== undefined) {
    oldProgram = programReuse.program;
  }

  const {diagnostics: compileDiags, program} = performCompilation({
    rootNames,
    options,
    emitFlags,
    oldProgram,
    customTransformers,
    modifiedResourceFiles,
  });
  if (programReuse !== undefined) {
    programReuse.program = program;
  }
  return reportErrorsAndExit(compileDiags, options, consoleError);
}

export function mainDiagnosticsForTest(
  args: string[],
  config?: NgcParsedConfiguration,
  programReuse?: {program: api.Program | undefined},
  modifiedResourceFiles?: Set<string> | null,
): {
  exitCode: number;
  diagnostics: ReadonlyArray<ts.Diagnostic>;
} {
  let {
    rootNames,
    options,
    errors: configErrors,
    emitFlags,
  } = config || readNgcCommandLineAndConfiguration(args);
  if (configErrors.length) {
    return {
      exitCode: exitCodeFromResult(configErrors),
      diagnostics: configErrors,
    };
  }

  let oldProgram: api.Program | undefined;
  if (programReuse !== undefined) {
    oldProgram = programReuse.program;
  }

  const {diagnostics: compileDiags, program} = performCompilation({
    rootNames,
    options,
    emitFlags,
    oldProgram,
    modifiedResourceFiles,
  });

  if (programReuse !== undefined) {
    programReuse.program = program;
  }

  return {
    exitCode: exitCodeFromResult(compileDiags),
    diagnostics: compileDiags,
  };
}

export interface NgcParsedConfiguration extends ParsedConfiguration {
  watch?: boolean;
}

export function readNgcCommandLineAndConfiguration(args: string[]): NgcParsedConfiguration {
  const options: api.CompilerOptions = {};
  const parsedArgs = yargs(args)
    .parserConfiguration({'strip-aliased': true})
    .option('i18nFile', {type: 'string'})
    .option('i18nFormat', {type: 'string'})
    .option('locale', {type: 'string'})
    .option('missingTranslation', {type: 'string', choices: ['error', 'warning', 'ignore']})
    .option('outFile', {type: 'string'})
    .option('watch', {type: 'boolean', alias: ['w']})
    .parseSync();

  if (parsedArgs.i18nFile) options.i18nInFile = parsedArgs.i18nFile;
  if (parsedArgs.i18nFormat) options.i18nInFormat = parsedArgs.i18nFormat;
  if (parsedArgs.locale) options.i18nInLocale = parsedArgs.locale;
  if (parsedArgs.missingTranslation)
    options.i18nInMissingTranslations =
      parsedArgs.missingTranslation as api.CompilerOptions['i18nInMissingTranslations'];

  const config = readCommandLineAndConfiguration(args, options, [
    'i18nFile',
    'i18nFormat',
    'locale',
    'missingTranslation',
    'watch',
  ]);
  return {...config, watch: parsedArgs.watch};
}

export function readCommandLineAndConfiguration(
  args: string[],
  existingOptions: api.CompilerOptions = {},
  ngCmdLineOptions: string[] = [],
): ParsedConfiguration {
  let cmdConfig = ts.parseCommandLine(args);
  const project = cmdConfig.options.project || '.';
  const cmdErrors = cmdConfig.errors.filter((e) => {
    if (typeof e.messageText === 'string') {
      const msg = e.messageText;
      return !ngCmdLineOptions.some((o) => msg.indexOf(o) >= 0);
    }
    return true;
  });
  if (cmdErrors.length) {
    return {
      project,
      rootNames: [],
      options: cmdConfig.options,
      errors: cmdErrors,
      emitFlags: api.EmitFlags.Default,
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
    emitFlags: config.emitFlags,
  };
}

function getFormatDiagnosticsHost(options?: api.CompilerOptions): ts.FormatDiagnosticsHost {
  const basePath = options ? options.basePath : undefined;
  return {
    getCurrentDirectory: () => basePath || ts.sys.getCurrentDirectory(),
    // We need to normalize the path separators here because by default, TypeScript
    // compiler hosts use posix canonical paths. In order to print consistent diagnostics,
    // we also normalize the paths.
    getCanonicalFileName: (fileName) => fileName.replace(/\\/g, '/'),
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
  allDiagnostics: ReadonlyArray<ts.Diagnostic>,
  options?: api.CompilerOptions,
  consoleError: (s: string) => void = console.error,
): number {
  const errorsAndWarnings = allDiagnostics.filter(
    (d) => d.category !== ts.DiagnosticCategory.Message,
  );
  printDiagnostics(errorsAndWarnings, options, consoleError);
  return exitCodeFromResult(allDiagnostics);
}

export function watchMode(
  project: string,
  options: api.CompilerOptions,
  consoleError: (s: string) => void,
) {
  return performWatchCompilation(
    createPerformWatchHost(
      project,
      (diagnostics) => {
        printDiagnostics(diagnostics, options, consoleError);
      },
      options,
      undefined,
    ),
  );
}

function printDiagnostics(
  diagnostics: ReadonlyArray<ts.Diagnostic>,
  options: api.CompilerOptions | undefined,
  consoleError: (s: string) => void,
): void {
  if (diagnostics.length === 0) {
    return;
  }
  const formatHost = getFormatDiagnosticsHost(options);
  consoleError(formatDiagnostics(diagnostics, formatHost));
}
