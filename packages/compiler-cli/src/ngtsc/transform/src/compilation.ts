/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ConstantPool} from '@angular/compiler';
import ts from 'typescript';

import {SourceFileTypeIdentifier} from '../../core/api';
import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {IncrementalBuild} from '../../incremental/api';
import {SemanticDepGraphUpdater, SemanticSymbol} from '../../incremental/semantic_graph';
import {IndexingContext} from '../../indexer';
import {PerfEvent, PerfRecorder} from '../../perf';
import {
  ClassDeclaration,
  DeclarationNode,
  Decorator,
  isNamedClassDeclaration,
  ReflectionHost,
} from '../../reflection';
import {ProgramTypeCheckAdapter, TypeCheckContext} from '../../typecheck/api';
import {getSourceFile} from '../../util/src/typescript';
import {Xi18nContext} from '../../xi18n';

import {
  AnalysisOutput,
  CompilationMode,
  CompileResult,
  DecoratorHandler,
  HandlerPrecedence,
  ResolveResult,
} from './api';
import {DtsTransformRegistry} from './declaration';
import {PendingTrait, Trait, TraitState} from './trait';

/**
 * Records information about a specific class that has matched traits.
 */
export interface ClassRecord {
  /**
   * The `ClassDeclaration` of the class which has Angular traits applied.
   */
  node: ClassDeclaration;

  /**
   * All traits which matched on the class.
   */
  traits: Trait<unknown, unknown, SemanticSymbol | null, unknown>[];

  /**
   * Meta-diagnostics about the class, which are usually related to whether certain combinations of
   * Angular decorators are not permitted.
   */
  metaDiagnostics: ts.Diagnostic[] | null;

  // Subsequent fields are "internal" and used during the matching of `DecoratorHandler`s. This is
  // mutable state during the `detect`/`analyze` phases of compilation.

  /**
   * Whether `traits` contains traits matched from `DecoratorHandler`s marked as `WEAK`.
   */
  hasWeakHandlers: boolean;

  /**
   * Whether `traits` contains a trait from a `DecoratorHandler` matched as `PRIMARY`.
   */
  hasPrimaryHandler: boolean;
}

/**
 * The heart of Angular compilation.
 *
 * The `TraitCompiler` is responsible for processing all classes in the program. Any time a
 * `DecoratorHandler` matches a class, a "trait" is created to represent that Angular aspect of the
 * class (such as the class having a component definition).
 *
 * The `TraitCompiler` transitions each trait through the various phases of compilation, culminating
 * in the production of `CompileResult`s instructing the compiler to apply various mutations to the
 * class (like adding fields or type declarations).
 */
export class TraitCompiler implements ProgramTypeCheckAdapter {
  /**
   * Maps class declarations to their `ClassRecord`, which tracks the Ivy traits being applied to
   * those classes.
   */
  private classes = new Map<ClassDeclaration, ClassRecord>();

  /**
   * Maps source files to any class declaration(s) within them which have been discovered to contain
   * Ivy traits.
   */
  private fileToClasses = new Map<ts.SourceFile, Set<ClassDeclaration>>();

  /**
   * Tracks which source files have been analyzed but did not contain any traits. This set allows
   * the compiler to skip analyzing these files in an incremental rebuild.
   */
  private filesWithoutTraits = new Set<ts.SourceFile>();

  private reexportMap = new Map<string, Map<string, [string, string]>>();

  private handlersByName = new Map<
    string,
    DecoratorHandler<unknown, unknown, SemanticSymbol | null, unknown>
  >();

  constructor(
    private handlers: DecoratorHandler<unknown, unknown, SemanticSymbol | null, unknown>[],
    private reflector: ReflectionHost,
    private perf: PerfRecorder,
    private incrementalBuild: IncrementalBuild<ClassRecord, unknown>,
    private compileNonExportedClasses: boolean,
    private compilationMode: CompilationMode,
    private dtsTransforms: DtsTransformRegistry,
    private semanticDepGraphUpdater: SemanticDepGraphUpdater | null,
    private sourceFileTypeIdentifier: SourceFileTypeIdentifier,
    private emitDeclarationOnly: boolean,
  ) {
    for (const handler of handlers) {
      this.handlersByName.set(handler.name, handler);
    }
  }

  analyzeSync(sf: ts.SourceFile): void {
    this.analyze(sf, false);
  }

  analyzeAsync(sf: ts.SourceFile): Promise<void> | undefined {
    return this.analyze(sf, true);
  }

  private analyze(sf: ts.SourceFile, preanalyze: false): void;
  private analyze(sf: ts.SourceFile, preanalyze: true): Promise<void> | undefined;
  private analyze(sf: ts.SourceFile, preanalyze: boolean): Promise<void> | undefined {
    // We shouldn't analyze declaration, shim, or resource files.
    if (
      sf.isDeclarationFile ||
      this.sourceFileTypeIdentifier.isShim(sf) ||
      this.sourceFileTypeIdentifier.isResource(sf)
    ) {
      return undefined;
    }

    // analyze() really wants to return `Promise<void>|void`, but TypeScript cannot narrow a return
    // type of 'void', so `undefined` is used instead.
    const promises: Promise<void>[] = [];

    // Local compilation does not support incremental build.
    const priorWork =
      this.compilationMode !== CompilationMode.LOCAL
        ? this.incrementalBuild.priorAnalysisFor(sf)
        : null;
    if (priorWork !== null) {
      this.perf.eventCount(PerfEvent.SourceFileReuseAnalysis);

      if (priorWork.length > 0) {
        for (const priorRecord of priorWork) {
          this.adopt(priorRecord);
        }

        this.perf.eventCount(PerfEvent.TraitReuseAnalysis, priorWork.length);
      } else {
        this.filesWithoutTraits.add(sf);
      }

      // Skip the rest of analysis, as this file's prior traits are being reused.
      return;
    }

    const visit = (node: ts.Node): void => {
      if (this.reflector.isClass(node)) {
        this.analyzeClass(node, preanalyze ? promises : null);
      }
      ts.forEachChild(node, visit);
    };

    visit(sf);

    if (!this.fileToClasses.has(sf)) {
      // If no traits were detected in the source file we record the source file itself to not have
      // any traits, such that analysis of the source file can be skipped during incremental
      // rebuilds.
      this.filesWithoutTraits.add(sf);
    }

    if (preanalyze && promises.length > 0) {
      return Promise.all(promises).then(() => undefined as void);
    } else {
      return undefined;
    }
  }

  recordFor(clazz: ClassDeclaration): ClassRecord | null {
    if (this.classes.has(clazz)) {
      return this.classes.get(clazz)!;
    } else {
      return null;
    }
  }

  getAnalyzedRecords(): Map<ts.SourceFile, ClassRecord[]> {
    const result = new Map<ts.SourceFile, ClassRecord[]>();
    for (const [sf, classes] of this.fileToClasses) {
      const records: ClassRecord[] = [];
      for (const clazz of classes) {
        records.push(this.classes.get(clazz)!);
      }
      result.set(sf, records);
    }
    for (const sf of this.filesWithoutTraits) {
      result.set(sf, []);
    }
    return result;
  }

  /**
   * Import a `ClassRecord` from a previous compilation (only to be used in global compilation
   * modes)
   *
   * Traits from the `ClassRecord` have accurate metadata, but the `handler` is from the old program
   * and needs to be updated (matching is done by name). A new pending trait is created and then
   * transitioned to analyzed using the previous analysis. If the trait is in the errored state,
   * instead the errors are copied over.
   */
  private adopt(priorRecord: ClassRecord): void {
    const record: ClassRecord = {
      hasPrimaryHandler: priorRecord.hasPrimaryHandler,
      hasWeakHandlers: priorRecord.hasWeakHandlers,
      metaDiagnostics: priorRecord.metaDiagnostics,
      node: priorRecord.node,
      traits: [],
    };

    for (const priorTrait of priorRecord.traits) {
      const handler = this.handlersByName.get(priorTrait.handler.name)!;
      let trait: Trait<unknown, unknown, SemanticSymbol | null, unknown> = Trait.pending(
        handler,
        priorTrait.detected,
      );

      if (priorTrait.state === TraitState.Analyzed || priorTrait.state === TraitState.Resolved) {
        const symbol = this.makeSymbolForTrait(handler, record.node, priorTrait.analysis);
        trait = trait.toAnalyzed(priorTrait.analysis, priorTrait.analysisDiagnostics, symbol);
        if (trait.analysis !== null && trait.handler.register !== undefined) {
          trait.handler.register(record.node, trait.analysis);
        }
      } else if (priorTrait.state === TraitState.Skipped) {
        trait = trait.toSkipped();
      }

      record.traits.push(trait);
    }

    this.classes.set(record.node, record);
    const sf = record.node.getSourceFile();
    if (!this.fileToClasses.has(sf)) {
      this.fileToClasses.set(sf, new Set<ClassDeclaration>());
    }
    this.fileToClasses.get(sf)!.add(record.node);
  }

  private scanClassForTraits(
    clazz: ClassDeclaration,
  ): PendingTrait<unknown, unknown, SemanticSymbol | null, unknown>[] | null {
    if (!this.compileNonExportedClasses && !this.reflector.isStaticallyExported(clazz)) {
      return null;
    }

    const decorators = this.reflector.getDecoratorsOfDeclaration(clazz);

    return this.detectTraits(clazz, decorators);
  }

  protected detectTraits(
    clazz: ClassDeclaration,
    decorators: Decorator[] | null,
  ): PendingTrait<unknown, unknown, SemanticSymbol | null, unknown>[] | null {
    let record: ClassRecord | null = this.recordFor(clazz);
    let foundTraits: PendingTrait<unknown, unknown, SemanticSymbol | null, unknown>[] = [];

    // A set to track the non-Angular decorators in local compilation mode. An error will be issued
    // if non-Angular decorators is found in local compilation mode.
    const nonNgDecoratorsInLocalMode =
      this.compilationMode === CompilationMode.LOCAL ? new Set(decorators) : null;

    for (const handler of this.handlers) {
      const result = handler.detect(clazz, decorators);
      if (result === undefined) {
        continue;
      }

      if (nonNgDecoratorsInLocalMode !== null && result.decorator !== null) {
        nonNgDecoratorsInLocalMode.delete(result.decorator);
      }

      const isPrimaryHandler = handler.precedence === HandlerPrecedence.PRIMARY;
      const isWeakHandler = handler.precedence === HandlerPrecedence.WEAK;
      const trait = Trait.pending(handler, result);

      foundTraits.push(trait);

      if (record === null) {
        // This is the first handler to match this class. This path is a fast path through which
        // most classes will flow.
        record = {
          node: clazz,
          traits: [trait],
          metaDiagnostics: null,
          hasPrimaryHandler: isPrimaryHandler,
          hasWeakHandlers: isWeakHandler,
        };

        this.classes.set(clazz, record);
        const sf = clazz.getSourceFile();
        if (!this.fileToClasses.has(sf)) {
          this.fileToClasses.set(sf, new Set<ClassDeclaration>());
        }
        this.fileToClasses.get(sf)!.add(clazz);
      } else {
        // This is at least the second handler to match this class. This is a slower path that some
        // classes will go through, which validates that the set of decorators applied to the class
        // is valid.

        // Validate according to rules as follows:
        //
        // * WEAK handlers are removed if a non-WEAK handler matches.
        // * Only one PRIMARY handler can match at a time. Any other PRIMARY handler matching a
        //   class with an existing PRIMARY handler is an error.

        if (!isWeakHandler && record.hasWeakHandlers) {
          // The current handler is not a WEAK handler, but the class has other WEAK handlers.
          // Remove them.
          record.traits = record.traits.filter(
            (field) => field.handler.precedence !== HandlerPrecedence.WEAK,
          );
          record.hasWeakHandlers = false;
        } else if (isWeakHandler && !record.hasWeakHandlers) {
          // The current handler is a WEAK handler, but the class has non-WEAK handlers already.
          // Drop the current one.
          continue;
        }

        if (isPrimaryHandler && record.hasPrimaryHandler) {
          // The class already has a PRIMARY handler, and another one just matched.
          record.metaDiagnostics = [
            {
              category: ts.DiagnosticCategory.Error,
              code: Number('-99' + ErrorCode.DECORATOR_COLLISION),
              file: getSourceFile(clazz),
              start: clazz.getStart(undefined, false),
              length: clazz.getWidth(),
              messageText: 'Two incompatible decorators on class',
            },
          ];
          record.traits = foundTraits = [];
          break;
        }

        // Otherwise, it's safe to accept the multiple decorators here. Update some of the metadata
        // regarding this class.
        record.traits.push(trait);
        record.hasPrimaryHandler = record.hasPrimaryHandler || isPrimaryHandler;
      }
    }

    if (
      nonNgDecoratorsInLocalMode !== null &&
      nonNgDecoratorsInLocalMode.size > 0 &&
      record !== null &&
      record.metaDiagnostics === null
    ) {
      // Custom decorators found in local compilation mode! In this mode we don't support custom
      // decorators yet. But will eventually do (b/320536434). For now a temporary error is thrown.
      const compilationModeName = this.emitDeclarationOnly
        ? 'experimental declaration-only emission'
        : 'local compilation';
      record.metaDiagnostics = [...nonNgDecoratorsInLocalMode].map((decorator) => ({
        category: ts.DiagnosticCategory.Error,
        code: Number('-99' + ErrorCode.DECORATOR_UNEXPECTED),
        file: getSourceFile(clazz),
        start: decorator.node.getStart(),
        length: decorator.node.getWidth(),
        messageText: `In ${compilationModeName} mode, Angular does not support custom decorators. Ensure all class decorators are from Angular.`,
      }));
      record.traits = foundTraits = [];
    }

    return foundTraits.length > 0 ? foundTraits : null;
  }

  private makeSymbolForTrait(
    handler: DecoratorHandler<unknown, unknown, SemanticSymbol | null, unknown>,
    decl: ClassDeclaration,
    analysis: Readonly<unknown> | null,
  ): SemanticSymbol | null {
    if (analysis === null) {
      return null;
    }
    const symbol = handler.symbol(decl, analysis);
    if (symbol !== null && this.semanticDepGraphUpdater !== null) {
      const isPrimary = handler.precedence === HandlerPrecedence.PRIMARY;
      if (!isPrimary) {
        throw new Error(
          `AssertionError: ${handler.name} returned a symbol but is not a primary handler.`,
        );
      }
      this.semanticDepGraphUpdater.registerSymbol(symbol);
    }

    return symbol;
  }

  private analyzeClass(clazz: ClassDeclaration, preanalyzeQueue: Promise<void>[] | null): void {
    const traits = this.scanClassForTraits(clazz);

    if (traits === null) {
      // There are no Ivy traits on the class, so it can safely be skipped.
      return;
    }

    for (const trait of traits) {
      const analyze = () => this.analyzeTrait(clazz, trait);

      let preanalysis: Promise<void> | null = null;
      if (preanalyzeQueue !== null && trait.handler.preanalyze !== undefined) {
        // Attempt to run preanalysis. This could fail with a `FatalDiagnosticError`; catch it if it
        // does.
        try {
          preanalysis = trait.handler.preanalyze(clazz, trait.detected.metadata) || null;
        } catch (err) {
          if (err instanceof FatalDiagnosticError) {
            trait.toAnalyzed(null, [err.toDiagnostic()], null);
            return;
          } else {
            throw err;
          }
        }
      }
      if (preanalysis !== null) {
        preanalyzeQueue!.push(preanalysis.then(analyze));
      } else {
        analyze();
      }
    }
  }

  private analyzeTrait(
    clazz: ClassDeclaration,
    trait: Trait<unknown, unknown, SemanticSymbol | null, unknown>,
  ): void {
    if (trait.state !== TraitState.Pending) {
      throw new Error(
        `Attempt to analyze trait of ${clazz.name.text} in state ${
          TraitState[trait.state]
        } (expected DETECTED)`,
      );
    }

    this.perf.eventCount(PerfEvent.TraitAnalyze);

    // Attempt analysis. This could fail with a `FatalDiagnosticError`; catch it if it does.
    let result: AnalysisOutput<unknown>;
    try {
      result = trait.handler.analyze(clazz, trait.detected.metadata);
    } catch (err) {
      if (err instanceof FatalDiagnosticError) {
        trait.toAnalyzed(null, [err.toDiagnostic()], null);
        return;
      } else {
        throw err;
      }
    }

    const symbol = this.makeSymbolForTrait(trait.handler, clazz, result.analysis ?? null);
    if (result.analysis !== undefined && trait.handler.register !== undefined) {
      trait.handler.register(clazz, result.analysis);
    }
    trait = trait.toAnalyzed(result.analysis ?? null, result.diagnostics ?? null, symbol);
  }

  resolve(): void {
    const classes = this.classes.keys();
    for (const clazz of classes) {
      const record = this.classes.get(clazz)!;
      for (let trait of record.traits) {
        const handler = trait.handler;
        switch (trait.state) {
          case TraitState.Skipped:
            continue;
          case TraitState.Pending:
            throw new Error(
              `Resolving a trait that hasn't been analyzed: ${clazz.name.text} / ${trait.handler.name}`,
            );
          case TraitState.Resolved:
            throw new Error(`Resolving an already resolved trait`);
        }

        if (trait.analysis === null) {
          // No analysis results, cannot further process this trait.
          continue;
        }

        if (handler.resolve === undefined) {
          // No resolution of this trait needed - it's considered successful by default.
          trait = trait.toResolved(null, null);
          continue;
        }

        let result: ResolveResult<unknown>;
        try {
          result = handler.resolve(clazz, trait.analysis as Readonly<unknown>, trait.symbol);
        } catch (err) {
          if (err instanceof FatalDiagnosticError) {
            trait = trait.toResolved(null, [err.toDiagnostic()]);
            continue;
          } else {
            throw err;
          }
        }

        trait = trait.toResolved(result.data ?? null, result.diagnostics ?? null);

        if (result.reexports !== undefined) {
          const fileName = clazz.getSourceFile().fileName;
          if (!this.reexportMap.has(fileName)) {
            this.reexportMap.set(fileName, new Map<string, [string, string]>());
          }
          const fileReexports = this.reexportMap.get(fileName)!;
          for (const reexport of result.reexports) {
            fileReexports.set(reexport.asAlias, [reexport.fromModule, reexport.symbolName]);
          }
        }
      }
    }
  }

  /**
   * Generate type-checking code into the `TypeCheckContext` for any components within the given
   * `ts.SourceFile`.
   */
  typeCheck(sf: ts.SourceFile, ctx: TypeCheckContext): void {
    if (!this.fileToClasses.has(sf) || this.compilationMode === CompilationMode.LOCAL) {
      return;
    }

    for (const clazz of this.fileToClasses.get(sf)!) {
      const record = this.classes.get(clazz)!;
      for (const trait of record.traits) {
        if (trait.state !== TraitState.Resolved) {
          continue;
        } else if (trait.handler.typeCheck === undefined) {
          continue;
        }
        if (trait.resolution !== null) {
          trait.handler.typeCheck(ctx, clazz, trait.analysis, trait.resolution);
        }
      }
    }
  }

  runAdditionalChecks(
    sf: ts.SourceFile,
    check: (
      clazz: ts.ClassDeclaration,
      handler: DecoratorHandler<unknown, unknown, SemanticSymbol | null, unknown>,
    ) => ts.Diagnostic[] | null,
  ): ts.Diagnostic[] {
    if (this.compilationMode === CompilationMode.LOCAL) {
      return [];
    }
    const classes = this.fileToClasses.get(sf);
    if (classes === undefined) {
      return [];
    }

    const diagnostics: ts.Diagnostic[] = [];
    for (const clazz of classes) {
      if (!isNamedClassDeclaration(clazz)) {
        continue;
      }
      const record = this.classes.get(clazz)!;
      for (const trait of record.traits) {
        const result = check(clazz, trait.handler);
        if (result !== null) {
          diagnostics.push(...result);
        }
      }
    }
    return diagnostics;
  }

  index(ctx: IndexingContext): void {
    for (const clazz of this.classes.keys()) {
      const record = this.classes.get(clazz)!;
      for (const trait of record.traits) {
        if (trait.state !== TraitState.Resolved) {
          // Skip traits that haven't been resolved successfully.
          continue;
        } else if (trait.handler.index === undefined) {
          // Skip traits that don't affect indexing.
          continue;
        }

        if (trait.resolution !== null) {
          trait.handler.index(ctx, clazz, trait.analysis, trait.resolution);
        }
      }
    }
  }

  xi18n(bundle: Xi18nContext): void {
    for (const clazz of this.classes.keys()) {
      const record = this.classes.get(clazz)!;
      for (const trait of record.traits) {
        if (trait.state !== TraitState.Analyzed && trait.state !== TraitState.Resolved) {
          // Skip traits that haven't been analyzed successfully.
          continue;
        } else if (trait.handler.xi18n === undefined) {
          // Skip traits that don't support xi18n.
          continue;
        }

        if (trait.analysis !== null) {
          trait.handler.xi18n(bundle, clazz, trait.analysis);
        }
      }
    }
  }

  updateResources(clazz: DeclarationNode): void {
    // Local compilation does not support incremental
    if (
      this.compilationMode === CompilationMode.LOCAL ||
      !this.reflector.isClass(clazz) ||
      !this.classes.has(clazz)
    ) {
      return;
    }
    const record = this.classes.get(clazz)!;
    for (const trait of record.traits) {
      if (trait.state !== TraitState.Resolved || trait.handler.updateResources === undefined) {
        continue;
      }

      trait.handler.updateResources(clazz, trait.analysis, trait.resolution);
    }
  }

  compile(clazz: DeclarationNode, constantPool: ConstantPool): CompileResult[] | null {
    const original = ts.getOriginalNode(clazz) as typeof clazz;
    if (
      !this.reflector.isClass(clazz) ||
      !this.reflector.isClass(original) ||
      !this.classes.has(original)
    ) {
      return null;
    }

    const record = this.classes.get(original)!;

    let res: CompileResult[] = [];

    for (const trait of record.traits) {
      let compileRes: CompileResult | CompileResult[];

      if (
        trait.state !== TraitState.Resolved ||
        containsErrors(trait.analysisDiagnostics) ||
        containsErrors(trait.resolveDiagnostics)
      ) {
        // Cannot compile a trait that is not resolved, or had any errors in its declaration.
        continue;
      }

      if (this.compilationMode === CompilationMode.LOCAL) {
        // `trait.analysis` is non-null asserted here because TypeScript does not recognize that
        // `Readonly<unknown>` is nullable (as `unknown` itself is nullable) due to the way that
        // `Readonly` works.
        compileRes = trait.handler.compileLocal(
          clazz,
          trait.analysis!,
          trait.resolution!,
          constantPool,
        );
      } else {
        // `trait.resolution` is non-null asserted below because TypeScript does not recognize that
        // `Readonly<unknown>` is nullable (as `unknown` itself is nullable) due to the way that
        // `Readonly` works.
        if (
          this.compilationMode === CompilationMode.PARTIAL &&
          trait.handler.compilePartial !== undefined
        ) {
          compileRes = trait.handler.compilePartial(clazz, trait.analysis, trait.resolution!);
        } else {
          compileRes = trait.handler.compileFull(
            clazz,
            trait.analysis,
            trait.resolution!,
            constantPool,
          );
        }
      }

      const compileMatchRes = compileRes;
      if (Array.isArray(compileMatchRes)) {
        for (const result of compileMatchRes) {
          if (!res.some((r) => r.name === result.name)) {
            res.push(result);
          }
        }
      } else if (!res.some((result) => result.name === compileMatchRes.name)) {
        res.push(compileMatchRes);
      }
    }

    // Look up the .d.ts transformer for the input file and record that at least one field was
    // generated, which will allow the .d.ts to be transformed later.
    this.dtsTransforms
      .getIvyDeclarationTransform(original.getSourceFile())
      .addFields(original, res);

    // Return the instruction to the transformer so the fields will be added.
    return res.length > 0 ? res : null;
  }

  compileHmrUpdateCallback(clazz: DeclarationNode): ts.FunctionDeclaration | null {
    const original = ts.getOriginalNode(clazz) as typeof clazz;

    if (
      !this.reflector.isClass(clazz) ||
      !this.reflector.isClass(original) ||
      !this.classes.has(original)
    ) {
      return null;
    }

    const record = this.classes.get(original)!;

    for (const trait of record.traits) {
      // Cannot compile a trait that is not resolved, or had any errors in its declaration.
      if (
        trait.state === TraitState.Resolved &&
        trait.handler.compileHmrUpdateDeclaration !== undefined &&
        !containsErrors(trait.analysisDiagnostics) &&
        !containsErrors(trait.resolveDiagnostics)
      ) {
        return trait.handler.compileHmrUpdateDeclaration(clazz, trait.analysis, trait.resolution!);
      }
    }

    return null;
  }

  decoratorsFor(node: ts.Declaration): ts.Decorator[] {
    const original = ts.getOriginalNode(node) as typeof node;
    if (!this.reflector.isClass(original) || !this.classes.has(original)) {
      return [];
    }

    const record = this.classes.get(original)!;
    const decorators: ts.Decorator[] = [];

    for (const trait of record.traits) {
      // In global compilation mode skip the non-resolved traits.
      if (this.compilationMode !== CompilationMode.LOCAL && trait.state !== TraitState.Resolved) {
        continue;
      }

      if (trait.detected.trigger !== null && ts.isDecorator(trait.detected.trigger)) {
        decorators.push(trait.detected.trigger);
      }
    }

    return decorators;
  }

  get diagnostics(): ReadonlyArray<ts.Diagnostic> {
    const diagnostics: ts.Diagnostic[] = [];
    for (const clazz of this.classes.keys()) {
      const record = this.classes.get(clazz)!;
      if (record.metaDiagnostics !== null) {
        diagnostics.push(...record.metaDiagnostics);
      }
      for (const trait of record.traits) {
        if (
          (trait.state === TraitState.Analyzed || trait.state === TraitState.Resolved) &&
          trait.analysisDiagnostics !== null
        ) {
          diagnostics.push(...trait.analysisDiagnostics);
        }
        if (trait.state === TraitState.Resolved) {
          diagnostics.push(...(trait.resolveDiagnostics ?? []));
        }
      }
    }
    return diagnostics;
  }

  get exportStatements(): Map<string, Map<string, [string, string]>> {
    return this.reexportMap;
  }
}

function containsErrors(diagnostics: ts.Diagnostic[] | null): boolean {
  return (
    diagnostics !== null &&
    diagnostics.some((diag) => diag.category === ts.DiagnosticCategory.Error)
  );
}
