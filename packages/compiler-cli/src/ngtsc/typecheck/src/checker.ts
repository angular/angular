/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  CssSelector,
  DomElementSchemaRegistry,
  ExternalExpr,
  LiteralPrimitive,
  ParseSourceSpan,
  PropertyRead,
  SafePropertyRead,
  TemplateEntity,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstHostElement,
  TmplAstNode,
  TmplAstTemplate,
  TmplAstTextAttribute,
  WrappedNodeExpr,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {absoluteFromSourceFile, AbsoluteFsPath, getSourceFileOrError} from '../../file_system';
import {Reference, ReferenceEmitKind, ReferenceEmitter} from '../../imports';
import {IncrementalBuild} from '../../incremental/api';
import {
  DirectiveMeta,
  MetadataReader,
  MetadataReaderWithIndex,
  MetaKind,
  NgModuleIndex,
  NgModuleMeta,
  PipeMeta,
} from '../../metadata';
import {PerfCheckpoint, PerfEvent, PerfPhase, PerfRecorder} from '../../perf';
import {ProgramDriver, UpdateMode} from '../../program_driver';
import {
  ClassDeclaration,
  DeclarationNode,
  isNamedClassDeclaration,
  ReflectionHost,
} from '../../reflection';
import {
  ComponentScopeKind,
  ComponentScopeReader,
  StandaloneScope,
  TypeCheckScopeRegistry,
  LocalModuleScope,
  ComponentScope,
} from '../../scope';
import {isShim} from '../../shims';
import {getSourceFileOrNull, isSymbolWithValueDeclaration} from '../../util/src/typescript';
import {
  ElementSymbol,
  FullSourceMapping,
  GetPotentialAngularMetaOptions,
  GlobalCompletion,
  NgTemplateDiagnostic,
  OptimizeFor,
  PotentialDirective,
  PotentialDirectiveModuleSpecifierResolver,
  PotentialImport,
  PotentialImportKind,
  PotentialImportMode,
  PotentialPipe,
  ProgramTypeCheckAdapter,
  SelectorlessComponentSymbol,
  SelectorlessDirectiveSymbol,
  Symbol,
  TcbLocation,
  TemplateDiagnostic,
  TemplateSymbol,
  TemplateTypeChecker,
  TsCompletionEntryInfo,
  TypeCheckableDirectiveMeta,
  TypeCheckingConfig,
} from '../api';
import {makeTemplateDiagnostic} from '../diagnostics';

import {CompletionEngine} from './completion';
import {
  InliningMode,
  ShimTypeCheckingData,
  TypeCheckData,
  TypeCheckContextImpl,
  TypeCheckingHost,
} from './context';
import {shouldReportDiagnostic, translateDiagnostic} from './diagnostics';
import {TypeCheckShimGenerator} from './shim';
import {DirectiveSourceManager} from './source';
import {findTypeCheckBlock, getSourceMapping, TypeCheckSourceResolver} from './tcb_util';
import {SymbolBuilder} from './template_symbol_builder';

const REGISTRY = new DomElementSchemaRegistry();
/**
 * Primary template type-checking engine, which performs type-checking using a
 * `TypeCheckingProgramStrategy` for type-checking program maintenance, and the
 * `ProgramTypeCheckAdapter` for generation of template type-checking code.
 */
export class TemplateTypeCheckerImpl implements TemplateTypeChecker {
  private state = new Map<AbsoluteFsPath, FileTypeCheckingData>();

  /**
   * Stores the `CompletionEngine` which powers autocompletion for each component class.
   *
   * Must be invalidated whenever the component's template or the `ts.Program` changes. Invalidation
   * on template changes is performed within this `TemplateTypeCheckerImpl` instance. When the
   * `ts.Program` changes, the `TemplateTypeCheckerImpl` as a whole is destroyed and replaced.
   */
  private completionCache = new Map<ts.ClassDeclaration, CompletionEngine>();
  /**
   * Stores the `SymbolBuilder` which creates symbols for each component class.
   *
   * Must be invalidated whenever the component's template or the `ts.Program` changes. Invalidation
   * on template changes is performed within this `TemplateTypeCheckerImpl` instance. When the
   * `ts.Program` changes, the `TemplateTypeCheckerImpl` as a whole is destroyed and replaced.
   */
  private symbolBuilderCache = new Map<ts.ClassDeclaration, SymbolBuilder>();

  /**
   * Stores directives and pipes that are in scope for each component.
   *
   * Unlike other caches, the scope of a component is not affected by its template. It will be
   * destroyed when the `ts.Program` changes and the `TemplateTypeCheckerImpl` as a whole is
   * destroyed and replaced.
   */
  private scopeCache = new Map<ts.ClassDeclaration, ScopeData>();

  /**
   * Stores potential element tags for each component (a union of DOM tags as well as directive
   * tags).
   *
   * Unlike other caches, the scope of a component is not affected by its template. It will be
   * destroyed when the `ts.Program` changes and the `TemplateTypeCheckerImpl` as a whole is
   * destroyed and replaced.
   */
  private elementTagCache = new Map<ts.ClassDeclaration, Map<string, PotentialDirective | null>>();

  private isComplete = false;
  private priorResultsAdopted = false;

  constructor(
    private originalProgram: ts.Program,
    readonly programDriver: ProgramDriver,
    private typeCheckAdapter: ProgramTypeCheckAdapter,
    private config: TypeCheckingConfig,
    private refEmitter: ReferenceEmitter,
    private reflector: ReflectionHost,
    private compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
    private priorBuild: IncrementalBuild<unknown, FileTypeCheckingData>,
    private readonly metaReader: MetadataReader,
    private readonly localMetaReader: MetadataReaderWithIndex,
    private readonly ngModuleIndex: NgModuleIndex,
    private readonly componentScopeReader: ComponentScopeReader,
    private readonly typeCheckScopeRegistry: TypeCheckScopeRegistry,
    private readonly perf: PerfRecorder,
  ) {}

  getTemplate(component: ts.ClassDeclaration, optimizeFor?: OptimizeFor): TmplAstNode[] | null {
    const {data} = this.getLatestComponentState(component, optimizeFor);
    return data?.template ?? null;
  }

  getHostElement(
    directive: ts.ClassDeclaration,
    optimizeFor?: OptimizeFor,
  ): TmplAstHostElement | null {
    const {data} = this.getLatestComponentState(directive, optimizeFor);
    return data?.hostElement ?? null;
  }

  getUsedDirectives(component: ts.ClassDeclaration): TypeCheckableDirectiveMeta[] | null {
    return this.getLatestComponentState(component).data?.boundTarget.getUsedDirectives() ?? null;
  }

  getUsedPipes(component: ts.ClassDeclaration): string[] | null {
    return this.getLatestComponentState(component).data?.boundTarget.getUsedPipes() ?? null;
  }

  private getLatestComponentState(
    component: ts.ClassDeclaration,
    optimizeFor: OptimizeFor = OptimizeFor.SingleFile,
  ): {
    data: TypeCheckData | null;
    tcb: ts.Node | null;
    tcbPath: AbsoluteFsPath;
    tcbIsShim: boolean;
  } {
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
    const shimRecord = fileRecord.shimData.get(shimPath)!;

    const program = this.programDriver.getProgram();
    const shimSf = getSourceFileOrNull(program, shimPath);

    if (shimSf === null || !fileRecord.shimData.has(shimPath)) {
      throw new Error(`Error: no shim file in program: ${shimPath}`);
    }

    let tcb: ts.Node | null = findTypeCheckBlock(shimSf, id, /*isDiagnosticsRequest*/ false);

    let tcbPath = shimPath;
    if (tcb === null) {
      // Try for an inline block.
      const inlineSf = getSourceFileOrError(program, sfPath);
      tcb = findTypeCheckBlock(inlineSf, id, /*isDiagnosticsRequest*/ false);

      if (tcb !== null) {
        tcbPath = sfPath;
      }
    }

    let data: TypeCheckData | null = null;
    if (shimRecord.data.has(id)) {
      data = shimRecord.data.get(id)!;
    }

    return {data, tcb, tcbPath, tcbIsShim: tcbPath === shimPath};
  }

  isTrackedTypeCheckFile(filePath: AbsoluteFsPath): boolean {
    return this.getFileAndShimRecordsForPath(filePath) !== null;
  }

  private getFileRecordForTcbLocation({
    tcbPath,
    isShimFile,
  }: TcbLocation): FileTypeCheckingData | null {
    if (!isShimFile) {
      // The location is not within a shim file but corresponds with an inline TCB in an original
      // source file; we can obtain the record directly by its path.
      if (this.state.has(tcbPath)) {
        return this.state.get(tcbPath)!;
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

  private getFileAndShimRecordsForPath(
    shimPath: AbsoluteFsPath,
  ): {fileRecord: FileTypeCheckingData; shimRecord: ShimTypeCheckingData} | null {
    for (const fileRecord of this.state.values()) {
      if (fileRecord.shimData.has(shimPath)) {
        return {fileRecord, shimRecord: fileRecord.shimData.get(shimPath)!};
      }
    }
    return null;
  }

  getSourceMappingAtTcbLocation(tcbLocation: TcbLocation): FullSourceMapping | null {
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
  getDiagnosticsForFile(sf: ts.SourceFile, optimizeFor: OptimizeFor): ts.Diagnostic[] {
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
      const fileRecord = this.state.get(sfPath)!;

      const typeCheckProgram = this.programDriver.getProgram();

      const diagnostics: (ts.Diagnostic | null)[] = [];
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

      return diagnostics.filter(
        (diag: ts.Diagnostic | null): diag is ts.Diagnostic => diag !== null,
      );
    });
  }

  getDiagnosticsForComponent(component: ts.ClassDeclaration): ts.Diagnostic[] {
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
      const shimRecord = fileRecord.shimData.get(shimPath)!;

      const typeCheckProgram = this.programDriver.getProgram();

      const diagnostics: (TemplateDiagnostic | null)[] = [];
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

      return diagnostics.filter(
        (diag: TemplateDiagnostic | null): diag is TemplateDiagnostic =>
          diag !== null && diag.typeCheckId === id,
      );
    });
  }

  getTypeCheckBlock(component: ts.ClassDeclaration): ts.Node | null {
    return this.getLatestComponentState(component).tcb;
  }

  getGlobalCompletions(
    context: TmplAstTemplate | null,
    component: ts.ClassDeclaration,
    node: AST | TmplAstNode,
  ): GlobalCompletion | null {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcAutocompletion, () =>
      engine.getGlobalCompletions(context, node),
    );
  }

  getExpressionCompletionLocation(
    ast: PropertyRead | SafePropertyRead,
    component: ts.ClassDeclaration,
  ): TcbLocation | null {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcAutocompletion, () =>
      engine.getExpressionCompletionLocation(ast),
    );
  }

  getLiteralCompletionLocation(
    node: LiteralPrimitive | TmplAstTextAttribute,
    component: ts.ClassDeclaration,
  ): TcbLocation | null {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcAutocompletion, () =>
      engine.getLiteralCompletionLocation(node),
    );
  }

  invalidateClass(clazz: ts.ClassDeclaration): void {
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

  getExpressionTarget(expression: AST, clazz: ts.ClassDeclaration): TemplateEntity | null {
    return (
      this.getLatestComponentState(clazz).data?.boundTarget.getExpressionTarget(expression) ?? null
    );
  }

  makeTemplateDiagnostic<T extends ErrorCode>(
    clazz: ts.ClassDeclaration,
    sourceSpan: ParseSourceSpan,
    category: ts.DiagnosticCategory,
    errorCode: T,
    message: string,
    relatedInformation?: {
      text: string;
      start: number;
      end: number;
      sourceFile: ts.SourceFile;
    }[],
  ): NgTemplateDiagnostic<T> {
    const sfPath = absoluteFromSourceFile(clazz.getSourceFile());
    const fileRecord = this.state.get(sfPath)!;
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

  private getOrCreateCompletionEngine(component: ts.ClassDeclaration): CompletionEngine | null {
    if (this.completionCache.has(component)) {
      return this.completionCache.get(component)!;
    }

    const {tcb, data, tcbPath, tcbIsShim} = this.getLatestComponentState(component);
    if (tcb === null || data === null) {
      return null;
    }

    const engine = new CompletionEngine(tcb, data, tcbPath, tcbIsShim);
    this.completionCache.set(component, engine);
    return engine;
  }

  private maybeAdoptPriorResults() {
    if (this.priorResultsAdopted) {
      return;
    }

    for (const sf of this.originalProgram.getSourceFiles()) {
      if (sf.isDeclarationFile || isShim(sf)) {
        continue;
      }

      const sfPath = absoluteFromSourceFile(sf);
      if (this.state.has(sfPath)) {
        const existingResults = this.state.get(sfPath)!;

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

  private ensureAllShimsForAllFiles(): void {
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

  private ensureAllShimsForOneFile(sf: ts.SourceFile): void {
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

  private ensureShimForComponent(component: ts.ClassDeclaration): void {
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

  private newContext(host: TypeCheckingHost): TypeCheckContextImpl {
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
  clearAllShimDataUsingInlines(): void {
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

  private updateFromContext(ctx: TypeCheckContextImpl): void {
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

  getFileData(path: AbsoluteFsPath): FileTypeCheckingData {
    if (!this.state.has(path)) {
      this.state.set(path, {
        hasInlines: false,
        sourceManager: new DirectiveSourceManager(),
        isComplete: false,
        shimData: new Map(),
      });
    }
    return this.state.get(path)!;
  }
  getSymbolOfNode(node: TmplAstTemplate, component: ts.ClassDeclaration): TemplateSymbol | null;
  getSymbolOfNode(node: TmplAstElement, component: ts.ClassDeclaration): ElementSymbol | null;
  getSymbolOfNode(
    node: TmplAstComponent,
    component: ts.ClassDeclaration,
  ): SelectorlessComponentSymbol | null;
  getSymbolOfNode(
    node: TmplAstDirective,
    component: ts.ClassDeclaration,
  ): SelectorlessDirectiveSymbol | null;
  getSymbolOfNode(node: AST | TmplAstNode, component: ts.ClassDeclaration): Symbol | null {
    const builder = this.getOrCreateSymbolBuilder(component);
    if (builder === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcSymbol, () => builder.getSymbol(node));
  }

  private getOrCreateSymbolBuilder(component: ts.ClassDeclaration): SymbolBuilder | null {
    if (this.symbolBuilderCache.has(component)) {
      return this.symbolBuilderCache.get(component)!;
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

  getGlobalTsContext(component: ts.ClassDeclaration): TcbLocation | null {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return engine.getGlobalTsContext();
  }

  getPotentialTemplateDirectives(
    component: ts.ClassDeclaration,
    tsLs: ts.LanguageService,
    options: GetPotentialAngularMetaOptions,
  ): PotentialDirective[] {
    const scope = this.getComponentScope(component);

    // Don't resolve directives for selectorless components since they're already in the file.
    if (scope?.kind === ComponentScopeKind.Selectorless) {
      return [];
    }

    const resultingDirectives = new Map<ClassDeclaration<DeclarationNode>, PotentialDirective>();
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

  getPotentialPipes(component: ts.ClassDeclaration): PotentialPipe[] {
    const scope = this.getComponentScope(component);

    // Don't resolve pipes for selectorless components since they're already in the file.
    if (scope?.kind === ComponentScopeKind.Selectorless) {
      return [];
    }

    // Very similar to the above `getPotentialTemplateDirectives`, but on pipes.
    const typeChecker = this.programDriver.getProgram().getTypeChecker();
    const resultingPipes = new Map<ClassDeclaration<DeclarationNode>, PotentialPipe>();
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

  getDirectiveMetadata(dir: ts.ClassDeclaration): TypeCheckableDirectiveMeta | null {
    if (!isNamedClassDeclaration(dir)) {
      return null;
    }
    return this.typeCheckScopeRegistry.getTypeCheckDirectiveMetadata(new Reference(dir));
  }

  getNgModuleMetadata(module: ts.ClassDeclaration): NgModuleMeta | null {
    if (!isNamedClassDeclaration(module)) {
      return null;
    }
    return this.metaReader.getNgModuleMetadata(new Reference(module));
  }

  getPipeMetadata(pipe: ts.ClassDeclaration): PipeMeta | null {
    if (!isNamedClassDeclaration(pipe)) {
      return null;
    }
    return this.metaReader.getPipeMetadata(new Reference(pipe));
  }

  getTemplateDirectiveInScope(component: ts.ClassDeclaration): PotentialDirective[] {
    const resultingDirectives = new Map<ClassDeclaration<DeclarationNode>, PotentialDirective>();

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

  getDirectiveScopeData(
    component: ts.ClassDeclaration,
    isInScope: boolean,
    tsCompletionEntryInfo: TsCompletionEntryInfo | null,
  ): PotentialDirective | null {
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

  getElementsInFileScope(component: ts.ClassDeclaration): Map<string, PotentialDirective | null> {
    const tagMap = new Map<string, PotentialDirective | null>();

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

  getElementsInGlobal(
    component: ts.ClassDeclaration,
    tsLs: ts.LanguageService,
    options: GetPotentialAngularMetaOptions,
  ): PotentialDirective[] {
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
    const resultingDirectives = new Map<ClassDeclaration<DeclarationNode>, PotentialDirective>();
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

      const directiveDecls: {
        meta: DirectiveMeta;
        ref: Reference<ClassDeclaration>;
      }[] = [];

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

        cachedCompletionEntryInfos.push({
          tsCompletionEntryData: data,
          tsCompletionEntrySymbolFileName: symbolFileName,
          tsCompletionEntrySymbolName: symbolName,
        });

        if (resultingDirectives.has(directiveDecl.ref.node)) {
          const directiveInfo = resultingDirectives.get(directiveDecl.ref.node)!;
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
  private getDirectiveDeclsForNgModule(ref: Reference<ClassDeclaration>): {
    meta: DirectiveMeta;
    ref: Reference<ClassDeclaration>;
  }[] {
    const ngModuleMeta = this.metaReader.getNgModuleMetadata(ref);
    if (ngModuleMeta === null) {
      return [];
    }
    const directiveDecls: {
      meta: DirectiveMeta;
      ref: Reference<ClassDeclaration>;
    }[] = [];

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

  getPotentialElementTags(
    component: ts.ClassDeclaration,
    tsLs: ts.LanguageService,
    options: GetPotentialAngularMetaOptions,
  ): Map<string, PotentialDirective | null> {
    if (this.elementTagCache.has(component)) {
      return this.elementTagCache.get(component)!;
    }

    const tagMap = new Map<string, PotentialDirective | null>();

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

  getPotentialDomBindings(tagName: string): {attribute: string; property: string}[] {
    const attributes = REGISTRY.allKnownAttributesOfElement(tagName);
    return attributes.map((attribute) => ({
      attribute,
      property: REGISTRY.getMappedPropName(attribute),
    }));
  }

  getPotentialDomEvents(tagName: string): string[] {
    return REGISTRY.allKnownEventsOfElement(tagName);
  }

  getPrimaryAngularDecorator(target: ts.ClassDeclaration): ts.Decorator | null {
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

  getOwningNgModule(component: ts.ClassDeclaration): ts.ClassDeclaration | null {
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

  private emit(
    kind: PotentialImportKind,
    refTo: Reference<ClassDeclaration>,
    inContext: ts.Node,
  ): PotentialImport | null {
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
    toImport: Reference<ClassDeclaration>,
    inContext: ts.Node,
    importMode: PotentialImportMode,
    potentialDirectiveModuleSpecifierResolver?: PotentialDirectiveModuleSpecifierResolver,
  ): ReadonlyArray<PotentialImport> {
    const imports: PotentialImport[] = [];

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

    const collectImports = (emit: PotentialImport | null, moduleSpecifier: string | undefined) => {
      if (emit === null) {
        return;
      }
      imports.push({
        ...emit,
        moduleSpecifier: moduleSpecifier ?? emit.moduleSpecifier,
      });
      if (moduleSpecifier !== undefined && highestImportPriority === -1) {
        highestImportPriority = imports.length - 1;
      }
    };

    if (meta.isStandalone || importMode === PotentialImportMode.ForceDirect) {
      const emitted = this.emit(PotentialImportKind.Standalone, toImport, inContext);
      const moduleSpecifier = potentialDirectiveModuleSpecifierResolver?.resolve(
        toImport,
        inContext,
      );
      collectImports(emitted, moduleSpecifier);
    }

    const exportingNgModules = this.ngModuleIndex.getNgModulesExporting(meta.ref.node);
    if (exportingNgModules !== null) {
      for (const exporter of exportingNgModules) {
        const emittedRef = this.emit(PotentialImportKind.NgModule, exporter, inContext);
        const moduleSpecifier = potentialDirectiveModuleSpecifierResolver?.resolve(
          exporter,
          inContext,
        );
        collectImports(emittedRef, moduleSpecifier);
      }
    }

    // move the import with module specifier from the tsLs to top in the imports array
    if (highestImportPriority > 0) {
      const highImport = imports.splice(highestImportPriority, 1)[0];
      imports.unshift(highImport);
    }

    return imports;
  }

  private getComponentScope(component: ts.ClassDeclaration): ComponentScope | null {
    if (!isNamedClassDeclaration(component)) {
      throw new Error(`AssertionError: components must have names`);
    }
    return this.componentScopeReader.getScopeForComponent(component);
  }

  private getScopeData(
    component: ts.ClassDeclaration,
    scope: LocalModuleScope | StandaloneScope,
  ): ScopeData | null {
    if (this.scopeCache.has(component)) {
      return this.scopeCache.get(component)!;
    }

    const dependencies =
      scope.kind === ComponentScopeKind.NgModule
        ? scope.compilation.dependencies
        : scope.dependencies;

    const data: ScopeData = {
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

  private scopeDataOfDirectiveMeta(
    typeChecker: ts.TypeChecker,
    dep: DirectiveMeta,
  ): Omit<PotentialDirective, 'isInScope'> | null {
    if (dep.selector === null) {
      // Skip this directive, it can't be added to a template anyway.
      return null;
    }
    const tsSymbol = typeChecker.getSymbolAtLocation(dep.ref.node.name);
    if (!isSymbolWithValueDeclaration(tsSymbol)) {
      return null;
    }

    let ngModule: ClassDeclaration | null = null;
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

  private scopeDataOfPipeMeta(
    typeChecker: ts.TypeChecker,
    dep: PipeMeta,
  ): Omit<PotentialPipe, 'isInScope'> | null {
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

function convertDiagnostic(
  diag: ts.Diagnostic,
  sourceResolver: TypeCheckSourceResolver,
): TemplateDiagnostic | null {
  if (!shouldReportDiagnostic(diag)) {
    return null;
  }
  return translateDiagnostic(diag, sourceResolver);
}

/**
 * Data for template type-checking related to a specific input file in the user's program (which
 * contains components to be checked).
 */
export interface FileTypeCheckingData {
  /**
   * Whether the type-checking shim required any inline changes to the original file, which affects
   * whether the shim can be reused.
   */
  hasInlines: boolean;

  /**
   * Information for mapping diagnostics from inlined type check blocks
   * back to their original sources.
   */
  sourceManager: DirectiveSourceManager;

  /**
   * Data for each shim generated from this input file.
   *
   * A single input file will generate one or more shim files that actually contain template
   * type-checking code.
   */
  shimData: Map<AbsoluteFsPath, ShimTypeCheckingData>;

  /**
   * Whether the template type-checker is certain that all components from this input file have had
   * type-checking code generated into shims.
   */
  isComplete: boolean;
}

/**
 * Drives a `TypeCheckContext` to generate type-checking code for every component in the program.
 */
class WholeProgramTypeCheckingHost implements TypeCheckingHost {
  constructor(private impl: TemplateTypeCheckerImpl) {}

  getSourceManager(sfPath: AbsoluteFsPath): DirectiveSourceManager {
    return this.impl.getFileData(sfPath).sourceManager;
  }

  shouldCheckClass(node: ts.ClassDeclaration): boolean {
    const sfPath = absoluteFromSourceFile(node.getSourceFile());
    const shimPath = TypeCheckShimGenerator.shimFor(sfPath);
    const fileData = this.impl.getFileData(sfPath);
    // The component needs to be checked unless the shim which would contain it already exists.
    return !fileData.shimData.has(shimPath);
  }

  recordShimData(sfPath: AbsoluteFsPath, data: ShimTypeCheckingData): void {
    const fileData = this.impl.getFileData(sfPath);
    fileData.shimData.set(data.path, data);
    if (data.hasInlines) {
      fileData.hasInlines = true;
    }
  }

  recordComplete(sfPath: AbsoluteFsPath): void {
    this.impl.getFileData(sfPath).isComplete = true;
  }
}

/**
 * Drives a `TypeCheckContext` to generate type-checking code efficiently for a single input file.
 */
class SingleFileTypeCheckingHost implements TypeCheckingHost {
  private seenInlines = false;

  constructor(
    protected sfPath: AbsoluteFsPath,
    protected fileData: FileTypeCheckingData,
    protected impl: TemplateTypeCheckerImpl,
  ) {}

  private assertPath(sfPath: AbsoluteFsPath): void {
    if (this.sfPath !== sfPath) {
      throw new Error(`AssertionError: querying TypeCheckingHost outside of assigned file`);
    }
  }

  getSourceManager(sfPath: AbsoluteFsPath): DirectiveSourceManager {
    this.assertPath(sfPath);
    return this.fileData.sourceManager;
  }

  shouldCheckClass(node: ts.ClassDeclaration): boolean {
    if (this.sfPath !== absoluteFromSourceFile(node.getSourceFile())) {
      return false;
    }
    const shimPath = TypeCheckShimGenerator.shimFor(this.sfPath);

    // Only need to generate a TCB for the class if no shim exists for it currently.
    return !this.fileData.shimData.has(shimPath);
  }

  recordShimData(sfPath: AbsoluteFsPath, data: ShimTypeCheckingData): void {
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

  recordComplete(sfPath: AbsoluteFsPath): void {
    this.assertPath(sfPath);
    this.fileData.isComplete = true;
  }
}

/**
 * Drives a `TypeCheckContext` to generate type-checking code efficiently for only those components
 * which map to a single shim of a single input file.
 */
class SingleShimTypeCheckingHost extends SingleFileTypeCheckingHost {
  constructor(
    sfPath: AbsoluteFsPath,
    fileData: FileTypeCheckingData,
    impl: TemplateTypeCheckerImpl,
    private shimPath: AbsoluteFsPath,
  ) {
    super(sfPath, fileData, impl);
  }

  shouldCheckNode(node: ts.ClassDeclaration): boolean {
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

/**
 * Cached scope information for a component.
 */
interface ScopeData {
  directives: PotentialDirective[];
  pipes: PotentialPipe[];
  isPoisoned: boolean;
}

function getClassDeclFromSymbol(
  symbol: ts.Symbol | undefined,
  checker: ts.TypeChecker,
): ClassDeclaration | null {
  const tsDecl = symbol?.getDeclarations();
  if (tsDecl === undefined) {
    return null;
  }
  let decl = tsDecl.length > 0 ? tsDecl[0] : undefined;
  if (decl === undefined) {
    return null;
  }

  if (ts.isExportAssignment(decl)) {
    const symbol = checker.getTypeAtLocation(decl.expression).symbol;
    return getClassDeclFromSymbol(symbol, checker);
  }

  if (ts.isExportSpecifier(decl)) {
    const symbol = checker.getTypeAtLocation(decl).symbol;
    return getClassDeclFromSymbol(symbol, checker);
  }

  if (isNamedClassDeclaration(decl)) {
    return decl;
  }
  return null;
}
