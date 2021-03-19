/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A phase of compilation for which time is tracked in a distinct bucket.
 */
export enum PerfPhase {
  /**
   * The "default" phase which tracks time not spent in any other phase.
   */
  Unaccounted,

  /**
   * Time spent setting up the compiler, before a TypeScript program is created.
   *
   * This includes operations like configuring the `ts.CompilerHost` and any wrappers.
   */
  Setup,

  /**
   * Time spent in `ts.createProgram`, including reading and parsing `ts.SourceFile`s in the
   * `ts.CompilerHost`.
   *
   * This might be an incremental program creation operation.
   */
  TypeScriptProgramCreate,

  /**
   * Time spent reconciling the contents of an old `ts.Program` with the new incremental one.
   *
   * Only present in incremental compilations.
   */
  Reconciliation,

  /**
   * Time spent updating an `NgCompiler` instance with a resource-only change.
   *
   * Only present in incremental compilations where the change was resource-only.
   */
  ResourceUpdate,

  /**
   * Time spent calculating the plain TypeScript diagnostics (structural and semantic).
   */
  TypeScriptDiagnostics,

  /**
   * Time spent in Angular analysis of individual classes in the program.
   */
  Analysis,

  /**
   * Time spent in Angular global analysis (synthesis of analysis information into a complete
   * understanding of the program).
   */
  Resolve,

  /**
   * Time spent building the import graph of the program in order to perform cycle detection.
   */
  CycleDetection,

  /**
   * Time spent generating the text of Type Check Blocks in order to perform template type checking.
   */
  TcbGeneration,

  /**
   * Time spent updating the `ts.Program` with new Type Check Block code.
   */
  TcbUpdateProgram,

  /**
   * Time spent by TypeScript performing its emit operations, including downleveling and writing
   * output files.
   */
  TypeScriptEmit,

  /**
   * Time spent by Angular performing code transformations of ASTs as they're about to be emitted.
   *
   * This includes the actual code generation step for templates, and occurs during the emit phase
   * (but is tracked separately from `TypeScriptEmit` time).
   */
  Compile,

  /**
   * Time spent performing a `TemplateTypeChecker` autocompletion operation.
   */
  TtcAutocompletion,

  /**
   * Time spent computing template type-checking diagnostics.
   */
  TtcDiagnostics,

  /**
   * Time spent getting a `Symbol` from the `TemplateTypeChecker`.
   */
  TtcSymbol,

  /**
   * Time spent by the Angular Language Service calculating a "get references" or a renaming
   * operation.
   */
  LsReferencesAndRenames,

  /**
   * Time spent by the Angular Language Service calculating a "quick info" operation.
   */
  LsQuickInfo,

  /**
   * Time spent by the Angular Language Service calculating a "get type definition" or "get
   * definition" operation.
   */
  LsDefinition,

  /**
   * Time spent by the Angular Language Service calculating a "get completions" (AKA autocomplete)
   * operation.
   */
  LsCompletions,

  /**
   * Time spent by the Angular Language Service calculating a "view template typecheck block"
   * operation.
   */
  LsTcb,

  /**
   * Time spent by the Angular Language Service calculating diagnostics.
   */
  LsDiagnostics,

  /**
   * Time spent by the Angular Language Service calculating a "get component locations for template"
   * operation.
   */
  LsComponentLocations,

  /**
   * Tracks the number of `PerfPhase`s, and must appear at the end of the list.
   */
  LAST,
}

/**
 * Represents some occurrence during compilation, and is tracked with a counter.
 */
export enum PerfEvent {
  /**
   * Counts the number of `.d.ts` files in the program.
   */
  InputDtsFile,

  /**
   * Counts the number of non-`.d.ts` files in the program.
   */
  InputTsFile,

  /**
   * An `@Component` class was analyzed.
   */
  AnalyzeComponent,

  /**
   * An `@Directive` class was analyzed.
   */
  AnalyzeDirective,

  /**
   * An `@Injectable` class was analyzed.
   */
  AnalyzeInjectable,

  /**
   * An `@NgModule` class was analyzed.
   */
  AnalyzeNgModule,

  /**
   * An `@Pipe` class was analyzed.
   */
  AnalyzePipe,

  /**
   * A trait was analyzed.
   *
   * In theory, this should be the sum of the `Analyze` counters for each decorator type.
   */
  TraitAnalyze,

  /**
   * A trait had a prior analysis available from an incremental program, and did not need to be
   * re-analyzed.
   */
  TraitReuseAnalysis,

  /**
   * A `ts.SourceFile` directly changed between the prior program and a new incremental compilation.
   */
  SourceFilePhysicalChange,

  /**
   * A `ts.SourceFile` did not physically changed, but according to the file dependency graph, has
   * logically changed between the prior program and a new incremental compilation.
   */
  SourceFileLogicalChange,

  /**
   * A `ts.SourceFile` has not logically changed and all of its analysis results were thus available
   * for reuse.
   */
  SourceFileReuseAnalysis,

  /**
   * A Type Check Block (TCB) was generated.
   */
  GenerateTcb,

  /**
   * A Type Check Block (TCB) could not be generated because inlining was disabled, and the block
   * would've required inlining.
   */
  SkipGenerateTcbNoInline,

  /**
   * A `.ngtypecheck.ts` file could be reused from the previous program and did not need to be
   * regenerated.
   */
  ReuseTypeCheckFile,

  /**
   * The template type-checking program required changes and had to be updated in an incremental
   * step.
   */
  UpdateTypeCheckProgram,

  /**
   * The compiler was able to prove that a `ts.SourceFile` did not need to be re-emitted.
   */
  EmitSkipSourceFile,

  /**
   * A `ts.SourceFile` was emitted.
   */
  EmitSourceFile,

  /**
   * Tracks the number of `PrefEvent`s, and must appear at the end of the list.
   */
  LAST,
}

/**
 * Represents a checkpoint during compilation at which the memory usage of the compiler should be
 * recorded.
 */
export enum PerfCheckpoint {
  /**
   * The point at which the `PerfRecorder` was created, and ideally tracks memory used before any
   * compilation structures are created.
   */
  Initial,

  /**
   * The point just after the `ts.Program` has been created.
   */
  TypeScriptProgramCreate,

  /**
   * The point just before Angular analysis starts.
   *
   * In the main usage pattern for the compiler, TypeScript diagnostics have been calculated at this
   * point, so the `ts.TypeChecker` has fully ingested the current program, all `ts.Type` structures
   * and `ts.Symbol`s have been created.
   */
  PreAnalysis,

  /**
   * The point just after Angular analysis completes.
   */
  Analysis,

  /**
   * The point just after Angular resolution is complete.
   */
  Resolve,

  /**
   * The point just after Type Check Blocks (TCBs) have been generated.
   */
  TtcGeneration,

  /**
   * The point just after the template type-checking program has been updated with any new TCBs.
   */
  TtcUpdateProgram,

  /**
   * The point just before emit begins.
   *
   * In the main usage pattern for the compiler, all template type-checking diagnostics have been
   * requested at this point.
   */
  PreEmit,

  /**
   * The point just after the program has been fully emitted.
   */
  Emit,

  /**
   * Tracks the number of `PerfCheckpoint`s, and must appear at the end of the list.
   */
  LAST,
}

/**
 * Records timing, memory, or counts at specific points in the compiler's operation.
 */
export interface PerfRecorder {
  /**
   * Set the current phase of compilation.
   *
   * Time spent in the previous phase will be accounted to that phase. The caller is responsible for
   * exiting the phase when work that should be tracked within it is completed, and either returning
   * to the previous phase or transitioning to the next one directly.
   *
   * In general, prefer using `inPhase()` to instrument a section of code, as it automatically
   * handles entering and exiting the phase. `phase()` should only be used when the former API
   * cannot be cleanly applied to a particular operation.
   *
   * @returns the previous phase
   */
  phase(phase: PerfPhase): PerfPhase;

  /**
   * Run `fn` in the given `PerfPhase` and return the result.
   *
   * Enters `phase` before executing the given `fn`, then exits the phase and returns the result.
   * Prefer this API to `phase()` where possible.
   */
  inPhase<T>(phase: PerfPhase, fn: () => T): T;

  /**
   * Record the memory usage of the compiler at the given checkpoint.
   */
  memory(after: PerfCheckpoint): void;

  /**
   * Record that a specific event has occurred, possibly more than once.
   */
  eventCount(event: PerfEvent, incrementBy?: number): void;

  /**
   * Return the `PerfRecorder` to an empty state (clear all tracked statistics) and reset the zero
   * point to the current time.
   */
  reset(): void;
}
