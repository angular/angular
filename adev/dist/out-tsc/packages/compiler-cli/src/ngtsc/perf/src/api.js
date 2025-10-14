/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * A phase of compilation for which time is tracked in a distinct bucket.
 */
export var PerfPhase;
(function (PerfPhase) {
  /**
   * The "default" phase which tracks time not spent in any other phase.
   */
  PerfPhase[(PerfPhase['Unaccounted'] = 0)] = 'Unaccounted';
  /**
   * Time spent setting up the compiler, before a TypeScript program is created.
   *
   * This includes operations like configuring the `ts.CompilerHost` and any wrappers.
   */
  PerfPhase[(PerfPhase['Setup'] = 1)] = 'Setup';
  /**
   * Time spent in `ts.createProgram`, including reading and parsing `ts.SourceFile`s in the
   * `ts.CompilerHost`.
   *
   * This might be an incremental program creation operation.
   */
  PerfPhase[(PerfPhase['TypeScriptProgramCreate'] = 2)] = 'TypeScriptProgramCreate';
  /**
   * Time spent reconciling the contents of an old `ts.Program` with the new incremental one.
   *
   * Only present in incremental compilations.
   */
  PerfPhase[(PerfPhase['Reconciliation'] = 3)] = 'Reconciliation';
  /**
   * Time spent updating an `NgCompiler` instance with a resource-only change.
   *
   * Only present in incremental compilations where the change was resource-only.
   */
  PerfPhase[(PerfPhase['ResourceUpdate'] = 4)] = 'ResourceUpdate';
  /**
   * Time spent calculating the plain TypeScript diagnostics (structural and semantic).
   */
  PerfPhase[(PerfPhase['TypeScriptDiagnostics'] = 5)] = 'TypeScriptDiagnostics';
  /**
   * Time spent in Angular analysis of individual classes in the program.
   */
  PerfPhase[(PerfPhase['Analysis'] = 6)] = 'Analysis';
  /**
   * Time spent in Angular global analysis (synthesis of analysis information into a complete
   * understanding of the program).
   */
  PerfPhase[(PerfPhase['Resolve'] = 7)] = 'Resolve';
  /**
   * Time spent building the import graph of the program in order to perform cycle detection.
   */
  PerfPhase[(PerfPhase['CycleDetection'] = 8)] = 'CycleDetection';
  /**
   * Time spent generating the text of Type Check Blocks in order to perform template type checking.
   */
  PerfPhase[(PerfPhase['TcbGeneration'] = 9)] = 'TcbGeneration';
  /**
   * Time spent updating the `ts.Program` with new Type Check Block code.
   */
  PerfPhase[(PerfPhase['TcbUpdateProgram'] = 10)] = 'TcbUpdateProgram';
  /**
   * Time spent by TypeScript performing its emit operations, including downleveling and writing
   * output files.
   */
  PerfPhase[(PerfPhase['TypeScriptEmit'] = 11)] = 'TypeScriptEmit';
  /**
   * Time spent by Angular performing code transformations of ASTs as they're about to be emitted.
   *
   * This includes the actual code generation step for templates, and occurs during the emit phase
   * (but is tracked separately from `TypeScriptEmit` time).
   */
  PerfPhase[(PerfPhase['Compile'] = 12)] = 'Compile';
  /**
   * Time spent performing a `TemplateTypeChecker` autocompletion operation.
   */
  PerfPhase[(PerfPhase['TtcAutocompletion'] = 13)] = 'TtcAutocompletion';
  /**
   * Time spent computing template type-checking diagnostics.
   */
  PerfPhase[(PerfPhase['TtcDiagnostics'] = 14)] = 'TtcDiagnostics';
  /**
   * Time spent computing template type-checking suggestion diagnostics.
   */
  PerfPhase[(PerfPhase['TtcSuggestionDiagnostics'] = 15)] = 'TtcSuggestionDiagnostics';
  /**
   * Time spent getting a `Symbol` from the `TemplateTypeChecker`.
   */
  PerfPhase[(PerfPhase['TtcSymbol'] = 16)] = 'TtcSymbol';
  /**
   * Time spent by the Angular Language Service calculating a "get references" or a renaming
   * operation.
   */
  PerfPhase[(PerfPhase['LsReferencesAndRenames'] = 17)] = 'LsReferencesAndRenames';
  /**
   * Time spent by the Angular Language Service calculating a "quick info" operation.
   */
  PerfPhase[(PerfPhase['LsQuickInfo'] = 18)] = 'LsQuickInfo';
  /**
   * Time spent by the Angular Language Service calculating a "get type definition" or "get
   * definition" operation.
   */
  PerfPhase[(PerfPhase['LsDefinition'] = 19)] = 'LsDefinition';
  /**
   * Time spent by the Angular Language Service calculating a "get completions" (AKA autocomplete)
   * operation.
   */
  PerfPhase[(PerfPhase['LsCompletions'] = 20)] = 'LsCompletions';
  /**
   * Time spent by the Angular Language Service calculating a "view template typecheck block"
   * operation.
   */
  PerfPhase[(PerfPhase['LsTcb'] = 21)] = 'LsTcb';
  /**
   * Time spent by the Angular Language Service calculating diagnostics.
   */
  PerfPhase[(PerfPhase['LsDiagnostics'] = 22)] = 'LsDiagnostics';
  /**
   * Time spent by the Angular Language Service calculating suggestion diagnostics.
   */
  PerfPhase[(PerfPhase['LsSuggestionDiagnostics'] = 23)] = 'LsSuggestionDiagnostics';
  /**
   * Time spent by the Angular Language Service calculating a "get component locations for template"
   * operation.
   */
  PerfPhase[(PerfPhase['LsComponentLocations'] = 24)] = 'LsComponentLocations';
  /**
   * Time spent by the Angular Language Service calculating signature help.
   */
  PerfPhase[(PerfPhase['LsSignatureHelp'] = 25)] = 'LsSignatureHelp';
  /**
   * Time spent by the Angular Language Service calculating outlining spans.
   */
  PerfPhase[(PerfPhase['OutliningSpans'] = 26)] = 'OutliningSpans';
  /**
   * Time spent by the Angular Language Service calculating code fixes.
   */
  PerfPhase[(PerfPhase['LsCodeFixes'] = 27)] = 'LsCodeFixes';
  /**
   * Time spent by the Angular Language Service to fix all detected same type errors.
   */
  PerfPhase[(PerfPhase['LsCodeFixesAll'] = 28)] = 'LsCodeFixesAll';
  /**
   * Time spent computing possible Angular refactorings.
   */
  PerfPhase[(PerfPhase['LSComputeApplicableRefactorings'] = 29)] =
    'LSComputeApplicableRefactorings';
  /**
   * Time spent computing changes for applying a given refactoring.
   */
  PerfPhase[(PerfPhase['LSApplyRefactoring'] = 30)] = 'LSApplyRefactoring';
  /**
   * Time spent by the Angular Language Service calculating semantic classifications.
   */
  PerfPhase[(PerfPhase['LSSemanticClassification'] = 31)] = 'LSSemanticClassification';
  /**
   * Tracks the number of `PerfPhase`s, and must appear at the end of the list.
   */
  PerfPhase[(PerfPhase['LAST'] = 32)] = 'LAST';
})(PerfPhase || (PerfPhase = {}));
/**
 * Represents some occurrence during compilation, and is tracked with a counter.
 */
export var PerfEvent;
(function (PerfEvent) {
  /**
   * Counts the number of `.d.ts` files in the program.
   */
  PerfEvent[(PerfEvent['InputDtsFile'] = 0)] = 'InputDtsFile';
  /**
   * Counts the number of non-`.d.ts` files in the program.
   */
  PerfEvent[(PerfEvent['InputTsFile'] = 1)] = 'InputTsFile';
  /**
   * An `@Component` class was analyzed.
   */
  PerfEvent[(PerfEvent['AnalyzeComponent'] = 2)] = 'AnalyzeComponent';
  /**
   * An `@Directive` class was analyzed.
   */
  PerfEvent[(PerfEvent['AnalyzeDirective'] = 3)] = 'AnalyzeDirective';
  /**
   * An `@Injectable` class was analyzed.
   */
  PerfEvent[(PerfEvent['AnalyzeInjectable'] = 4)] = 'AnalyzeInjectable';
  /**
   * An `@NgModule` class was analyzed.
   */
  PerfEvent[(PerfEvent['AnalyzeNgModule'] = 5)] = 'AnalyzeNgModule';
  /**
   * An `@Pipe` class was analyzed.
   */
  PerfEvent[(PerfEvent['AnalyzePipe'] = 6)] = 'AnalyzePipe';
  /**
   * A trait was analyzed.
   *
   * In theory, this should be the sum of the `Analyze` counters for each decorator type.
   */
  PerfEvent[(PerfEvent['TraitAnalyze'] = 7)] = 'TraitAnalyze';
  /**
   * A trait had a prior analysis available from an incremental program, and did not need to be
   * re-analyzed.
   */
  PerfEvent[(PerfEvent['TraitReuseAnalysis'] = 8)] = 'TraitReuseAnalysis';
  /**
   * A `ts.SourceFile` directly changed between the prior program and a new incremental compilation.
   */
  PerfEvent[(PerfEvent['SourceFilePhysicalChange'] = 9)] = 'SourceFilePhysicalChange';
  /**
   * A `ts.SourceFile` did not physically changed, but according to the file dependency graph, has
   * logically changed between the prior program and a new incremental compilation.
   */
  PerfEvent[(PerfEvent['SourceFileLogicalChange'] = 10)] = 'SourceFileLogicalChange';
  /**
   * A `ts.SourceFile` has not logically changed and all of its analysis results were thus available
   * for reuse.
   */
  PerfEvent[(PerfEvent['SourceFileReuseAnalysis'] = 11)] = 'SourceFileReuseAnalysis';
  /**
   * A Type Check Block (TCB) was generated.
   */
  PerfEvent[(PerfEvent['GenerateTcb'] = 12)] = 'GenerateTcb';
  /**
   * A Type Check Block (TCB) could not be generated because inlining was disabled, and the block
   * would've required inlining.
   */
  PerfEvent[(PerfEvent['SkipGenerateTcbNoInline'] = 13)] = 'SkipGenerateTcbNoInline';
  /**
   * A `.ngtypecheck.ts` file could be reused from the previous program and did not need to be
   * regenerated.
   */
  PerfEvent[(PerfEvent['ReuseTypeCheckFile'] = 14)] = 'ReuseTypeCheckFile';
  /**
   * The template type-checking program required changes and had to be updated in an incremental
   * step.
   */
  PerfEvent[(PerfEvent['UpdateTypeCheckProgram'] = 15)] = 'UpdateTypeCheckProgram';
  /**
   * The compiler was able to prove that a `ts.SourceFile` did not need to be re-emitted.
   */
  PerfEvent[(PerfEvent['EmitSkipSourceFile'] = 16)] = 'EmitSkipSourceFile';
  /**
   * A `ts.SourceFile` was emitted.
   */
  PerfEvent[(PerfEvent['EmitSourceFile'] = 17)] = 'EmitSourceFile';
  /**
   * Tracks the number of `PrefEvent`s, and must appear at the end of the list.
   */
  PerfEvent[(PerfEvent['LAST'] = 18)] = 'LAST';
})(PerfEvent || (PerfEvent = {}));
/**
 * Represents a checkpoint during compilation at which the memory usage of the compiler should be
 * recorded.
 */
export var PerfCheckpoint;
(function (PerfCheckpoint) {
  /**
   * The point at which the `PerfRecorder` was created, and ideally tracks memory used before any
   * compilation structures are created.
   */
  PerfCheckpoint[(PerfCheckpoint['Initial'] = 0)] = 'Initial';
  /**
   * The point just after the `ts.Program` has been created.
   */
  PerfCheckpoint[(PerfCheckpoint['TypeScriptProgramCreate'] = 1)] = 'TypeScriptProgramCreate';
  /**
   * The point just before Angular analysis starts.
   *
   * In the main usage pattern for the compiler, TypeScript diagnostics have been calculated at this
   * point, so the `ts.TypeChecker` has fully ingested the current program, all `ts.Type` structures
   * and `ts.Symbol`s have been created.
   */
  PerfCheckpoint[(PerfCheckpoint['PreAnalysis'] = 2)] = 'PreAnalysis';
  /**
   * The point just after Angular analysis completes.
   */
  PerfCheckpoint[(PerfCheckpoint['Analysis'] = 3)] = 'Analysis';
  /**
   * The point just after Angular resolution is complete.
   */
  PerfCheckpoint[(PerfCheckpoint['Resolve'] = 4)] = 'Resolve';
  /**
   * The point just after Type Check Blocks (TCBs) have been generated.
   */
  PerfCheckpoint[(PerfCheckpoint['TtcGeneration'] = 5)] = 'TtcGeneration';
  /**
   * The point just after the template type-checking program has been updated with any new TCBs.
   */
  PerfCheckpoint[(PerfCheckpoint['TtcUpdateProgram'] = 6)] = 'TtcUpdateProgram';
  /**
   * The point just before emit begins.
   *
   * In the main usage pattern for the compiler, all template type-checking diagnostics have been
   * requested at this point.
   */
  PerfCheckpoint[(PerfCheckpoint['PreEmit'] = 7)] = 'PreEmit';
  /**
   * The point just after the program has been fully emitted.
   */
  PerfCheckpoint[(PerfCheckpoint['Emit'] = 8)] = 'Emit';
  /**
   * Tracks the number of `PerfCheckpoint`s, and must appear at the end of the list.
   */
  PerfCheckpoint[(PerfCheckpoint['LAST'] = 9)] = 'LAST';
})(PerfCheckpoint || (PerfCheckpoint = {}));
//# sourceMappingURL=api.js.map
