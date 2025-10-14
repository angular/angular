/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  freshCompilationTicket,
  incrementalFromStateTicket,
  NgCompiler,
  NgCompilerHost,
} from './core';
import {NodeJSFileSystem, resolve, setFileSystem} from './file_system';
import {PatchedProgramIncrementalBuildStrategy} from './incremental';
import {ActivePerfRecorder, PerfPhase} from './perf';
import {TsCreateProgramDriver} from './program_driver';
import {OptimizeFor} from './typecheck/api';
/**
 * A plugin for `tsc_wrapped` which allows Angular compilation from a plain `ts_library`.
 */
export class NgTscPlugin {
  ngOptions;
  name = 'ngtsc';
  options = null;
  host = null;
  _compiler = null;
  get compiler() {
    if (this._compiler === null) {
      throw new Error('Lifecycle error: setupCompilation() must be called first.');
    }
    return this._compiler;
  }
  constructor(ngOptions) {
    this.ngOptions = ngOptions;
    setFileSystem(new NodeJSFileSystem());
  }
  wrapHost(host, inputFiles, options) {
    // TODO(alxhub): Eventually the `wrapHost()` API will accept the old `ts.Program` (if one is
    // available). When it does, its `ts.SourceFile`s need to be re-tagged to enable proper
    // incremental compilation.
    this.options = {...this.ngOptions, ...options};
    this.host = NgCompilerHost.wrap(host, inputFiles, this.options, /* oldProgram */ null);
    return this.host;
  }
  setupCompilation(program, oldProgram) {
    // TODO(alxhub): we provide a `PerfRecorder` to the compiler, but because we're not driving the
    // compilation, the information captured within it is incomplete, and may not include timings
    // for phases such as emit.
    //
    // Additionally, nothing actually captures the perf results here, so recording stats at all is
    // somewhat moot for now :)
    const perfRecorder = ActivePerfRecorder.zeroedToNow();
    if (this.host === null || this.options === null) {
      throw new Error('Lifecycle error: setupCompilation() before wrapHost().');
    }
    this.host.postProgramCreationCleanup();
    const programDriver = new TsCreateProgramDriver(
      program,
      this.host,
      this.options,
      this.host.shimExtensionPrefixes,
    );
    const strategy = new PatchedProgramIncrementalBuildStrategy();
    const oldState = oldProgram !== undefined ? strategy.getIncrementalState(oldProgram) : null;
    let ticket;
    const modifiedResourceFiles = new Set();
    if (this.host.getModifiedResourceFiles !== undefined) {
      for (const resourceFile of this.host.getModifiedResourceFiles() ?? []) {
        modifiedResourceFiles.add(resolve(resourceFile));
      }
    }
    if (oldProgram === undefined || oldState === null) {
      ticket = freshCompilationTicket(
        program,
        this.options,
        strategy,
        programDriver,
        perfRecorder,
        /* enableTemplateTypeChecker */ false,
        /* usePoisonedData */ false,
      );
    } else {
      strategy.toNextBuildStrategy().getIncrementalState(oldProgram);
      ticket = incrementalFromStateTicket(
        oldProgram,
        oldState,
        program,
        this.options,
        strategy,
        programDriver,
        modifiedResourceFiles,
        perfRecorder,
        false,
        false,
      );
    }
    this._compiler = NgCompiler.fromTicket(ticket, this.host);
    return {
      ignoreForDiagnostics: this._compiler.ignoreForDiagnostics,
      ignoreForEmit: this._compiler.ignoreForEmit,
    };
  }
  getDiagnostics(file) {
    if (file === undefined) {
      return this.compiler.getDiagnostics();
    }
    return this.compiler.getDiagnosticsForFile(file, OptimizeFor.WholeProgram);
  }
  getOptionDiagnostics() {
    return this.compiler.getOptionDiagnostics();
  }
  getNextProgram() {
    return this.compiler.getCurrentProgram();
  }
  createTransformers() {
    // The plugin consumer doesn't know about our perf tracing system, so we consider the emit phase
    // as beginning now.
    this.compiler.perfRecorder.phase(PerfPhase.TypeScriptEmit);
    return this.compiler.prepareEmit().transformers;
  }
}
//# sourceMappingURL=tsc_plugin.js.map
