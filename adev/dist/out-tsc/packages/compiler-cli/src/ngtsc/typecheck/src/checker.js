/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  CssSelector,
  DomElementSchemaRegistry,
  ExternalExpr,
  WrappedNodeExpr,
} from '@angular/compiler';
import {isDirectiveDeclaration, isSymbolAliasOf} from './ts_util';
import ts from 'typescript';
import {ngErrorCode} from '../../diagnostics';
import {absoluteFromSourceFile, getSourceFileOrError} from '../../file_system';
import {Reference, ReferenceEmitKind} from '../../imports';
import {MetaKind} from '../../metadata';
import {PerfCheckpoint, PerfEvent, PerfPhase} from '../../perf';
import {UpdateMode} from '../../program_driver';
import {isNamedClassDeclaration} from '../../reflection';
import {ComponentScopeKind} from '../../scope';
import {isShim} from '../../shims';
import {
  getSourceFileOrNull,
  getTokenAtPosition,
  isSymbolWithValueDeclaration,
} from '../../util/src/typescript';
import {OptimizeFor, PotentialImportKind, PotentialImportMode} from '../api';
import {makeTemplateDiagnostic} from '../diagnostics';
import {CompletionEngine} from './completion';
import {InliningMode, TypeCheckContextImpl} from './context';
import {shouldReportDiagnostic, translateDiagnostic} from './diagnostics';
import {TypeCheckShimGenerator} from './shim';
import {DirectiveSourceManager} from './source';
import {findTypeCheckBlock, getSourceMapping} from './tcb_util';
import {SymbolBuilder} from './template_symbol_builder';
import {findAllMatchingNodes} from './comments';
const REGISTRY = new DomElementSchemaRegistry();
/**
 * Primary template type-checking engine, which performs type-checking using a
 * `TypeCheckingProgramStrategy` for type-checking program maintenance, and the
 * `ProgramTypeCheckAdapter` for generation of template type-checking code.
 */
export class TemplateTypeCheckerImpl {
  originalProgram;
  programDriver;
  typeCheckAdapter;
  config;
  refEmitter;
  reflector;
  compilerHost;
  priorBuild;
  metaReader;
  localMetaReader;
  ngModuleIndex;
  componentScopeReader;
  typeCheckScopeRegistry;
  perf;
  state = new Map();
  /**
   * Stores the `CompletionEngine` which powers autocompletion for each component class.
   *
   * Must be invalidated whenever the component's template or the `ts.Program` changes. Invalidation
   * on template changes is performed within this `TemplateTypeCheckerImpl` instance. When the
   * `ts.Program` changes, the `TemplateTypeCheckerImpl` as a whole is destroyed and replaced.
   */
  completionCache = new Map();
  /**
   * Stores the `SymbolBuilder` which creates symbols for each component class.
   *
   * Must be invalidated whenever the component's template or the `ts.Program` changes. Invalidation
   * on template changes is performed within this `TemplateTypeCheckerImpl` instance. When the
   * `ts.Program` changes, the `TemplateTypeCheckerImpl` as a whole is destroyed and replaced.
   */
  symbolBuilderCache = new Map();
  /**
   * Stores directives and pipes that are in scope for each component.
   *
   * Unlike other caches, the scope of a component is not affected by its template. It will be
   * destroyed when the `ts.Program` changes and the `TemplateTypeCheckerImpl` as a whole is
   * destroyed and replaced.
   */
  scopeCache = new Map();
  /**
   * Stores potential element tags for each component (a union of DOM tags as well as directive
   * tags).
   *
   * Unlike other caches, the scope of a component is not affected by its template. It will be
   * destroyed when the `ts.Program` changes and the `TemplateTypeCheckerImpl` as a whole is
   * destroyed and replaced.
   */
  elementTagCache = new Map();
  isComplete = false;
  priorResultsAdopted = false;
  constructor(
    originalProgram,
    programDriver,
    typeCheckAdapter,
    config,
    refEmitter,
    reflector,
    compilerHost,
    priorBuild,
    metaReader,
    localMetaReader,
    ngModuleIndex,
    componentScopeReader,
    typeCheckScopeRegistry,
    perf,
  ) {
    this.originalProgram = originalProgram;
    this.programDriver = programDriver;
    this.typeCheckAdapter = typeCheckAdapter;
    this.config = config;
    this.refEmitter = refEmitter;
    this.reflector = reflector;
    this.compilerHost = compilerHost;
    this.priorBuild = priorBuild;
    this.metaReader = metaReader;
    this.localMetaReader = localMetaReader;
    this.ngModuleIndex = ngModuleIndex;
    this.componentScopeReader = componentScopeReader;
    this.typeCheckScopeRegistry = typeCheckScopeRegistry;
    this.perf = perf;
  }
  getTemplate(component, optimizeFor) {
    const {data} = this.getLatestComponentState(component, optimizeFor);
    return data?.template ?? null;
  }
  getHostElement(directive, optimizeFor) {
    const {data} = this.getLatestComponentState(directive, optimizeFor);
    return data?.hostElement ?? null;
  }
  getUsedDirectives(component) {
    return this.getLatestComponentState(component).data?.boundTarget.getUsedDirectives() ?? null;
  }
  getUsedPipes(component) {
    return this.getLatestComponentState(component).data?.boundTarget.getUsedPipes() ?? null;
  }
  getLatestComponentState(component, optimizeFor = OptimizeFor.SingleFile) {
    switch (optimizeFor) {
      case OptimizeFor.WholeProgram:
        this.ensureAllShimsForAllFiles();
        break;
      case OptimizeFor.SingleFile:
        this.ensureShimForComponent(component);
        break;
    }
    const sf = component.getSourceFile();
    const sfPath = absoluteFromSourceFile(sf);
    const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
    const fileRecord = this.getFileData(sfPath);
    if (!fileRecord.shimData.has(shimPath)) {
      return {data: null, tcb: null, tcbPath: shimPath, tcbIsShim: true};
    }
    const id = fileRecord.sourceManager.getTypeCheckId(component);
    const shimRecord = fileRecord.shimData.get(shimPath);
    const program = this.programDriver.getProgram();
    const shimSf = getSourceFileOrNull(program, shimPath);
    if (shimSf === null || !fileRecord.shimData.has(shimPath)) {
      throw new Error(`Error: no shim file in program: ${shimPath}`);
    }
    let tcb = findTypeCheckBlock(shimSf, id, /*isDiagnosticsRequest*/ false);
    let tcbPath = shimPath;
    if (tcb === null) {
      // Try for an inline block.
      const inlineSf = getSourceFileOrError(program, sfPath);
      tcb = findTypeCheckBlock(inlineSf, id, /*isDiagnosticsRequest*/ false);
      if (tcb !== null) {
        tcbPath = sfPath;
      }
    }
    let data = null;
    if (shimRecord.data.has(id)) {
      data = shimRecord.data.get(id);
    }
    return {data, tcb, tcbPath, tcbIsShim: tcbPath === shimPath};
  }
  isTrackedTypeCheckFile(filePath) {
    return this.getFileAndShimRecordsForPath(filePath) !== null;
  }
  getFileRecordForTcbLocation({tcbPath, isShimFile}) {
    if (!isShimFile) {
      // The location is not within a shim file but corresponds with an inline TCB in an original
      // source file; we can obtain the record directly by its path.
      if (this.state.has(tcbPath)) {
        return this.state.get(tcbPath);
      } else {
        return null;
      }
    }
    // The location is within a type-checking shim file; find the type-checking data that owns this
    // shim path.
    const records = this.getFileAndShimRecordsForPath(tcbPath);
    if (records !== null) {
      return records.fileRecord;
    } else {
      return null;
    }
  }
  getFileAndShimRecordsForPath(shimPath) {
    for (const fileRecord of this.state.values()) {
      if (fileRecord.shimData.has(shimPath)) {
        return {fileRecord, shimRecord: fileRecord.shimData.get(shimPath)};
      }
    }
    return null;
  }
  getSourceMappingAtTcbLocation(tcbLocation) {
    const fileRecord = this.getFileRecordForTcbLocation(tcbLocation);
    if (fileRecord === null) {
      return null;
    }
    const shimSf = this.programDriver.getProgram().getSourceFile(tcbLocation.tcbPath);
    if (shimSf === undefined) {
      return null;
    }
    return getSourceMapping(
      shimSf,
      tcbLocation.positionInFile,
      fileRecord.sourceManager,
      /*isDiagnosticsRequest*/ false,
    );
  }
  generateAllTypeCheckBlocks() {
    this.ensureAllShimsForAllFiles();
  }
  /**
   * Retrieve type-checking and template parse diagnostics from the given `ts.SourceFile` using the
   * most recent type-checking program.
   */
  getDiagnosticsForFile(sf, optimizeFor) {
    switch (optimizeFor) {
      case OptimizeFor.WholeProgram:
        this.ensureAllShimsForAllFiles();
        break;
      case OptimizeFor.SingleFile:
        this.ensureAllShimsForOneFile(sf);
        break;
    }
    return this.perf.inPhase(PerfPhase.TtcDiagnostics, () => {
      const sfPath = absoluteFromSourceFile(sf);
      const fileRecord = this.state.get(sfPath);
      const typeCheckProgram = this.programDriver.getProgram();
      const diagnostics = [];
      if (fileRecord.hasInlines) {
        const inlineSf = getSourceFileOrError(typeCheckProgram, sfPath);
        diagnostics.push(
          ...typeCheckProgram
            .getSemanticDiagnostics(inlineSf)
            .map((diag) => convertDiagnostic(diag, fileRecord.sourceManager)),
        );
      }
      for (const [shimPath, shimRecord] of fileRecord.shimData) {
        const shimSf = getSourceFileOrError(typeCheckProgram, shimPath);
        diagnostics.push(
          ...typeCheckProgram
            .getSemanticDiagnostics(shimSf)
            .map((diag) => convertDiagnostic(diag, fileRecord.sourceManager)),
        );
        diagnostics.push(...shimRecord.genesisDiagnostics);
        for (const templateData of shimRecord.data.values()) {
          diagnostics.push(...templateData.templateParsingDiagnostics);
        }
      }
      return diagnostics.filter((diag) => diag !== null);
    });
  }
  getSuggestionDiagnosticsForFile(sf, tsLs, optimizeFor) {
    switch (optimizeFor) {
      case OptimizeFor.WholeProgram:
        this.ensureAllShimsForAllFiles();
        break;
      case OptimizeFor.SingleFile:
        this.ensureAllShimsForOneFile(sf);
        break;
    }
    return this.perf.inPhase(PerfPhase.TtcSuggestionDiagnostics, () => {
      const sfPath = absoluteFromSourceFile(sf);
      const fileRecord = this.state.get(sfPath);
      const diagnostics = [];
      const program = this.programDriver.getProgram();
      if (fileRecord.hasInlines) {
        diagnostics.push(
          ...getDeprecatedSuggestionDiagnostics(tsLs, program, sfPath, fileRecord, this),
        );
      }
      for (const [shimPath] of fileRecord.shimData) {
        diagnostics.push(
          ...getDeprecatedSuggestionDiagnostics(tsLs, program, shimPath, fileRecord, this),
        );
      }
      return diagnostics.filter((diag) => diag !== null);
    });
  }
  getDiagnosticsForComponent(component) {
    this.ensureShimForComponent(component);
    return this.perf.inPhase(PerfPhase.TtcDiagnostics, () => {
      const sf = component.getSourceFile();
      const sfPath = absoluteFromSourceFile(sf);
      const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
      const fileRecord = this.getFileData(sfPath);
      if (!fileRecord.shimData.has(shimPath)) {
        return [];
      }
      const id = fileRecord.sourceManager.getTypeCheckId(component);
      const shimRecord = fileRecord.shimData.get(shimPath);
      const typeCheckProgram = this.programDriver.getProgram();
      const diagnostics = [];
      if (shimRecord.hasInlines) {
        const inlineSf = getSourceFileOrError(typeCheckProgram, sfPath);
        diagnostics.push(
          ...typeCheckProgram
            .getSemanticDiagnostics(inlineSf)
            .map((diag) => convertDiagnostic(diag, fileRecord.sourceManager)),
        );
      }
      const shimSf = getSourceFileOrError(typeCheckProgram, shimPath);
      diagnostics.push(
        ...typeCheckProgram
          .getSemanticDiagnostics(shimSf)
          .map((diag) => convertDiagnostic(diag, fileRecord.sourceManager)),
      );
      diagnostics.push(...shimRecord.genesisDiagnostics);
      for (const templateData of shimRecord.data.values()) {
        diagnostics.push(...templateData.templateParsingDiagnostics);
      }
      return diagnostics.filter((diag) => diag !== null && diag.typeCheckId === id);
    });
  }
  getSuggestionDiagnosticsForComponent(component, tsLs) {
    this.ensureShimForComponent(component);
    return this.perf.inPhase(PerfPhase.TtcSuggestionDiagnostics, () => {
      const sf = component.getSourceFile();
      const sfPath = absoluteFromSourceFile(sf);
      const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
      const fileRecord = this.getFileData(sfPath);
      if (!fileRecord.shimData.has(shimPath)) {
        return [];
      }
      const templateId = fileRecord.sourceManager.getTypeCheckId(component);
      const shimRecord = fileRecord.shimData.get(shimPath);
      const diagnostics = [];
      const program = this.programDriver.getProgram();
      if (shimRecord.hasInlines) {
        diagnostics.push(
          ...getDeprecatedSuggestionDiagnostics(tsLs, program, sfPath, fileRecord, this),
        );
      }
      diagnostics.push(
        ...getDeprecatedSuggestionDiagnostics(tsLs, program, shimPath, fileRecord, this),
      );
      return diagnostics.filter((diag) => diag !== null && diag.typeCheckId === templateId);
    });
  }
  getTypeCheckBlock(component) {
    return this.getLatestComponentState(component).tcb;
  }
  getGlobalCompletions(context, component, node) {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcAutocompletion, () =>
      engine.getGlobalCompletions(context, node),
    );
  }
  getExpressionCompletionLocation(ast, component) {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcAutocompletion, () =>
      engine.getExpressionCompletionLocation(ast),
    );
  }
  getLiteralCompletionLocation(node, component) {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcAutocompletion, () =>
      engine.getLiteralCompletionLocation(node),
    );
  }
  invalidateClass(clazz) {
    this.completionCache.delete(clazz);
    this.symbolBuilderCache.delete(clazz);
    this.scopeCache.delete(clazz);
    this.elementTagCache.delete(clazz);
    const sf = clazz.getSourceFile();
    const sfPath = absoluteFromSourceFile(sf);
    const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
    const fileData = this.getFileData(sfPath);
    const id = fileData.sourceManager.getTypeCheckId(clazz);
    fileData.shimData.delete(shimPath);
    fileData.isComplete = false;
    this.isComplete = false;
  }
  getExpressionTarget(expression, clazz) {
    return (
      this.getLatestComponentState(clazz).data?.boundTarget.getExpressionTarget(expression) ?? null
    );
  }
  makeTemplateDiagnostic(clazz, sourceSpan, category, errorCode, message, relatedInformation) {
    const sfPath = absoluteFromSourceFile(clazz.getSourceFile());
    const fileRecord = this.state.get(sfPath);
    const id = fileRecord.sourceManager.getTypeCheckId(clazz);
    const mapping = fileRecord.sourceManager.getTemplateSourceMapping(id);
    return {
      ...makeTemplateDiagnostic(
        id,
        mapping,
        sourceSpan,
        category,
        ngErrorCode(errorCode),
        message,
        relatedInformation,
      ),
      __ngCode: errorCode,
    };
  }
  getOrCreateCompletionEngine(component) {
    if (this.completionCache.has(component)) {
      return this.completionCache.get(component);
    }
    const {tcb, data, tcbPath, tcbIsShim} = this.getLatestComponentState(component);
    if (tcb === null || data === null) {
      return null;
    }
    const engine = new CompletionEngine(tcb, data, tcbPath, tcbIsShim);
    this.completionCache.set(component, engine);
    return engine;
  }
  maybeAdoptPriorResults() {
    if (this.priorResultsAdopted) {
      return;
    }
    for (const sf of this.originalProgram.getSourceFiles()) {
      if (sf.isDeclarationFile || isShim(sf)) {
        continue;
      }
      const sfPath = absoluteFromSourceFile(sf);
      if (this.state.has(sfPath)) {
        const existingResults = this.state.get(sfPath);
        if (existingResults.isComplete) {
          // All data for this file has already been generated, so no need to adopt anything.
          continue;
        }
      }
      const previousResults = this.priorBuild.priorTypeCheckingResultsFor(sf);
      if (previousResults === null || !previousResults.isComplete) {
        continue;
      }
      this.perf.eventCount(PerfEvent.ReuseTypeCheckFile);
      this.state.set(sfPath, previousResults);
    }
    this.priorResultsAdopted = true;
  }
  ensureAllShimsForAllFiles() {
    if (this.isComplete) {
      return;
    }
    this.maybeAdoptPriorResults();
    this.perf.inPhase(PerfPhase.TcbGeneration, () => {
      const host = new WholeProgramTypeCheckingHost(this);
      const ctx = this.newContext(host);
      for (const sf of this.originalProgram.getSourceFiles()) {
        if (sf.isDeclarationFile || isShim(sf)) {
          continue;
        }
        const sfPath = absoluteFromSourceFile(sf);
        const fileData = this.getFileData(sfPath);
        if (fileData.isComplete) {
          continue;
        }
        this.typeCheckAdapter.typeCheck(sf, ctx);
        fileData.isComplete = true;
      }
      this.updateFromContext(ctx);
      this.isComplete = true;
    });
  }
  ensureAllShimsForOneFile(sf) {
    this.maybeAdoptPriorResults();
    this.perf.inPhase(PerfPhase.TcbGeneration, () => {
      const sfPath = absoluteFromSourceFile(sf);
      const fileData = this.getFileData(sfPath);
      if (fileData.isComplete) {
        // All data for this file is present and accounted for already.
        return;
      }
      const host = new SingleFileTypeCheckingHost(sfPath, fileData, this);
      const ctx = this.newContext(host);
      this.typeCheckAdapter.typeCheck(sf, ctx);
      fileData.isComplete = true;
      this.updateFromContext(ctx);
    });
  }
  ensureShimForComponent(component) {
    this.maybeAdoptPriorResults();
    const sf = component.getSourceFile();
    const sfPath = absoluteFromSourceFile(sf);
    const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
    const fileData = this.getFileData(sfPath);
    if (fileData.shimData.has(shimPath)) {
      // All data for this component is available.
      return;
    }
    const host = new SingleShimTypeCheckingHost(sfPath, fileData, this, shimPath);
    const ctx = this.newContext(host);
    this.typeCheckAdapter.typeCheck(sf, ctx);
    this.updateFromContext(ctx);
  }
  newContext(host) {
    const inlining = this.programDriver.supportsInlineOperations
      ? InliningMode.InlineOps
      : InliningMode.Error;
    return new TypeCheckContextImpl(
      this.config,
      this.compilerHost,
      this.refEmitter,
      this.reflector,
      host,
      inlining,
      this.perf,
    );
  }
  /**
   * Remove any shim data that depends on inline operations applied to the type-checking program.
   *
   * This can be useful if new inlines need to be applied, and it's not possible to guarantee that
   * they won't overwrite or corrupt existing inlines that are used by such shims.
   */
  clearAllShimDataUsingInlines() {
    for (const fileData of this.state.values()) {
      if (!fileData.hasInlines) {
        continue;
      }
      for (const [shimFile, shimData] of fileData.shimData.entries()) {
        if (shimData.hasInlines) {
          fileData.shimData.delete(shimFile);
        }
      }
      fileData.hasInlines = false;
      fileData.isComplete = false;
      this.isComplete = false;
    }
  }
  updateFromContext(ctx) {
    const updates = ctx.finalize();
    return this.perf.inPhase(PerfPhase.TcbUpdateProgram, () => {
      if (updates.size > 0) {
        this.perf.eventCount(PerfEvent.UpdateTypeCheckProgram);
      }
      this.programDriver.updateFiles(updates, UpdateMode.Incremental);
      this.priorBuild.recordSuccessfulTypeCheck(this.state);
      this.perf.memory(PerfCheckpoint.TtcUpdateProgram);
    });
  }
  getFileData(path) {
    if (!this.state.has(path)) {
      this.state.set(path, {
        hasInlines: false,
        sourceManager: new DirectiveSourceManager(),
        isComplete: false,
        shimData: new Map(),
      });
    }
    return this.state.get(path);
  }
  getSymbolOfNode(node, component) {
    const builder = this.getOrCreateSymbolBuilder(component);
    if (builder === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcSymbol, () => builder.getSymbol(node));
  }
  getOrCreateSymbolBuilder(component) {
    if (this.symbolBuilderCache.has(component)) {
      return this.symbolBuilderCache.get(component);
    }
    const {tcb, data, tcbPath, tcbIsShim} = this.getLatestComponentState(component);
    if (tcb === null || data === null) {
      return null;
    }
    const builder = new SymbolBuilder(
      tcbPath,
      tcbIsShim,
      tcb,
      data,
      this.componentScopeReader,
      () => this.programDriver.getProgram().getTypeChecker(),
    );
    this.symbolBuilderCache.set(component, builder);
    return builder;
  }
  getGlobalTsContext(component) {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return engine.getGlobalTsContext();
  }
  getPotentialTemplateDirectives(component, tsLs, options) {
    const scope = this.getComponentScope(component);
    // Don't resolve directives for selectorless components since they're already in the file.
    if (scope?.kind === ComponentScopeKind.Selectorless) {
      return [];
    }
    const resultingDirectives = new Map();
    const directivesInScope = this.getTemplateDirectiveInScope(component);
    const directiveInGlobal = this.getElementsInGlobal(component, tsLs, options);
    for (const directive of [...directivesInScope, ...directiveInGlobal]) {
      if (resultingDirectives.has(directive.ref.node)) {
        continue;
      }
      resultingDirectives.set(directive.ref.node, directive);
    }
    return Array.from(resultingDirectives.values());
  }
  getPotentialPipes(component) {
    const scope = this.getComponentScope(component);
    // Don't resolve pipes for selectorless components since they're already in the file.
    if (scope?.kind === ComponentScopeKind.Selectorless) {
      return [];
    }
    // Very similar to the above `getPotentialTemplateDirectives`, but on pipes.
    const typeChecker = this.programDriver.getProgram().getTypeChecker();
    const resultingPipes = new Map();
    if (scope !== null) {
      const inScopePipes = this.getScopeData(component, scope)?.pipes ?? [];
      for (const p of inScopePipes) {
        resultingPipes.set(p.ref.node, p);
      }
    }
    for (const pipeClass of this.localMetaReader.getKnown(MetaKind.Pipe)) {
      const pipeMeta = this.metaReader.getPipeMetadata(new Reference(pipeClass));
      if (pipeMeta === null) continue;
      if (resultingPipes.has(pipeClass)) continue;
      const withScope = this.scopeDataOfPipeMeta(typeChecker, pipeMeta);
      if (withScope === null) continue;
      resultingPipes.set(pipeClass, {...withScope, isInScope: false});
    }
    return Array.from(resultingPipes.values());
  }
  getDirectiveMetadata(dir) {
    if (!isNamedClassDeclaration(dir)) {
      return null;
    }
    return this.typeCheckScopeRegistry.getTypeCheckDirectiveMetadata(new Reference(dir));
  }
  getNgModuleMetadata(module) {
    if (!isNamedClassDeclaration(module)) {
      return null;
    }
    return this.metaReader.getNgModuleMetadata(new Reference(module));
  }
  getPipeMetadata(pipe) {
    if (!isNamedClassDeclaration(pipe)) {
      return null;
    }
    return this.metaReader.getPipeMetadata(new Reference(pipe));
  }
  getTemplateDirectiveInScope(component) {
    const resultingDirectives = new Map();
    const scope = this.getComponentScope(component);
    // Don't resolve directives for selectorless components since they're already in the file.
    if (scope?.kind === ComponentScopeKind.Selectorless) {
      return [];
    }
    if (scope !== null) {
      const inScopeDirectives = this.getScopeData(component, scope)?.directives ?? [];
      // First, all in scope directives can be used.
      for (const d of inScopeDirectives) {
        resultingDirectives.set(d.ref.node, d);
      }
    }
    const typeChecker = this.programDriver.getProgram().getTypeChecker();
    const currentComponentFileName = component.getSourceFile().fileName;
    // Any additional directives found from the global registry can be used, only includes the directives includes in the current
    // component file.
    //
    // This means only the inputs in the decorator are needed to be updated, no need to update the import statement.
    for (const directiveClass of this.localMetaReader.getKnown(MetaKind.Directive)) {
      if (directiveClass.getSourceFile().fileName !== currentComponentFileName) {
        continue;
      }
      const directiveMeta = this.metaReader.getDirectiveMetadata(new Reference(directiveClass));
      if (directiveMeta === null) continue;
      if (resultingDirectives.has(directiveClass)) continue;
      const withScope = this.scopeDataOfDirectiveMeta(typeChecker, directiveMeta);
      if (withScope === null) continue;
      resultingDirectives.set(directiveClass, {...withScope, isInScope: false});
    }
    return Array.from(resultingDirectives.values());
  }
  getDirectiveScopeData(component, isInScope, tsCompletionEntryInfo) {
    const typeChecker = this.programDriver.getProgram().getTypeChecker();
    if (!isNamedClassDeclaration(component)) {
      return null;
    }
    const directiveMeta = this.metaReader.getDirectiveMetadata(new Reference(component));
    if (directiveMeta === null) {
      return null;
    }
    const withScope = this.scopeDataOfDirectiveMeta(typeChecker, directiveMeta);
    if (withScope === null) {
      return null;
    }
    return {
      ...withScope,
      isInScope,
      /**
       * The Angular LS only supports displaying one directive at a time when
       * providing the completion item, even if it's exported by multiple modules.
       */
      tsCompletionEntryInfos: tsCompletionEntryInfo !== null ? [tsCompletionEntryInfo] : null,
    };
  }
  getElementsInFileScope(component) {
    const tagMap = new Map();
    const potentialDirectives = this.getTemplateDirectiveInScope(component);
    for (const directive of potentialDirectives) {
      if (directive.selector === null) {
        continue;
      }
      for (const selector of CssSelector.parse(directive.selector)) {
        if (selector.element === null || tagMap.has(selector.element)) {
          // Skip this directive if it doesn't match an element tag, or if another directive has
          // already been included with the same element name.
          continue;
        }
        tagMap.set(selector.element, directive);
      }
    }
    return tagMap;
  }
  getElementsInGlobal(component, tsLs, options) {
    // Add the additional directives from the global registry, which are not in scope and in different file with the current
    // component file.
    //
    // This means the inputs and the import statement in the decorator are needed to be updated.
    const tsContext = this.getGlobalTsContext(component);
    if (tsContext === null) {
      return [];
    }
    if (!options.includeExternalModule) {
      return [];
    }
    const entries = tsLs.getCompletionsAtPosition(tsContext.tcbPath, tsContext.positionInFile, {
      includeSymbol: true,
      includeCompletionsForModuleExports: true,
    })?.entries;
    const typeChecker = this.programDriver.getProgram().getTypeChecker();
    const resultingDirectives = new Map();
    const currentComponentFileName = component.getSourceFile().fileName;
    for (const {symbol, data} of entries ?? []) {
      const symbolFileName = symbol?.declarations?.[0]?.getSourceFile().fileName;
      const symbolName = symbol?.name;
      if (symbolFileName === undefined || symbolName === undefined) {
        continue;
      }
      if (symbolFileName === currentComponentFileName) {
        continue;
      }
      const decl = getClassDeclFromSymbol(symbol, typeChecker);
      if (decl === null) {
        continue;
      }
      const directiveDecls = [];
      const ref = new Reference(decl);
      const directiveMeta = this.metaReader.getDirectiveMetadata(ref);
      if (directiveMeta?.isStandalone) {
        directiveDecls.push({
          meta: directiveMeta,
          ref,
        });
      } else {
        const directiveDeclsForNgModule = this.getDirectiveDeclsForNgModule(ref);
        directiveDecls.push(...directiveDeclsForNgModule);
      }
      for (const directiveDecl of directiveDecls) {
        const cachedCompletionEntryInfos =
          resultingDirectives.get(directiveDecl.ref.node)?.tsCompletionEntryInfos ?? [];
        appendOrReplaceTsEntryInfo(
          cachedCompletionEntryInfos,
          {
            tsCompletionEntryData: data,
            tsCompletionEntrySymbolFileName: symbolFileName,
            tsCompletionEntrySymbolName: symbolName,
          },
          this.programDriver.getProgram(),
        );
        if (resultingDirectives.has(directiveDecl.ref.node)) {
          const directiveInfo = resultingDirectives.get(directiveDecl.ref.node);
          resultingDirectives.set(directiveDecl.ref.node, {
            ...directiveInfo,
            tsCompletionEntryInfos: cachedCompletionEntryInfos,
          });
          continue;
        }
        const withScope = this.scopeDataOfDirectiveMeta(typeChecker, directiveDecl.meta);
        if (withScope === null) {
          continue;
        }
        resultingDirectives.set(directiveDecl.ref.node, {
          ...withScope,
          isInScope: false,
          tsCompletionEntryInfos: cachedCompletionEntryInfos,
        });
      }
    }
    return Array.from(resultingDirectives.values());
  }
  /**
   * If the NgModule exports a new module, we need to recursively get its directives.
   */
  getDirectiveDeclsForNgModule(ref) {
    const ngModuleMeta = this.metaReader.getNgModuleMetadata(ref);
    if (ngModuleMeta === null) {
      return [];
    }
    const directiveDecls = [];
    for (const moduleExports of ngModuleMeta.exports) {
      const directiveMeta = this.metaReader.getDirectiveMetadata(moduleExports);
      if (directiveMeta !== null) {
        directiveDecls.push({
          meta: directiveMeta,
          ref: moduleExports,
        });
      } else {
        const ngModuleMeta = this.metaReader.getNgModuleMetadata(moduleExports);
        if (ngModuleMeta === null) {
          continue;
        }
        // If the export is an NgModule, we need to recursively get its directives.
        const nestedDirectiveDecls = this.getDirectiveDeclsForNgModule(moduleExports);
        directiveDecls.push(...nestedDirectiveDecls);
      }
    }
    return directiveDecls;
  }
  getPotentialElementTags(component, tsLs, options) {
    if (this.elementTagCache.has(component)) {
      return this.elementTagCache.get(component);
    }
    const tagMap = new Map();
    for (const tag of REGISTRY.allKnownElementNames()) {
      tagMap.set(tag, null);
    }
    const potentialDirectives = this.getPotentialTemplateDirectives(component, tsLs, options);
    for (const directive of potentialDirectives) {
      if (directive.selector === null) {
        continue;
      }
      for (const selector of CssSelector.parse(directive.selector)) {
        if (selector.element === null || tagMap.has(selector.element)) {
          // Skip this directive if it doesn't match an element tag, or if another directive has
          // already been included with the same element name.
          continue;
        }
        tagMap.set(selector.element, directive);
      }
    }
    this.elementTagCache.set(component, tagMap);
    return tagMap;
  }
  getPotentialDomBindings(tagName) {
    const attributes = REGISTRY.allKnownAttributesOfElement(tagName);
    return attributes.map((attribute) => ({
      attribute,
      property: REGISTRY.getMappedPropName(attribute),
    }));
  }
  getPotentialDomEvents(tagName) {
    return REGISTRY.allKnownEventsOfElement(tagName);
  }
  getPrimaryAngularDecorator(target) {
    this.ensureAllShimsForOneFile(target.getSourceFile());
    if (!isNamedClassDeclaration(target)) {
      return null;
    }
    const ref = new Reference(target);
    const dirMeta = this.metaReader.getDirectiveMetadata(ref);
    if (dirMeta !== null) {
      return dirMeta.decorator;
    }
    const pipeMeta = this.metaReader.getPipeMetadata(ref);
    if (pipeMeta !== null) {
      return pipeMeta.decorator;
    }
    const ngModuleMeta = this.metaReader.getNgModuleMetadata(ref);
    if (ngModuleMeta !== null) {
      return ngModuleMeta.decorator;
    }
    return null;
  }
  getOwningNgModule(component) {
    if (!isNamedClassDeclaration(component)) {
      return null;
    }
    const dirMeta = this.metaReader.getDirectiveMetadata(new Reference(component));
    if (dirMeta !== null && dirMeta.isStandalone) {
      return null;
    }
    const scope = this.componentScopeReader.getScopeForComponent(component);
    if (
      scope === null ||
      scope.kind !== ComponentScopeKind.NgModule ||
      !isNamedClassDeclaration(scope.ngModule)
    ) {
      return null;
    }
    return scope.ngModule;
  }
  emit(kind, refTo, inContext) {
    const emittedRef = this.refEmitter.emit(refTo, inContext.getSourceFile());
    if (emittedRef.kind === ReferenceEmitKind.Failed) {
      return null;
    }
    const emitted = emittedRef.expression;
    if (emitted instanceof WrappedNodeExpr) {
      if (refTo.node === inContext) {
        // Suppress self-imports since components do not have to import themselves.
        return null;
      }
      let isForwardReference = false;
      if (emitted.node.getStart() > inContext.getStart()) {
        const declaration = this.programDriver
          .getProgram()
          .getTypeChecker()
          .getTypeAtLocation(emitted.node)
          .getSymbol()?.declarations?.[0];
        if (declaration && declaration.getSourceFile() === inContext.getSourceFile()) {
          isForwardReference = true;
        }
      }
      // An appropriate identifier is already in scope.
      return {kind, symbolName: emitted.node.text, isForwardReference};
    } else if (
      emitted instanceof ExternalExpr &&
      emitted.value.moduleName !== null &&
      emitted.value.name !== null
    ) {
      return {
        kind,
        moduleSpecifier: emitted.value.moduleName,
        symbolName: emitted.value.name,
        isForwardReference: false,
      };
    }
    return null;
  }
  getPotentialImportsFor(
    toImport,
    inContext,
    importMode,
    potentialDirectiveModuleSpecifierResolver,
  ) {
    const imports = [];
    const meta =
      this.metaReader.getDirectiveMetadata(toImport) ?? this.metaReader.getPipeMetadata(toImport);
    if (meta === null) {
      return imports;
    }
    /**
     * When providing completion items, the Angular Language Service only supports displaying
     * one directive at a time. If a directive is exported by two different modules,
     * the Language Service will select the first module. To ensure the most appropriate directive
     * is shown, move the likely one to the top of the import list.
     *
     * When providing the code action for the directive. All the imports will show for the developer to choose.
     */
    let highestImportPriority = -1;
    const collectImports = (emit, moduleSpecifierDetail) => {
      if (emit === null) {
        return;
      }
      imports.push({
        ...emit,
        moduleSpecifier: moduleSpecifierDetail?.moduleSpecifier ?? emit.moduleSpecifier,
        symbolName: moduleSpecifierDetail?.exportName ?? emit.symbolName,
      });
      if (moduleSpecifierDetail !== null && highestImportPriority === -1) {
        highestImportPriority = imports.length - 1;
      }
    };
    if (meta.isStandalone || importMode === PotentialImportMode.ForceDirect) {
      const emitted = this.emit(PotentialImportKind.Standalone, toImport, inContext);
      const moduleSpecifierDetail =
        potentialDirectiveModuleSpecifierResolver?.resolve(toImport, inContext) ?? null;
      collectImports(emitted, moduleSpecifierDetail);
    }
    const exportingNgModules = this.ngModuleIndex.getNgModulesExporting(meta.ref.node);
    if (exportingNgModules !== null) {
      for (const exporter of exportingNgModules) {
        const emittedRef = this.emit(PotentialImportKind.NgModule, exporter, inContext);
        const moduleSpecifierDetail =
          potentialDirectiveModuleSpecifierResolver?.resolve(exporter, inContext) ?? null;
        collectImports(emittedRef, moduleSpecifierDetail);
      }
    }
    // move the import with module specifier from the tsLs to top in the imports array
    if (highestImportPriority > 0) {
      const highImport = imports.splice(highestImportPriority, 1)[0];
      imports.unshift(highImport);
    }
    return imports;
  }
  getComponentScope(component) {
    if (!isNamedClassDeclaration(component)) {
      throw new Error(`AssertionError: components must have names`);
    }
    return this.componentScopeReader.getScopeForComponent(component);
  }
  getScopeData(component, scope) {
    if (this.scopeCache.has(component)) {
      return this.scopeCache.get(component);
    }
    const dependencies =
      scope.kind === ComponentScopeKind.NgModule
        ? scope.compilation.dependencies
        : scope.dependencies;
    const data = {
      directives: [],
      pipes: [],
      isPoisoned:
        scope.kind === ComponentScopeKind.NgModule
          ? scope.compilation.isPoisoned
          : scope.isPoisoned,
    };
    const typeChecker = this.programDriver.getProgram().getTypeChecker();
    for (const dep of dependencies) {
      if (dep.kind === MetaKind.Directive) {
        const dirScope = this.scopeDataOfDirectiveMeta(typeChecker, dep);
        if (dirScope === null) continue;
        data.directives.push({...dirScope, isInScope: true});
      } else if (dep.kind === MetaKind.Pipe) {
        const pipeScope = this.scopeDataOfPipeMeta(typeChecker, dep);
        if (pipeScope === null) continue;
        data.pipes.push({...pipeScope, isInScope: true});
      }
    }
    this.scopeCache.set(component, data);
    return data;
  }
  scopeDataOfDirectiveMeta(typeChecker, dep) {
    if (dep.selector === null) {
      // Skip this directive, it can't be added to a template anyway.
      return null;
    }
    const tsSymbol = typeChecker.getSymbolAtLocation(dep.ref.node.name);
    if (!isSymbolWithValueDeclaration(tsSymbol)) {
      return null;
    }
    let ngModule = null;
    const moduleScopeOfDir = this.componentScopeReader.getScopeForComponent(dep.ref.node);
    if (moduleScopeOfDir !== null && moduleScopeOfDir.kind === ComponentScopeKind.NgModule) {
      ngModule = moduleScopeOfDir.ngModule;
    }
    return {
      ref: dep.ref,
      isComponent: dep.isComponent,
      isStructural: dep.isStructural,
      selector: dep.selector,
      tsSymbol,
      ngModule,
      tsCompletionEntryInfos: null,
    };
  }
  scopeDataOfPipeMeta(typeChecker, dep) {
    const tsSymbol = typeChecker.getSymbolAtLocation(dep.ref.node.name);
    if (tsSymbol === undefined) {
      return null;
    }
    return {
      ref: dep.ref,
      name: dep.name,
      tsSymbol,
      tsCompletionEntryInfos: null,
    };
  }
}
function convertDiagnostic(diag, sourceResolver) {
  if (!shouldReportDiagnostic(diag)) {
    return null;
  }
  return translateDiagnostic(diag, sourceResolver);
}
/**
 * Drives a `TypeCheckContext` to generate type-checking code for every component in the program.
 */
class WholeProgramTypeCheckingHost {
  impl;
  constructor(impl) {
    this.impl = impl;
  }
  getSourceManager(sfPath) {
    return this.impl.getFileData(sfPath).sourceManager;
  }
  shouldCheckClass(node) {
    const sfPath = absoluteFromSourceFile(node.getSourceFile());
    const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
    const fileData = this.impl.getFileData(sfPath);
    // The component needs to be checked unless the shim which would contain it already exists.
    return !fileData.shimData.has(shimPath);
  }
  recordShimData(sfPath, data) {
    const fileData = this.impl.getFileData(sfPath);
    fileData.shimData.set(data.path, data);
    if (data.hasInlines) {
      fileData.hasInlines = true;
    }
  }
  recordComplete(sfPath) {
    this.impl.getFileData(sfPath).isComplete = true;
  }
}
/**
 * Drives a `TypeCheckContext` to generate type-checking code efficiently for a single input file.
 */
class SingleFileTypeCheckingHost {
  sfPath;
  fileData;
  impl;
  seenInlines = false;
  constructor(sfPath, fileData, impl) {
    this.sfPath = sfPath;
    this.fileData = fileData;
    this.impl = impl;
  }
  assertPath(sfPath) {
    if (this.sfPath !== sfPath) {
      throw new Error(`AssertionError: querying TypeCheckingHost outside of assigned file`);
    }
  }
  getSourceManager(sfPath) {
    this.assertPath(sfPath);
    return this.fileData.sourceManager;
  }
  shouldCheckClass(node) {
    if (this.sfPath !== absoluteFromSourceFile(node.getSourceFile())) {
      return false;
    }
    const shimPath = TypeCheckShimGenerator.shimFor(this.sfPath);
    // Only need to generate a TCB for the class if no shim exists for it currently.
    return !this.fileData.shimData.has(shimPath);
  }
  recordShimData(sfPath, data) {
    this.assertPath(sfPath);
    // Previous type-checking state may have required the use of inlines (assuming they were
    // supported). If the current operation also requires inlines, this presents a problem:
    // generating new inlines may invalidate any old inlines that old state depends on.
    //
    // Rather than resolve this issue by tracking specific dependencies on inlines, if the new state
    // relies on inlines, any old state that relied on them is simply cleared. This happens when the
    // first new state that uses inlines is encountered.
    if (data.hasInlines && !this.seenInlines) {
      this.impl.clearAllShimDataUsingInlines();
      this.seenInlines = true;
    }
    this.fileData.shimData.set(data.path, data);
    if (data.hasInlines) {
      this.fileData.hasInlines = true;
    }
  }
  recordComplete(sfPath) {
    this.assertPath(sfPath);
    this.fileData.isComplete = true;
  }
}
/**
 * Drives a `TypeCheckContext` to generate type-checking code efficiently for only those components
 * which map to a single shim of a single input file.
 */
class SingleShimTypeCheckingHost extends SingleFileTypeCheckingHost {
  shimPath;
  constructor(sfPath, fileData, impl, shimPath) {
    super(sfPath, fileData, impl);
    this.shimPath = shimPath;
  }
  shouldCheckNode(node) {
    if (this.sfPath !== absoluteFromSourceFile(node.getSourceFile())) {
      return false;
    }
    // Only generate a TCB for the component if it maps to the requested shim file.
    const shimPath = TypeCheckShimGenerator.shimFor(this.sfPath);
    if (shimPath !== this.shimPath) {
      return false;
    }
    // Only need to generate a TCB for the class if no shim exists for it currently.
    return !this.fileData.shimData.has(shimPath);
  }
}
function getClassDeclFromSymbol(symbol, checker) {
  const tsDecl = symbol?.getDeclarations();
  if (tsDecl === undefined) {
    return null;
  }
  let decl = tsDecl.length > 0 ? tsDecl[0] : undefined;
  if (decl === undefined) {
    return null;
  }
  if (ts.isExportAssignment(decl)) {
    const symbol = checker.getTypeAtLocation(decl.expression).getSymbol();
    return getClassDeclFromSymbol(symbol, checker);
  }
  if (ts.isExportSpecifier(decl)) {
    const symbol = checker.getTypeAtLocation(decl).getSymbol();
    return getClassDeclFromSymbol(symbol, checker);
  }
  if (isNamedClassDeclaration(decl)) {
    return decl;
  }
  return null;
}
/**
 * Returns the diagnostics that report deprecated symbols in the given TypeScript language service.
 *
 * There are two logins here:
 *
 * 1. For input properties, function calls, and so on, the diagnostics reported in the TypeScript
 *    Language Service can be directly transformed into template diagnostics.
 * 2. For the element tag deprecation, we need to manually connect the TCB node to the template node
 *    and generate the template diagnostics.
 */
function getDeprecatedSuggestionDiagnostics(tsLs, program, path, fileRecord, templateTypeChecker) {
  const sourceFile = program.getSourceFile(path);
  if (sourceFile === undefined) {
    return [];
  }
  const tsDiags = tsLs.getSuggestionDiagnostics(path).filter(isDeprecatedDiagnostics);
  const commonTemplateDiags = tsDiags.map((diag) => {
    return convertDiagnostic(diag, fileRecord.sourceManager);
  });
  const elementTagDiags = getTheElementTagDeprecatedSuggestionDiagnostics(
    path,
    program,
    fileRecord,
    tsDiags,
    templateTypeChecker,
  );
  return [...commonTemplateDiags, ...elementTagDiags];
}
/**
 * Connect the TCB node to the template node and generate the template diagnostics.
 *
 * How to generate the template diagnostics:
 *
 * 1. For each diagnostic, find the TCB node that is reported.
 * 2. Build a map called `nodeToDiag` that the key is the type node and value is the diagnostic.
 *    For example:
 *    ```
 *    var _t1 = null! as TestDir;
 *                       ^^^^^^^------ This is diagnostic node that is reported by the ts.
 *    ```
 *    The key is the class component of TestDir.
 * 3. Find the all directive nodes in the TCB.
 *    For example:
 *    In the above example, the directive node is `_t1`, get the type of `_t1` which is the
 *    class component of `TestDir`. Check if there is a diagnostic in the `nodeToDiag` map
 *    that matches the class component of `TestDir`.
 *    If there is a match, it means that the diagnostic is reported for the directive node
 * 4. Generate the template diagnostic and return the template diagnostics.
 */
function getTheElementTagDeprecatedSuggestionDiagnostics(
  shimPath,
  program,
  fileRecord,
  diags,
  templateTypeChecker,
) {
  const sourceFile = program.getSourceFile(shimPath);
  if (sourceFile === undefined) {
    return [];
  }
  const typeChecker = program.getTypeChecker();
  const nodeToDiag = new Map();
  for (const tsDiag of diags) {
    const diagNode = getTokenAtPosition(sourceFile, tsDiag.start);
    const nodeType = typeChecker.getTypeAtLocation(diagNode);
    const nodeSymbolDeclarations = nodeType.getSymbol()?.declarations;
    const decl =
      nodeSymbolDeclarations !== undefined && nodeSymbolDeclarations.length > 0
        ? nodeSymbolDeclarations[0]
        : undefined;
    if (decl === undefined || !ts.isClassDeclaration(decl)) {
      continue;
    }
    const directiveForDiagnostic = templateTypeChecker.getDirectiveMetadata(decl);
    // For now, we only report deprecations for components. This is because
    // directive spans apply to the entire element, so it would cause the deprecation to
    // appear as a deprecation for the element rather than whatever the selector (likely an attribute)
    // is for the directive. Technically components have this issue as well but nearly
    // all component selectors are element selectors.
    if (directiveForDiagnostic === null || !directiveForDiagnostic.isComponent) {
      continue;
    }
    nodeToDiag.set(decl, tsDiag);
  }
  const directiveNodesInTcb = findAllMatchingNodes(sourceFile, {
    filter: isDirectiveDeclaration,
  });
  const templateDiagnostics = [];
  for (const directive of directiveNodesInTcb) {
    const directiveType = typeChecker.getTypeAtLocation(directive);
    const directiveSymbolDeclarations = directiveType.getSymbol()?.declarations;
    const decl =
      directiveSymbolDeclarations !== undefined && directiveSymbolDeclarations.length > 0
        ? directiveSymbolDeclarations[0]
        : undefined;
    if (decl === undefined) {
      continue;
    }
    if (!ts.isClassDeclaration(decl)) {
      continue;
    }
    const diagnostic = nodeToDiag.get(decl);
    if (diagnostic === undefined) {
      continue;
    }
    const fullMapping = getSourceMapping(
      diagnostic.file,
      directive.getStart(),
      fileRecord.sourceManager,
      /**
       * Don't set to true, the deprecated diagnostics will be ignored if this is a diagnostics request.
       * Only the deprecated diagnostics will be reported here.
       */
      // For example:
      // var _t2 /*T:DIR*/ /*87,104*/ = _ctor1({ "name": ("") /*96,103*/ }) /*D:ignore*/;
      // At the end of the statement, there is a comment `/*D:ignore*/` which means that this diagnostic
      // should be ignored in diagnostics request.
      /*isDiagnosticsRequest*/ false,
    );
    if (fullMapping === null) {
      continue;
    }
    const {sourceLocation, sourceMapping: templateSourceMapping, span} = fullMapping;
    const templateDiagnostic = makeTemplateDiagnostic(
      sourceLocation.id,
      templateSourceMapping,
      span,
      diagnostic.category,
      diagnostic.code,
      diagnostic.messageText,
      undefined,
      diagnostic.reportsDeprecated !== undefined
        ? {
            reportsDeprecated: diagnostic.reportsDeprecated,
            relatedMessages: diagnostic.relatedInformation,
          }
        : undefined,
    );
    templateDiagnostics.push(templateDiagnostic);
  }
  return templateDiagnostics;
}
function isDeprecatedDiagnostics(diag) {
  return diag.reportsDeprecated !== undefined;
}
/**
 * Append the ts completion entry into the array only when the new entry's directive
 * doesn't exist in the array.
 *
 * If the new entry's directive already exists, and the entry's symbol is the alias of
 * the existing entry, the new entry will replace the existing entry.
 *
 */
function appendOrReplaceTsEntryInfo(tsEntryInfos, newTsEntryInfo, program) {
  const typeChecker = program.getTypeChecker();
  const newTsEntryInfoSymbol = getSymbolFromTsEntryInfo(newTsEntryInfo, program);
  if (newTsEntryInfoSymbol === null) {
    return;
  }
  // Find the index of the first entry that has a matching type.
  const matchedEntryIndex = tsEntryInfos.findIndex((currentTsEntryInfo) => {
    const currentTsEntrySymbol = getSymbolFromTsEntryInfo(currentTsEntryInfo, program);
    if (currentTsEntrySymbol === null) {
      return false;
    }
    return isSymbolTypeMatch(currentTsEntrySymbol, newTsEntryInfoSymbol, typeChecker);
  });
  if (matchedEntryIndex === -1) {
    // No entry with a matching type was found, so append the new entry.
    tsEntryInfos.push(newTsEntryInfo);
    return;
  }
  // An entry with a matching type was found at matchedEntryIndex.
  const matchedEntry = tsEntryInfos[matchedEntryIndex];
  const matchedEntrySymbol = getSymbolFromTsEntryInfo(matchedEntry, program);
  if (matchedEntrySymbol === null) {
    // Should not happen based on the findIndex condition, but check defensively.
    return;
  }
  // Check if the `matchedEntrySymbol` is an alias of the `newTsEntryInfoSymbol`.
  if (isSymbolAliasOf(matchedEntrySymbol, newTsEntryInfoSymbol, typeChecker)) {
    // The first type-matching entry is an alias, so replace it.
    tsEntryInfos[matchedEntryIndex] = newTsEntryInfo;
    return;
  }
  // The new entry's symbol is an alias of the existing entry's symbol.
  // In this case, we prefer to keep the existing entry that was found first
  // and do not replace it.
  return;
}
function getSymbolFromTsEntryInfo(tsInfo, program) {
  const typeChecker = program.getTypeChecker();
  const sf = program.getSourceFile(tsInfo.tsCompletionEntrySymbolFileName);
  if (sf === undefined) {
    return null;
  }
  const sfSymbol = typeChecker.getSymbolAtLocation(sf);
  if (sfSymbol === undefined) {
    return null;
  }
  return (
    typeChecker.tryGetMemberInModuleExports(tsInfo.tsCompletionEntrySymbolName, sfSymbol) ?? null
  );
}
function getFirstTypeDeclarationOfSymbol(symbol, typeChecker) {
  const type = typeChecker.getTypeOfSymbol(symbol);
  return type.getSymbol()?.declarations?.[0];
}
/**
 * Check if the two symbols come from the same type node. For example:
 *
 * The `NewBarComponent`'s type node is the `BarComponent`.
 *
 * ```
 * // a.ts
 * export class BarComponent
 *
 * // b.ts
 * import {BarComponent} from "./a"
 * const NewBarComponent = BarComponent;
 * export {NewBarComponent}
 * ```
 */
function isSymbolTypeMatch(first, last, typeChecker) {
  const firstTypeNode = getFirstTypeDeclarationOfSymbol(first, typeChecker);
  const lastTypeNode = getFirstTypeDeclarationOfSymbol(last, typeChecker);
  return firstTypeNode === lastTypeNode && firstTypeNode !== undefined;
}
//# sourceMappingURL=checker.js.map
