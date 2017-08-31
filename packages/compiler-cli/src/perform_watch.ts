/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as chokidar from 'chokidar';
import * as path from 'path';
import * as ts from 'typescript';

import {Diagnostics, ParsedConfiguration, PerformCompilationResult, exitCodeFromResult, performCompilation, readConfiguration} from './perform_compile';
import * as api from './transformers/api';
import {createCompilerHost} from './transformers/entry_points';

const ChangeDiagnostics = {
  Compilation_complete_Watching_for_file_changes: {
    category: ts.DiagnosticCategory.Message,
    messageText: 'Compilation complete. Watching for file changes.',
    code: api.DEFAULT_ERROR_CODE,
    source: api.SOURCE
  },
  Compilation_failed_Watching_for_file_changes: {
    category: ts.DiagnosticCategory.Message,
    messageText: 'Compilation failed. Watching for file changes.',
    code: api.DEFAULT_ERROR_CODE,
    source: api.SOURCE
  },
  File_change_detected_Starting_incremental_compilation: {
    category: ts.DiagnosticCategory.Message,
    messageText: 'File change detected. Starting incremental compilation.',
    code: api.DEFAULT_ERROR_CODE,
    source: api.SOURCE
  },
};

export enum FileChangeEvent {
  Change,
  CreateDelete
}

export interface PerformWatchHost {
  reportDiagnostics(diagnostics: Diagnostics): void;
  readConfiguration(): ParsedConfiguration;
  createCompilerHost(options: api.CompilerOptions): api.CompilerHost;
  createEmitCallback(options: api.CompilerOptions): api.TsEmitCallback|undefined;
  onFileChange(listener: (event: FileChangeEvent, fileName: string) => void):
      {close: () => void, ready: (cb: () => void) => void};
  setTimeout(callback: () => void, ms: number): any;
  clearTimeout(timeoutId: any): void;
}

export function createPerformWatchHost(
    configFileName: string, reportDiagnostics: (diagnostics: Diagnostics) => void,
    createEmitCallback?: (options: api.CompilerOptions) => api.TsEmitCallback): PerformWatchHost {
  return {
    reportDiagnostics: reportDiagnostics,
    createCompilerHost: options => createCompilerHost({options}),
    readConfiguration: () => readConfiguration(configFileName),
    createEmitCallback: options => createEmitCallback ? createEmitCallback(options) : undefined,
    onFileChange: (listeners) => {
      const parsed = readConfiguration(configFileName);
      function stubReady(cb: () => void) { process.nextTick(cb); }
      if (parsed.errors && parsed.errors.length) {
        reportDiagnostics(parsed.errors);
        return {close: () => {}, ready: stubReady};
      }
      if (!parsed.options.basePath) {
        reportDiagnostics([{
          category: ts.DiagnosticCategory.Error,
          messageText: 'Invalid configuration option. baseDir not specified',
          source: api.SOURCE,
          code: api.DEFAULT_ERROR_CODE
        }]);
        return {close: () => {}, ready: stubReady};
      }
      const watcher = chokidar.watch(parsed.options.basePath, {
        // ignore .dotfiles, .js and .map files.
        // can't ignore other files as we e.g. want to recompile if an `.html` file changes as well.
        ignored: /((^[\/\\])\..)|(\.js$)|(\.map$)|(\.metadata\.json)/,
        ignoreInitial: true,
        persistent: true,
      });
      watcher.on('all', (event: string, path: string) => {
        switch (event) {
          case 'change':
            listeners(FileChangeEvent.Change, path);
            break;
          case 'unlink':
          case 'add':
            listeners(FileChangeEvent.CreateDelete, path);
            break;
        }
      });
      function ready(cb: () => void) { watcher.on('ready', cb); }
      return {close: () => watcher.close(), ready};
    },
    setTimeout: (ts.sys.clearTimeout && ts.sys.setTimeout) || setTimeout,
    clearTimeout: (ts.sys.setTimeout && ts.sys.clearTimeout) || clearTimeout,
  };
}

/**
 * The logic in this function is adapted from `tsc.ts` from TypeScript.
 */
export function performWatchCompilation(host: PerformWatchHost): {
  close: () => void,
  ready: (cb: () => void) => void,
  firstCompileResult: PerformCompilationResult | undefined
} {
  let cachedProgram: api.Program|undefined;            // Program cached from last compilation
  let cachedCompilerHost: api.CompilerHost|undefined;  // CompilerHost cached from last compilation
  let cachedOptions: ParsedConfiguration|undefined;  // CompilerOptions cached from last compilation
  let timerHandleForRecompilation: any;  // Handle for 0.25s wait timer to trigger recompilation

  // Watch basePath, ignoring .dotfiles
  const fileWatcher = host.onFileChange(watchedFileChanged);
  const ingoreFilesForWatch = new Set<string>();

  const firstCompileResult = doCompilation();

  const readyPromise = new Promise(resolve => fileWatcher.ready(resolve));

  return {close, ready: cb => readyPromise.then(cb), firstCompileResult};

  function close() {
    fileWatcher.close();
    if (timerHandleForRecompilation) {
      host.clearTimeout(timerHandleForRecompilation);
      timerHandleForRecompilation = undefined;
    }
  }

  // Invoked to perform initial compilation or re-compilation in watch mode
  function doCompilation() {
    if (!cachedOptions) {
      cachedOptions = host.readConfiguration();
    }
    if (cachedOptions.errors && cachedOptions.errors.length) {
      host.reportDiagnostics(cachedOptions.errors);
      return;
    }
    if (!cachedCompilerHost) {
      // TODO(chuckj): consider avoiding re-generating factories for libraries.
      // Consider modifying the AotCompilerHost to be able to remember the summary files
      // generated from previous compiliations and return false from isSourceFile for
      // .d.ts files for which a summary file was already generated.å
      cachedCompilerHost = host.createCompilerHost(cachedOptions.options);
      const originalWriteFileCallback = cachedCompilerHost.writeFile;
      cachedCompilerHost.writeFile = function(
          fileName: string, data: string, writeByteOrderMark: boolean,
          onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) {
        ingoreFilesForWatch.add(path.normalize(fileName));
        return originalWriteFileCallback(fileName, data, writeByteOrderMark, onError, sourceFiles);
      };
    }
    ingoreFilesForWatch.clear();
    const compileResult = performCompilation({
      rootNames: cachedOptions.rootNames,
      options: cachedOptions.options,
      host: cachedCompilerHost,
      oldProgram: cachedProgram,
      emitCallback: host.createEmitCallback(cachedOptions.options)
    });

    if (compileResult.diagnostics.length) {
      host.reportDiagnostics(compileResult.diagnostics);
    }

    const exitCode = exitCodeFromResult(compileResult);
    if (exitCode == 0) {
      cachedProgram = compileResult.program;
      host.reportDiagnostics([ChangeDiagnostics.Compilation_complete_Watching_for_file_changes]);
    } else {
      host.reportDiagnostics([ChangeDiagnostics.Compilation_failed_Watching_for_file_changes]);
    }

    return compileResult;
  }

  function resetOptions() {
    cachedProgram = undefined;
    cachedCompilerHost = undefined;
    cachedOptions = undefined;
  }

  function watchedFileChanged(event: FileChangeEvent, fileName: string) {
    if (cachedOptions && event === FileChangeEvent.Change &&
        // TODO(chuckj): validate that this is sufficient to skip files that were written.
        // This assumes that the file path we write is the same file path we will receive in the
        // change notification.
        path.normalize(fileName) === path.normalize(cachedOptions.project)) {
      // If the configuration file changes, forget everything and start the recompilation timer
      resetOptions();
    } else if (event === FileChangeEvent.CreateDelete) {
      // If a file was added or removed, reread the configuration
      // to determine the new list of root files.
      cachedOptions = undefined;
    }
    if (!ingoreFilesForWatch.has(path.normalize(fileName))) {
      // Ignore the file if the file is one that was written by the compiler.
      startTimerForRecompilation();
    }
  }

  // Upon detecting a file change, wait for 250ms and then perform a recompilation. This gives batch
  // operations (such as saving all modified files in an editor) a chance to complete before we kick
  // off a new compilation.
  function startTimerForRecompilation() {
    if (timerHandleForRecompilation) {
      host.clearTimeout(timerHandleForRecompilation);
    }
    timerHandleForRecompilation = host.setTimeout(recompile, 250);
  }

  function recompile() {
    timerHandleForRecompilation = undefined;
    host.reportDiagnostics(
        [ChangeDiagnostics.File_change_detected_Starting_incremental_compilation]);
    doCompilation();
  }
}