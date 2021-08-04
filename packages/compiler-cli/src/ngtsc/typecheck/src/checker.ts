/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, CssSelector, DomElementSchemaRegistry, LiteralPrimitive, MethodCall, ParseError, ParseSourceSpan, parseTemplate, PropertyRead, SafeMethodCall, SafePropertyRead, TmplAstElement, TmplAstNode, TmplAstReference, TmplAstTemplate, TmplAstVariable} from '@angular/compiler';
import {TextAttribute} from '@angular/compiler/src/render3/r3_ast';
import * as ts from 'typescript';
import {ErrorCode} from '../../diagnostics';

import {absoluteFrom, absoluteFromSourceFile, AbsoluteFsPath, getSourceFileOrError} from '../../file_system';
import {Reference, ReferenceEmitter} from '../../imports';
import {IncrementalBuild} from '../../incremental/api';
import {PerfCheckpoint, PerfEvent, PerfPhase, PerfRecorder} from '../../perf';
import {ProgramDriver, UpdateMode} from '../../program_driver';
import {ClassDeclaration, isNamedClassDeclaration, ReflectionHost} from '../../reflection';
import {ComponentScopeReader, TypeCheckScopeRegistry} from '../../scope';
import {isShim} from '../../shims';
import {getSourceFileOrNull, isSymbolWithValueDeclaration} from '../../util/src/typescript';
import {DirectiveInScope, ElementSymbol, FullTemplateMapping, GlobalCompletion, OptimizeFor, PipeInScope, ProgramTypeCheckAdapter, ShimLocation, Symbol, TemplateId, TemplateSymbol, TemplateTypeChecker, TypeCheckableDirectiveMeta, TypeCheckingConfig} from '../api';
import {makeTemplateDiagnostic, TemplateDiagnostic} from '../diagnostics';

import {CompletionEngine} from './completion';
import {InliningMode, ShimTypeCheckingData, TemplateData, TypeCheckContextImpl, TypeCheckingHost} from './context';
import {shouldReportDiagnostic, translateDiagnostic} from './diagnostics';
import {TypeCheckShimGenerator} from './shim';
import {TemplateSourceManager} from './source';
import {findTypeCheckBlock, getTemplateMapping, TemplateSourceResolver} from './tcb_util';
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
  private elementTagCache = new Map<ts.ClassDeclaration, Map<string, DirectiveInScope|null>>();

  private isComplete = false;

  constructor(
      private originalProgram: ts.Program, readonly programDriver: ProgramDriver,
      private typeCheckAdapter: ProgramTypeCheckAdapter, private config: TypeCheckingConfig,
      private refEmitter: ReferenceEmitter, private reflector: ReflectionHost,
      private compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
      private priorBuild: IncrementalBuild<unknown, FileTypeCheckingData>,
      private readonly componentScopeReader: ComponentScopeReader,
      private readonly typeCheckScopeRegistry: TypeCheckScopeRegistry,
      private readonly perf: PerfRecorder) {}

  getTemplate(component: ts.ClassDeclaration): TmplAstNode[]|null {
    const {data} = this.getLatestComponentState(component);
    if (data === null) {
      return null;
    }
    return data.template;
  }

  private getLatestComponentState(component: ts.ClassDeclaration):
      {data: TemplateData|null, tcb: ts.Node|null, shimPath: AbsoluteFsPath} {
    this.ensureShimForComponent(component);

    const sf = component.getSourceFile();
    const sfPath = absoluteFromSourceFile(sf);
    const shimPath = TypeCheckShimGenerator.shimFor(sfPath);

    const fileRecord = this.getFileData(sfPath);

    if (!fileRecord.shimData.has(shimPath)) {
      return {data: null, tcb: null, shimPath};
    }

    const templateId = fileRecord.sourceManager.getTemplateId(component);
    const shimRecord = fileRecord.shimData.get(shimPath)!;
    const id = fileRecord.sourceManager.getTemplateId(component);

    const program = this.programDriver.getProgram();
    const shimSf = getSourceFileOrNull(program, shimPath);

    if (shimSf === null || !fileRecord.shimData.has(shimPath)) {
      throw new Error(`Error: no shim file in program: ${shimPath}`);
    }

    let tcb: ts.Node|null = findTypeCheckBlock(shimSf, id, /*isDiagnosticsRequest*/ false);

    if (tcb === null) {
      // Try for an inline block.
      const inlineSf = getSourceFileOrError(program, sfPath);
      tcb = findTypeCheckBlock(inlineSf, id, /*isDiagnosticsRequest*/ false);
    }

    let data: TemplateData|null = null;
    if (shimRecord.templates.has(templateId)) {
      data = shimRecord.templates.get(templateId)!;
    }

    return {data, tcb, shimPath};
  }

  isTrackedTypeCheckFile(filePath: AbsoluteFsPath): boolean {
    return this.getFileAndShimRecordsForPath(filePath) !== null;
  }

  private getFileAndShimRecordsForPath(shimPath: AbsoluteFsPath):
      {fileRecord: FileTypeCheckingData, shimRecord: ShimTypeCheckingData}|null {
    for (const fileRecord of this.state.values()) {
      if (fileRecord.shimData.has(shimPath)) {
        return {fileRecord, shimRecord: fileRecord.shimData.get(shimPath)!};
      }
    }
    return null;
  }

  getTemplateMappingAtShimLocation({shimPath, positionInShimFile}: ShimLocation):
      FullTemplateMapping|null {
    const records = this.getFileAndShimRecordsForPath(absoluteFrom(shimPath));
    if (records === null) {
      return null;
    }
    const {fileRecord} = records;

    const shimSf = this.programDriver.getProgram().getSourceFile(absoluteFrom(shimPath));
    if (shimSf === undefined) {
      return null;
    }
    return getTemplateMapping(
        shimSf, positionInShimFile, fileRecord.sourceManager, /*isDiagnosticsRequest*/ false);
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

      const diagnostics: (ts.Diagnostic|null)[] = [];
      if (fileRecord.hasInlines) {
        const inlineSf = getSourceFileOrError(typeCheckProgram, sfPath);
        diagnostics.push(...typeCheckProgram.getSemanticDiagnostics(inlineSf).map(
            diag => convertDiagnostic(diag, fileRecord.sourceManager)));
      }

      for (const [shimPath, shimRecord] of fileRecord.shimData) {
        const shimSf = getSourceFileOrError(typeCheckProgram, shimPath);
        diagnostics.push(...typeCheckProgram.getSemanticDiagnostics(shimSf).map(
            diag => convertDiagnostic(diag, fileRecord.sourceManager)));
        diagnostics.push(...shimRecord.genesisDiagnostics);

        for (const templateData of shimRecord.templates.values()) {
          diagnostics.push(...templateData.templateDiagnostics);
        }
      }

      return diagnostics.filter((diag: ts.Diagnostic|null): diag is ts.Diagnostic => diag !== null);
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

      const templateId = fileRecord.sourceManager.getTemplateId(component);
      const shimRecord = fileRecord.shimData.get(shimPath)!;

      const typeCheckProgram = this.programDriver.getProgram();

      const diagnostics: (TemplateDiagnostic|null)[] = [];
      if (shimRecord.hasInlines) {
        const inlineSf = getSourceFileOrError(typeCheckProgram, sfPath);
        diagnostics.push(...typeCheckProgram.getSemanticDiagnostics(inlineSf).map(
            diag => convertDiagnostic(diag, fileRecord.sourceManager)));
      }

      const shimSf = getSourceFileOrError(typeCheckProgram, shimPath);
      diagnostics.push(...typeCheckProgram.getSemanticDiagnostics(shimSf).map(
          diag => convertDiagnostic(diag, fileRecord.sourceManager)));
      diagnostics.push(...shimRecord.genesisDiagnostics);

      for (const templateData of shimRecord.templates.values()) {
        diagnostics.push(...templateData.templateDiagnostics);
      }

      return diagnostics.filter(
          (diag: TemplateDiagnostic|null): diag is TemplateDiagnostic =>
              diag !== null && diag.templateId === templateId);
    });
  }

  getTypeCheckBlock(component: ts.ClassDeclaration): ts.Node|null {
    return this.getLatestComponentState(component).tcb;
  }

  getGlobalCompletions(
      context: TmplAstTemplate|null, component: ts.ClassDeclaration,
      node: AST|TmplAstNode): GlobalCompletion|null {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(
        PerfPhase.TtcAutocompletion, () => engine.getGlobalCompletions(context, node));
  }

  getExpressionCompletionLocation(
      ast: PropertyRead|SafePropertyRead|MethodCall|SafeMethodCall,
      component: ts.ClassDeclaration): ShimLocation|null {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(
        PerfPhase.TtcAutocompletion, () => engine.getExpressionCompletionLocation(ast));
  }

  getLiteralCompletionLocation(
      node: LiteralPrimitive|TextAttribute, component: ts.ClassDeclaration): ShimLocation|null {
    const engine = this.getOrCreateCompletionEngine(component);
    if (engine === null) {
      return null;
    }
    return this.perf.inPhase(
        PerfPhase.TtcAutocompletion, () => engine.getLiteralCompletionLocation(node));
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
    const templateId = fileData.sourceManager.getTemplateId(clazz);

    fileData.shimData.delete(shimPath);
    fileData.isComplete = false;

    this.isComplete = false;
  }

  makeTemplateDiagnostic<T extends ErrorCode>(
      clazz: ts.ClassDeclaration, sourceSpan: ParseSourceSpan, category: ts.DiagnosticCategory,
      errorCode: T, message: string, relatedInformation?: {
        text: string,
        start: number,
        end: number,
        sourceFile: ts.SourceFile,
      }[]): TemplateDiagnostic {
    const sfPath = absoluteFromSourceFile(clazz.getSourceFile());
    const fileRecord = this.state.get(sfPath)!;
    const templateId = fileRecord.sourceManager.getTemplateId(clazz);
    const mapping = fileRecord.sourceManager.getSourceMapping(templateId);

    return makeTemplateDiagnostic(
        templateId, mapping, sourceSpan, category, errorCode, message, relatedInformation);
  }

  private getOrCreateCompletionEngine(component: ts.ClassDeclaration): CompletionEngine|null {
    if (this.completionCache.has(component)) {
      return this.completionCache.get(component)!;
    }

    const {tcb, data, shimPath} = this.getLatestComponentState(component);
    if (tcb === null || data === null) {
      return null;
    }

    const engine = new CompletionEngine(tcb, data, shimPath);
    this.completionCache.set(component, engine);
    return engine;
  }

  private maybeAdoptPriorResultsForFile(sf: ts.SourceFile): void {
    const sfPath = absoluteFromSourceFile(sf);
    if (this.state.has(sfPath)) {
      const existingResults = this.state.get(sfPath)!;

      if (existingResults.isComplete) {
        // All data for this file has already been generated, so no need to adopt anything.
        return;
      }
    }

    const previousResults = this.priorBuild.priorTypeCheckingResultsFor(sf);
    if (previousResults === null || !previousResults.isComplete) {
      return;
    }

    this.perf.eventCount(PerfEvent.ReuseTypeCheckFile);
    this.state.set(sfPath, previousResults);
  }

  private ensureAllShimsForAllFiles(): void {
    if (this.isComplete) {
      return;
    }

    this.perf.inPhase(PerfPhase.TcbGeneration, () => {
      const host = new WholeProgramTypeCheckingHost(this);
      const ctx = this.newContext(host);

      for (const sf of this.originalProgram.getSourceFiles()) {
        if (sf.isDeclarationFile || isShim(sf)) {
          continue;
        }

        this.maybeAdoptPriorResultsForFile(sf);

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
    this.perf.inPhase(PerfPhase.TcbGeneration, () => {
      this.maybeAdoptPriorResultsForFile(sf);

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
    const sf = component.getSourceFile();
    const sfPath = absoluteFromSourceFile(sf);
    const shimPath = TypeCheckShimGenerator.shimFor(sfPath);

    this.maybeAdoptPriorResultsForFile(sf);

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
    const inlining =
        this.programDriver.supportsInlineOperations ? InliningMode.InlineOps : InliningMode.Error;
    return new TypeCheckContextImpl(
        this.config, this.compilerHost, this.refEmitter, this.reflector, host, inlining, this.perf);
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
        sourceManager: new TemplateSourceManager(),
        isComplete: false,
        shimData: new Map(),
      });
    }
    return this.state.get(path)!;
  }
  getSymbolOfNode(node: TmplAstTemplate, component: ts.ClassDeclaration): TemplateSymbol|null;
  getSymbolOfNode(node: TmplAstElement, component: ts.ClassDeclaration): ElementSymbol|null;
  getSymbolOfNode(node: AST|TmplAstNode, component: ts.ClassDeclaration): Symbol|null {
    const builder = this.getOrCreateSymbolBuilder(component);
    if (builder === null) {
      return null;
    }
    return this.perf.inPhase(PerfPhase.TtcSymbol, () => builder.getSymbol(node));
  }

  private getOrCreateSymbolBuilder(component: ts.ClassDeclaration): SymbolBuilder|null {
    if (this.symbolBuilderCache.has(component)) {
      return this.symbolBuilderCache.get(component)!;
    }

    const {tcb, data, shimPath} = this.getLatestComponentState(component);
    if (tcb === null || data === null) {
      return null;
    }

    const builder = new SymbolBuilder(
        shimPath, tcb, data, this.componentScopeReader,
        () => this.programDriver.getProgram().getTypeChecker());
    this.symbolBuilderCache.set(component, builder);
    return builder;
  }

  getDirectivesInScope(component: ts.ClassDeclaration): DirectiveInScope[]|null {
    const data = this.getScopeData(component);
    if (data === null) {
      return null;
    }
    return data.directives;
  }

  getPipesInScope(component: ts.ClassDeclaration): PipeInScope[]|null {
    const data = this.getScopeData(component);
    if (data === null) {
      return null;
    }
    return data.pipes;
  }

  getDirectiveMetadata(dir: ts.ClassDeclaration): TypeCheckableDirectiveMeta|null {
    if (!isNamedClassDeclaration(dir)) {
      return null;
    }
    return this.typeCheckScopeRegistry.getTypeCheckDirectiveMetadata(new Reference(dir));
  }

  getPotentialElementTags(component: ts.ClassDeclaration): Map<string, DirectiveInScope|null> {
    if (this.elementTagCache.has(component)) {
      return this.elementTagCache.get(component)!;
    }

    const tagMap = new Map<string, DirectiveInScope|null>();

    for (const tag of REGISTRY.allKnownElementNames()) {
      tagMap.set(tag, null);
    }

    const scope = this.getScopeData(component);
    if (scope !== null) {
      for (const directive of scope.directives) {
        for (const selector of CssSelector.parse(directive.selector)) {
          if (selector.element === null || tagMap.has(selector.element)) {
            // Skip this directive if it doesn't match an element tag, or if another directive has
            // already been included with the same element name.
            continue;
          }

          tagMap.set(selector.element, directive);
        }
      }
    }

    this.elementTagCache.set(component, tagMap);
    return tagMap;
  }

  getPotentialDomBindings(tagName: string): {attribute: string, property: string}[] {
    const attributes = REGISTRY.allKnownAttributesOfElement(tagName);
    return attributes.map(attribute => ({
                            attribute,
                            property: REGISTRY.getMappedPropName(attribute),
                          }));
  }

  private getScopeData(component: ts.ClassDeclaration): ScopeData|null {
    if (this.scopeCache.has(component)) {
      return this.scopeCache.get(component)!;
    }

    if (!isNamedClassDeclaration(component)) {
      throw new Error(`AssertionError: components must have names`);
    }

    const scope = this.componentScopeReader.getScopeForComponent(component);
    if (scope === null) {
      return null;
    }

    const data: ScopeData = {
      directives: [],
      pipes: [],
      isPoisoned: scope.compilation.isPoisoned,
    };

    const typeChecker = this.programDriver.getProgram().getTypeChecker();
    for (const dir of scope.compilation.directives) {
      if (dir.selector === null) {
        // Skip this directive, it can't be added to a template anyway.
        continue;
      }
      const tsSymbol = typeChecker.getSymbolAtLocation(dir.ref.node.name);
      if (!isSymbolWithValueDeclaration(tsSymbol)) {
        continue;
      }

      let ngModule: ClassDeclaration|null = null;
      const moduleScopeOfDir = this.componentScopeReader.getScopeForComponent(dir.ref.node);
      if (moduleScopeOfDir !== null) {
        ngModule = moduleScopeOfDir.ngModule;
      }

      data.directives.push({
        isComponent: dir.isComponent,
        isStructural: dir.isStructural,
        selector: dir.selector,
        tsSymbol,
        ngModule,
      });
    }

    for (const pipe of scope.compilation.pipes) {
      const tsSymbol = typeChecker.getSymbolAtLocation(pipe.ref.node.name);
      if (tsSymbol === undefined) {
        continue;
      }
      data.pipes.push({
        name: pipe.name,
        tsSymbol,
      });
    }

    this.scopeCache.set(component, data);
    return data;
  }
}

function convertDiagnostic(
    diag: ts.Diagnostic, sourceResolver: TemplateSourceResolver): TemplateDiagnostic|null {
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
   * Source mapping information for mapping diagnostics from inlined type check blocks back to the
   * original template.
   */
  sourceManager: TemplateSourceManager;

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

  getSourceManager(sfPath: AbsoluteFsPath): TemplateSourceManager {
    return this.impl.getFileData(sfPath).sourceManager;
  }

  shouldCheckComponent(node: ts.ClassDeclaration): boolean {
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
      protected sfPath: AbsoluteFsPath, protected fileData: FileTypeCheckingData,
      protected impl: TemplateTypeCheckerImpl) {}

  private assertPath(sfPath: AbsoluteFsPath): void {
    if (this.sfPath !== sfPath) {
      throw new Error(`AssertionError: querying TypeCheckingHost outside of assigned file`);
    }
  }

  getSourceManager(sfPath: AbsoluteFsPath): TemplateSourceManager {
    this.assertPath(sfPath);
    return this.fileData.sourceManager;
  }

  shouldCheckComponent(node: ts.ClassDeclaration): boolean {
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
      sfPath: AbsoluteFsPath, fileData: FileTypeCheckingData, impl: TemplateTypeCheckerImpl,
      private shimPath: AbsoluteFsPath) {
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
  directives: DirectiveInScope[];
  pipes: PipeInScope[];
  isPoisoned: boolean;
}
