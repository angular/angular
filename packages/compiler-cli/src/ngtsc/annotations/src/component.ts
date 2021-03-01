/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compileComponentFromMetadata, compileDeclareComponentFromMetadata, ConstantPool, CssSelector, DeclarationListEmitMode, DEFAULT_INTERPOLATION_CONFIG, DomElementSchemaRegistry, Expression, ExternalExpr, FactoryTarget, InterpolationConfig, LexerRange, makeBindingParser, ParsedTemplate, ParseSourceFile, parseTemplate, R3ComponentMetadata, R3FactoryMetadata, R3TargetBinder, R3UsedDirectiveMetadata, SelectorMatcher, Statement, TmplAstNode, WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {Cycle, CycleAnalyzer, CycleHandlingStrategy} from '../../cycles';
import {ErrorCode, FatalDiagnosticError, makeRelatedInformation} from '../../diagnostics';
import {absoluteFrom, relative} from '../../file_system';
import {DefaultImportRecorder, ImportedFile, ModuleResolver, Reference, ReferenceEmitter} from '../../imports';
import {DependencyTracker} from '../../incremental/api';
import {extractSemanticTypeParameters, isArrayEqual, isReferenceEqual, SemanticDepGraphUpdater, SemanticReference, SemanticSymbol} from '../../incremental/semantic_graph';
import {IndexingContext} from '../../indexer';
import {ClassPropertyMapping, ComponentResources, DirectiveMeta, DirectiveTypeCheckMeta, extractDirectiveTypeCheckMeta, InjectableClassRegistry, MetadataReader, MetadataRegistry, Resource, ResourceRegistry} from '../../metadata';
import {EnumValue, PartialEvaluator, ResolvedValue} from '../../partial_evaluator';
import {PerfEvent, PerfRecorder} from '../../perf';
import {ClassDeclaration, DeclarationNode, Decorator, ReflectionHost, reflectObjectLiteral} from '../../reflection';
import {ComponentScopeReader, LocalModuleScopeRegistry, TypeCheckScopeRegistry} from '../../scope';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerFlags, HandlerPrecedence, ResolveResult} from '../../transform';
import {TemplateSourceMapping, TypeCheckContext} from '../../typecheck/api';
import {tsSourceMapBug29300Fixed} from '../../util/src/ts_source_map_bug_29300';
import {SubsetOfKeys} from '../../util/src/typescript';

import {ResourceLoader} from './api';
import {createValueHasWrongTypeError, getDirectiveDiagnostics, getProviderDiagnostics} from './diagnostics';
import {DirectiveSymbol, extractDirectiveMetadata, parseFieldArrayValue} from './directive';
import {compileDeclareFactory, compileNgFactoryDefField} from './factory';
import {generateSetClassMetadataCall} from './metadata';
import {NgModuleSymbol} from './ng_module';
import {compileResults, findAngularDecorator, isAngularCoreReference, isExpressionForwardReference, readBaseClass, resolveProvidersRequiringFactory, toFactoryMetadata, unwrapExpression, wrapFunctionExpressionsInParens} from './util';

const EMPTY_MAP = new Map<string, Expression>();
const EMPTY_ARRAY: any[] = [];

/**
 * These fields of `R3ComponentMetadata` are updated in the `resolve` phase.
 *
 * The `keyof R3ComponentMetadata &` condition ensures that only fields of `R3ComponentMetadata` can
 * be included here.
 */
export type ComponentMetadataResolvedFields =
    SubsetOfKeys<R3ComponentMetadata, 'directives'|'pipes'|'declarationListEmitMode'>;

export interface ComponentAnalysisData {
  /**
   * `meta` includes those fields of `R3ComponentMetadata` which are calculated at `analyze` time
   * (not during resolve).
   */
  meta: Omit<R3ComponentMetadata, ComponentMetadataResolvedFields>;
  baseClass: Reference<ClassDeclaration>|'dynamic'|null;
  typeCheckMeta: DirectiveTypeCheckMeta;
  template: ParsedTemplateWithSource;
  metadataStmt: Statement|null;

  inputs: ClassPropertyMapping;
  outputs: ClassPropertyMapping;

  /**
   * Providers extracted from the `providers` field of the component annotation which will require
   * an Angular factory definition at runtime.
   */
  providersRequiringFactory: Set<Reference<ClassDeclaration>>|null;

  /**
   * Providers extracted from the `viewProviders` field of the component annotation which will
   * require an Angular factory definition at runtime.
   */
  viewProvidersRequiringFactory: Set<Reference<ClassDeclaration>>|null;

  resources: ComponentResources;

  /**
   * `styleUrls` extracted from the decorator, if present.
   */
  styleUrls: StyleUrlMeta[]|null;

  /**
   * Inline stylesheets extracted from the decorator, if present.
   */
  inlineStyles: string[]|null;

  isPoisoned: boolean;
}

export type ComponentResolutionData = Pick<R3ComponentMetadata, ComponentMetadataResolvedFields>;

/**
 * The literal style url extracted from the decorator, along with metadata for diagnostics.
 */
export interface StyleUrlMeta {
  url: string;
  nodeForError: ts.Node;
  source: ResourceTypeForDiagnostics.StylesheetFromTemplate|
      ResourceTypeForDiagnostics.StylesheetFromDecorator;
}

/**
 * Information about the origin of a resource in the application code. This is used for creating
 * diagnostics, so we can point to the root cause of an error in the application code.
 *
 * A template resource comes from the `templateUrl` property on the component decorator.
 *
 * Stylesheets resources can come from either the `styleUrls` property on the component decorator,
 * or from inline `style` tags and style links on the external template.
 */
export const enum ResourceTypeForDiagnostics {
  Template,
  StylesheetFromTemplate,
  StylesheetFromDecorator,
}

/**
 * Represents an Angular component.
 */
export class ComponentSymbol extends DirectiveSymbol {
  usedDirectives: SemanticReference[] = [];
  usedPipes: SemanticReference[] = [];
  isRemotelyScoped = false;

  isEmitAffected(previousSymbol: SemanticSymbol, publicApiAffected: Set<SemanticSymbol>): boolean {
    if (!(previousSymbol instanceof ComponentSymbol)) {
      return true;
    }

    // Create an equality function that considers symbols equal if they represent the same
    // declaration, but only if the symbol in the current compilation does not have its public API
    // affected.
    const isSymbolUnaffected = (current: SemanticReference, previous: SemanticReference) =>
        isReferenceEqual(current, previous) && !publicApiAffected.has(current.symbol);

    // The emit of a component is affected if either of the following is true:
    //  1. The component used to be remotely scoped but no longer is, or vice versa.
    //  2. The list of used directives has changed or any of those directives have had their public
    //     API changed. If the used directives have been reordered but not otherwise affected then
    //     the component must still be re-emitted, as this may affect directive instantiation order.
    //  3. The list of used pipes has changed, or any of those pipes have had their public API
    //     changed.
    return this.isRemotelyScoped !== previousSymbol.isRemotelyScoped ||
        !isArrayEqual(this.usedDirectives, previousSymbol.usedDirectives, isSymbolUnaffected) ||
        !isArrayEqual(this.usedPipes, previousSymbol.usedPipes, isSymbolUnaffected);
  }

  isTypeCheckBlockAffected(
      previousSymbol: SemanticSymbol, typeCheckApiAffected: Set<SemanticSymbol>): boolean {
    if (!(previousSymbol instanceof ComponentSymbol)) {
      return true;
    }

    // To verify that a used directive is not affected we need to verify that its full inheritance
    // chain is not present in `typeCheckApiAffected`.
    const isInheritanceChainAffected = (symbol: SemanticSymbol): boolean => {
      let currentSymbol: SemanticSymbol|null = symbol;
      while (currentSymbol instanceof DirectiveSymbol) {
        if (typeCheckApiAffected.has(currentSymbol)) {
          return true;
        }
        currentSymbol = currentSymbol.baseClass;
      }

      return false;
    };

    // Create an equality function that considers directives equal if they represent the same
    // declaration and if the symbol and all symbols it inherits from in the current compilation
    // do not have their type-check API affected.
    const isDirectiveUnaffected = (current: SemanticReference, previous: SemanticReference) =>
        isReferenceEqual(current, previous) && !isInheritanceChainAffected(current.symbol);

    // Create an equality function that considers pipes equal if they represent the same
    // declaration and if the symbol in the current compilation does not have its type-check
    // API affected.
    const isPipeUnaffected = (current: SemanticReference, previous: SemanticReference) =>
        isReferenceEqual(current, previous) && !typeCheckApiAffected.has(current.symbol);

    // The emit of a type-check block of a component is affected if either of the following is true:
    //  1. The list of used directives has changed or any of those directives have had their
    //     type-check API changed.
    //  2. The list of used pipes has changed, or any of those pipes have had their type-check API
    //     changed.
    return !isArrayEqual(
               this.usedDirectives, previousSymbol.usedDirectives, isDirectiveUnaffected) ||
        !isArrayEqual(this.usedPipes, previousSymbol.usedPipes, isPipeUnaffected);
  }
}

/**
 * `DecoratorHandler` which handles the `@Component` annotation.
 */
export class ComponentDecoratorHandler implements
    DecoratorHandler<Decorator, ComponentAnalysisData, ComponentSymbol, ComponentResolutionData> {
  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private metaRegistry: MetadataRegistry, private metaReader: MetadataReader,
      private scopeReader: ComponentScopeReader, private scopeRegistry: LocalModuleScopeRegistry,
      private typeCheckScopeRegistry: TypeCheckScopeRegistry,
      private resourceRegistry: ResourceRegistry, private isCore: boolean,
      private resourceLoader: ResourceLoader, private rootDirs: ReadonlyArray<string>,
      private defaultPreserveWhitespaces: boolean, private i18nUseExternalIds: boolean,
      private enableI18nLegacyMessageIdFormat: boolean, private usePoisonedData: boolean,
      private i18nNormalizeLineEndingsInICUs: boolean|undefined,
      private moduleResolver: ModuleResolver, private cycleAnalyzer: CycleAnalyzer,
      private cycleHandlingStrategy: CycleHandlingStrategy, private refEmitter: ReferenceEmitter,
      private defaultImportRecorder: DefaultImportRecorder,
      private depTracker: DependencyTracker|null,
      private injectableRegistry: InjectableClassRegistry,
      private semanticDepGraphUpdater: SemanticDepGraphUpdater|null,
      private annotateForClosureCompiler: boolean, private perf: PerfRecorder) {}

  private literalCache = new Map<Decorator, ts.ObjectLiteralExpression>();
  private elementSchemaRegistry = new DomElementSchemaRegistry();

  /**
   * During the asynchronous preanalyze phase, it's necessary to parse the template to extract
   * any potential <link> tags which might need to be loaded. This cache ensures that work is not
   * thrown away, and the parsed template is reused during the analyze phase.
   */
  private preanalyzeTemplateCache = new Map<DeclarationNode, ParsedTemplateWithSource>();
  private preanalyzeStylesCache = new Map<DeclarationNode, string[]|null>();

  readonly precedence = HandlerPrecedence.PRIMARY;
  readonly name = ComponentDecoratorHandler.name;

  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<Decorator>|undefined {
    if (!decorators) {
      return undefined;
    }
    const decorator = findAngularDecorator(decorators, 'Component', this.isCore);
    if (decorator !== undefined) {
      return {
        trigger: decorator.node,
        decorator,
        metadata: decorator,
      };
    } else {
      return undefined;
    }
  }

  preanalyze(node: ClassDeclaration, decorator: Readonly<Decorator>): Promise<void>|undefined {
    // In preanalyze, resource URLs associated with the component are asynchronously preloaded via
    // the resourceLoader. This is the only time async operations are allowed for a component.
    // These resources are:
    //
    // - the templateUrl, if there is one
    // - any styleUrls if present
    // - any stylesheets referenced from <link> tags in the template itself
    //
    // As a result of the last one, the template must be parsed as part of preanalysis to extract
    // <link> tags, which may involve waiting for the templateUrl to be resolved first.

    // If preloading isn't possible, then skip this step.
    if (!this.resourceLoader.canPreload) {
      return undefined;
    }

    const meta = this._resolveLiteral(decorator);
    const component = reflectObjectLiteral(meta);
    const containingFile = node.getSourceFile().fileName;

    const resolveStyleUrl =
        (styleUrl: string, nodeForError: ts.Node,
         resourceType: ResourceTypeForDiagnostics): Promise<void>|undefined => {
          const resourceUrl =
              this._resolveResourceOrThrow(styleUrl, containingFile, nodeForError, resourceType);
          return this.resourceLoader.preload(resourceUrl, {type: 'style', containingFile});
        };

    // A Promise that waits for the template and all <link>ed styles within it to be preloaded.
    const templateAndTemplateStyleResources =
        this._preloadAndParseTemplate(node, decorator, component, containingFile)
            .then((template: ParsedTemplateWithSource|null): Promise<void>|undefined => {
              if (template === null) {
                return undefined;
              }

              const nodeForError = getTemplateDeclarationNodeForError(template.declaration);
              return Promise
                  .all(template.styleUrls.map(
                      styleUrl => resolveStyleUrl(
                          styleUrl, nodeForError,
                          ResourceTypeForDiagnostics.StylesheetFromTemplate)))
                  .then(() => undefined);
            });

    // Extract all the styleUrls in the decorator.
    const componentStyleUrls = this._extractComponentStyleUrls(component);

    // Extract inline styles, process, and cache for use in synchronous analyze phase
    let inlineStyles;
    if (component.has('styles')) {
      const litStyles = parseFieldArrayValue(component, 'styles', this.evaluator);
      if (litStyles === null) {
        this.preanalyzeStylesCache.set(node, null);
      } else {
        inlineStyles = Promise
                           .all(litStyles.map(
                               style => this.resourceLoader.preprocessInline(
                                   style, {type: 'style', containingFile})))
                           .then(styles => {
                             this.preanalyzeStylesCache.set(node, styles);
                           });
      }
    }

    // Wait for both the template and all styleUrl resources to resolve.
    return Promise
        .all([
          templateAndTemplateStyleResources, inlineStyles,
          ...componentStyleUrls.map(
              styleUrl => resolveStyleUrl(
                  styleUrl.url, styleUrl.nodeForError,
                  ResourceTypeForDiagnostics.StylesheetFromDecorator))
        ])
        .then(() => undefined);
  }

  analyze(
      node: ClassDeclaration, decorator: Readonly<Decorator>,
      flags: HandlerFlags = HandlerFlags.NONE): AnalysisOutput<ComponentAnalysisData> {
    this.perf.eventCount(PerfEvent.AnalyzeComponent);
    const containingFile = node.getSourceFile().fileName;
    this.literalCache.delete(decorator);

    // @Component inherits @Directive, so begin by extracting the @Directive metadata and building
    // on it.
    const directiveResult = extractDirectiveMetadata(
        node, decorator, this.reflector, this.evaluator, this.defaultImportRecorder, this.isCore,
        flags, this.annotateForClosureCompiler,
        this.elementSchemaRegistry.getDefaultComponentElementName());
    if (directiveResult === undefined) {
      // `extractDirectiveMetadata` returns undefined when the @Directive has `jit: true`. In this
      // case, compilation of the decorator is skipped. Returning an empty object signifies
      // that no analysis was produced.
      return {};
    }

    // Next, read the `@Component`-specific fields.
    const {decorator: component, metadata, inputs, outputs} = directiveResult;

    // Go through the root directories for this project, and select the one with the smallest
    // relative path representation.
    const relativeContextFilePath = this.rootDirs.reduce<string|undefined>((previous, rootDir) => {
      const candidate = relative(absoluteFrom(rootDir), absoluteFrom(containingFile));
      if (previous === undefined || candidate.length < previous.length) {
        return candidate;
      } else {
        return previous;
      }
    }, undefined)!;


    // Note that we could technically combine the `viewProvidersRequiringFactory` and
    // `providersRequiringFactory` into a single set, but we keep the separate so that
    // we can distinguish where an error is coming from when logging the diagnostics in `resolve`.
    let viewProvidersRequiringFactory: Set<Reference<ClassDeclaration>>|null = null;
    let providersRequiringFactory: Set<Reference<ClassDeclaration>>|null = null;
    let wrappedViewProviders: Expression|null = null;

    if (component.has('viewProviders')) {
      const viewProviders = component.get('viewProviders')!;
      viewProvidersRequiringFactory =
          resolveProvidersRequiringFactory(viewProviders, this.reflector, this.evaluator);
      wrappedViewProviders = new WrappedNodeExpr(
          this.annotateForClosureCompiler ? wrapFunctionExpressionsInParens(viewProviders) :
                                            viewProviders);
    }

    if (component.has('providers')) {
      providersRequiringFactory = resolveProvidersRequiringFactory(
          component.get('providers')!, this.reflector, this.evaluator);
    }

    // Parse the template.
    // If a preanalyze phase was executed, the template may already exist in parsed form, so check
    // the preanalyzeTemplateCache.
    // Extract a closure of the template parsing code so that it can be reparsed with different
    // options if needed, like in the indexing pipeline.
    let template: ParsedTemplateWithSource;
    if (this.preanalyzeTemplateCache.has(node)) {
      // The template was parsed in preanalyze. Use it and delete it to save memory.
      const preanalyzed = this.preanalyzeTemplateCache.get(node)!;
      this.preanalyzeTemplateCache.delete(node);

      template = preanalyzed;
    } else {
      const templateDecl = this.parseTemplateDeclaration(decorator, component, containingFile);
      template = this.extractTemplate(node, templateDecl);
    }
    const templateResource =
        template.isInline ? {path: null, expression: component.get('template')!} : {
          path: absoluteFrom(template.declaration.resolvedTemplateUrl),
          expression: template.sourceMapping.node
        };

    // Figure out the set of styles. The ordering here is important: external resources (styleUrls)
    // precede inline styles, and styles defined in the template override styles defined in the
    // component.
    let styles: string[] = [];

    const styleResources = this._extractStyleResources(component, containingFile);
    const styleUrls: StyleUrlMeta[] = [
      ...this._extractComponentStyleUrls(component), ...this._extractTemplateStyleUrls(template)
    ];

    for (const styleUrl of styleUrls) {
      const resourceType = styleUrl.source === ResourceTypeForDiagnostics.StylesheetFromDecorator ?
          ResourceTypeForDiagnostics.StylesheetFromDecorator :
          ResourceTypeForDiagnostics.StylesheetFromTemplate;
      const resourceUrl = this._resolveResourceOrThrow(
          styleUrl.url, containingFile, styleUrl.nodeForError, resourceType);
      const resourceStr = this.resourceLoader.load(resourceUrl);

      styles.push(resourceStr);
      if (this.depTracker !== null) {
        this.depTracker.addResourceDependency(node.getSourceFile(), absoluteFrom(resourceUrl));
      }
    }

    // If inline styles were preprocessed use those
    let inlineStyles: string[]|null = null;
    if (this.preanalyzeStylesCache.has(node)) {
      inlineStyles = this.preanalyzeStylesCache.get(node)!;
      this.preanalyzeStylesCache.delete(node);
      if (inlineStyles !== null) {
        styles.push(...inlineStyles);
      }
    } else {
      // Preprocessing is only supported asynchronously
      // If no style cache entry is present asynchronous preanalyze was not executed.
      // This protects against accidental differences in resource contents when preanalysis
      // is not used with a provided transformResource hook on the ResourceHost.
      if (this.resourceLoader.canPreprocess) {
        throw new Error('Inline resource processing requires asynchronous preanalyze.');
      }

      if (component.has('styles')) {
        const litStyles = parseFieldArrayValue(component, 'styles', this.evaluator);
        if (litStyles !== null) {
          inlineStyles = [...litStyles];
          styles.push(...litStyles);
        }
      }
    }
    if (template.styles.length > 0) {
      styles.push(...template.styles);
    }

    const encapsulation: number =
        this._resolveEnumValue(component, 'encapsulation', 'ViewEncapsulation') || 0;

    const changeDetection: number|null =
        this._resolveEnumValue(component, 'changeDetection', 'ChangeDetectionStrategy');

    let animations: Expression|null = null;
    if (component.has('animations')) {
      animations = new WrappedNodeExpr(component.get('animations')!);
    }

    const output: AnalysisOutput<ComponentAnalysisData> = {
      analysis: {
        baseClass: readBaseClass(node, this.reflector, this.evaluator),
        inputs,
        outputs,
        meta: {
          ...metadata,
          template: {
            nodes: template.nodes,
            ngContentSelectors: template.ngContentSelectors,
          },
          encapsulation,
          interpolation: template.interpolationConfig ?? DEFAULT_INTERPOLATION_CONFIG,
          styles,

          // These will be replaced during the compilation step, after all `NgModule`s have been
          // analyzed and the full compilation scope for the component can be realized.
          animations,
          viewProviders: wrappedViewProviders,
          i18nUseExternalIds: this.i18nUseExternalIds,
          relativeContextFilePath,
        },
        typeCheckMeta: extractDirectiveTypeCheckMeta(node, inputs, this.reflector),
        metadataStmt: generateSetClassMetadataCall(
            node, this.reflector, this.defaultImportRecorder, this.isCore,
            this.annotateForClosureCompiler),
        template,
        providersRequiringFactory,
        viewProvidersRequiringFactory,
        inlineStyles,
        styleUrls,
        resources: {
          styles: styleResources,
          template: templateResource,
        },
        isPoisoned: false,
      },
    };
    if (changeDetection !== null) {
      output.analysis!.meta.changeDetection = changeDetection;
    }
    return output;
  }

  symbol(node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>): ComponentSymbol {
    const typeParameters = extractSemanticTypeParameters(node);

    return new ComponentSymbol(
        node, analysis.meta.selector, analysis.inputs, analysis.outputs, analysis.meta.exportAs,
        analysis.typeCheckMeta, typeParameters);
  }

  register(node: ClassDeclaration, analysis: ComponentAnalysisData): void {
    // Register this component's information with the `MetadataRegistry`. This ensures that
    // the information about the component is available during the compile() phase.
    const ref = new Reference(node);
    this.metaRegistry.registerDirectiveMetadata({
      ref,
      name: node.name.text,
      selector: analysis.meta.selector,
      exportAs: analysis.meta.exportAs,
      inputs: analysis.inputs,
      outputs: analysis.outputs,
      queries: analysis.meta.queries.map(query => query.propertyName),
      isComponent: true,
      baseClass: analysis.baseClass,
      ...analysis.typeCheckMeta,
      isPoisoned: analysis.isPoisoned,
      isStructural: false,
    });

    this.resourceRegistry.registerResources(analysis.resources, node);
    this.injectableRegistry.registerInjectable(node);
  }

  index(
      context: IndexingContext, node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>) {
    if (analysis.isPoisoned && !this.usePoisonedData) {
      return null;
    }
    const scope = this.scopeReader.getScopeForComponent(node);
    const selector = analysis.meta.selector;
    const matcher = new SelectorMatcher<DirectiveMeta>();
    if (scope !== null) {
      if ((scope.compilation.isPoisoned || scope.exported.isPoisoned) && !this.usePoisonedData) {
        // Don't bother indexing components which had erroneous scopes, unless specifically
        // requested.
        return null;
      }

      for (const directive of scope.compilation.directives) {
        if (directive.selector !== null) {
          matcher.addSelectables(CssSelector.parse(directive.selector), directive);
        }
      }
    }
    const binder = new R3TargetBinder(matcher);
    const boundTemplate = binder.bind({template: analysis.template.diagNodes});

    context.addComponent({
      declaration: node,
      selector,
      boundTemplate,
      templateMeta: {
        isInline: analysis.template.isInline,
        file: analysis.template.file,
      },
    });
  }

  typeCheck(ctx: TypeCheckContext, node: ClassDeclaration, meta: Readonly<ComponentAnalysisData>):
      void {
    if (this.typeCheckScopeRegistry === null || !ts.isClassDeclaration(node)) {
      return;
    }

    if (meta.isPoisoned && !this.usePoisonedData) {
      return;
    }
    const scope = this.typeCheckScopeRegistry.getTypeCheckScope(node);
    if (scope.isPoisoned && !this.usePoisonedData) {
      // Don't type-check components that had errors in their scopes, unless requested.
      return;
    }

    const binder = new R3TargetBinder(scope.matcher);
    ctx.addTemplate(
        new Reference(node), binder, meta.template.diagNodes, scope.pipes, scope.schemas,
        meta.template.sourceMapping, meta.template.file, meta.template.errors);
  }

  resolve(
      node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>,
      symbol: ComponentSymbol): ResolveResult<ComponentResolutionData> {
    if (this.semanticDepGraphUpdater !== null && analysis.baseClass instanceof Reference) {
      symbol.baseClass = this.semanticDepGraphUpdater.getSymbol(analysis.baseClass.node);
    }

    if (analysis.isPoisoned && !this.usePoisonedData) {
      return {};
    }

    const context = node.getSourceFile();
    // Check whether this component was registered with an NgModule. If so, it should be compiled
    // under that module's compilation scope.
    const scope = this.scopeReader.getScopeForComponent(node);
    let metadata = analysis.meta as Readonly<R3ComponentMetadata>;

    const data: ComponentResolutionData = {
      directives: EMPTY_ARRAY,
      pipes: EMPTY_MAP,
      declarationListEmitMode: DeclarationListEmitMode.Direct,
    };

    if (scope !== null && (!scope.compilation.isPoisoned || this.usePoisonedData)) {
      // Replace the empty components and directives from the analyze() step with a fully expanded
      // scope. This is possible now because during resolve() the whole compilation unit has been
      // fully analyzed.
      //
      // First it needs to be determined if actually importing the directives/pipes used in the
      // template would create a cycle. Currently ngtsc refuses to generate cycles, so an option
      // known as "remote scoping" is used if a cycle would be created. In remote scoping, the
      // module file sets the directives/pipes on the ɵcmp of the component, without
      // requiring new imports (but also in a way that breaks tree shaking).
      //
      // Determining this is challenging, because the TemplateDefinitionBuilder is responsible for
      // matching directives and pipes in the template; however, that doesn't run until the actual
      // compile() step. It's not possible to run template compilation sooner as it requires the
      // ConstantPool for the overall file being compiled (which isn't available until the
      // transform step).
      //
      // Instead, directives/pipes are matched independently here, using the R3TargetBinder. This
      // is an alternative implementation of template matching which is used for template
      // type-checking and will eventually replace matching in the TemplateDefinitionBuilder.


      // Set up the R3TargetBinder, as well as a 'directives' array and a 'pipes' map that are
      // later fed to the TemplateDefinitionBuilder. First, a SelectorMatcher is constructed to
      // match directives that are in scope.
      type MatchedDirective = DirectiveMeta&{selector: string};
      const matcher = new SelectorMatcher<MatchedDirective>();

      for (const dir of scope.compilation.directives) {
        if (dir.selector !== null) {
          matcher.addSelectables(CssSelector.parse(dir.selector), dir as MatchedDirective);
        }
      }
      const pipes = new Map<string, Reference<ClassDeclaration>>();
      for (const pipe of scope.compilation.pipes) {
        pipes.set(pipe.name, pipe.ref);
      }

      // Next, the component template AST is bound using the R3TargetBinder. This produces a
      // BoundTarget, which is similar to a ts.TypeChecker.
      const binder = new R3TargetBinder(matcher);
      const bound = binder.bind({template: metadata.template.nodes});

      // The BoundTarget knows which directives and pipes matched the template.
      type UsedDirective =
          R3UsedDirectiveMetadata&{ref: Reference<ClassDeclaration>, importedFile: ImportedFile};
      const usedDirectives: UsedDirective[] = bound.getUsedDirectives().map(directive => {
        const type = this.refEmitter.emit(directive.ref, context);
        return {
          ref: directive.ref,
          type: type.expression,
          importedFile: type.importedFile,
          selector: directive.selector,
          inputs: directive.inputs.propertyNames,
          outputs: directive.outputs.propertyNames,
          exportAs: directive.exportAs,
          isComponent: directive.isComponent,
        };
      });

      type UsedPipe = {
        ref: Reference<ClassDeclaration>,
        pipeName: string,
        expression: Expression,
        importedFile: ImportedFile,
      };
      const usedPipes: UsedPipe[] = [];
      for (const pipeName of bound.getUsedPipes()) {
        if (!pipes.has(pipeName)) {
          continue;
        }
        const pipe = pipes.get(pipeName)!;
        const type = this.refEmitter.emit(pipe, context);
        usedPipes.push({
          ref: pipe,
          pipeName,
          expression: type.expression,
          importedFile: type.importedFile,
        });
      }
      if (this.semanticDepGraphUpdater !== null) {
        symbol.usedDirectives = usedDirectives.map(
            dir => this.semanticDepGraphUpdater!.getSemanticReference(dir.ref.node, dir.type));
        symbol.usedPipes = usedPipes.map(
            pipe =>
                this.semanticDepGraphUpdater!.getSemanticReference(pipe.ref.node, pipe.expression));
      }

      // Scan through the directives/pipes actually used in the template and check whether any
      // import which needs to be generated would create a cycle.
      const cyclesFromDirectives = new Map<UsedDirective, Cycle>();
      for (const usedDirective of usedDirectives) {
        const cycle =
            this._checkForCyclicImport(usedDirective.importedFile, usedDirective.type, context);
        if (cycle !== null) {
          cyclesFromDirectives.set(usedDirective, cycle);
        }
      }
      const cyclesFromPipes = new Map<UsedPipe, Cycle>();
      for (const usedPipe of usedPipes) {
        const cycle =
            this._checkForCyclicImport(usedPipe.importedFile, usedPipe.expression, context);
        if (cycle !== null) {
          cyclesFromPipes.set(usedPipe, cycle);
        }
      }

      const cycleDetected = cyclesFromDirectives.size !== 0 || cyclesFromPipes.size !== 0;
      if (!cycleDetected) {
        // No cycle was detected. Record the imports that need to be created in the cycle detector
        // so that future cyclic import checks consider their production.
        for (const {type, importedFile} of usedDirectives) {
          this._recordSyntheticImport(importedFile, type, context);
        }
        for (const {expression, importedFile} of usedPipes) {
          this._recordSyntheticImport(importedFile, expression, context);
        }

        // Check whether the directive/pipe arrays in ɵcmp need to be wrapped in closures.
        // This is required if any directive/pipe reference is to a declaration in the same file
        // but declared after this component.
        const wrapDirectivesAndPipesInClosure =
            usedDirectives.some(
                dir => isExpressionForwardReference(dir.type, node.name, context)) ||
            usedPipes.some(
                pipe => isExpressionForwardReference(pipe.expression, node.name, context));

        data.directives = usedDirectives;
        data.pipes = new Map(usedPipes.map(pipe => [pipe.pipeName, pipe.expression]));
        data.declarationListEmitMode = wrapDirectivesAndPipesInClosure ?
            DeclarationListEmitMode.Closure :
            DeclarationListEmitMode.Direct;
      } else {
        if (this.cycleHandlingStrategy === CycleHandlingStrategy.UseRemoteScoping) {
          // Declaring the directiveDefs/pipeDefs arrays directly would require imports that would
          // create a cycle. Instead, mark this component as requiring remote scoping, so that the
          // NgModule file will take care of setting the directives for the component.
          this.scopeRegistry.setComponentRemoteScope(
              node, usedDirectives.map(dir => dir.ref), usedPipes.map(pipe => pipe.ref));
          symbol.isRemotelyScoped = true;

          // If a semantic graph is being tracked, record the fact that this component is remotely
          // scoped with the declaring NgModule symbol as the NgModule's emit becomes dependent on
          // the directive/pipe usages of this component.
          if (this.semanticDepGraphUpdater !== null) {
            const moduleSymbol = this.semanticDepGraphUpdater.getSymbol(scope.ngModule);
            if (!(moduleSymbol instanceof NgModuleSymbol)) {
              throw new Error(
                  `AssertionError: Expected ${scope.ngModule.name} to be an NgModuleSymbol.`);
            }

            moduleSymbol.addRemotelyScopedComponent(
                symbol, symbol.usedDirectives, symbol.usedPipes);
          }
        } else {
          // We are not able to handle this cycle so throw an error.
          const relatedMessages: ts.DiagnosticRelatedInformation[] = [];
          for (const [dir, cycle] of cyclesFromDirectives) {
            relatedMessages.push(
                makeCyclicImportInfo(dir.ref, dir.isComponent ? 'component' : 'directive', cycle));
          }
          for (const [pipe, cycle] of cyclesFromPipes) {
            relatedMessages.push(makeCyclicImportInfo(pipe.ref, 'pipe', cycle));
          }
          throw new FatalDiagnosticError(
              ErrorCode.IMPORT_CYCLE_DETECTED, node,
              'One or more import cycles would need to be created to compile this component, ' +
                  'which is not supported by the current compiler configuration.',
              relatedMessages);
        }
      }
    }

    const diagnostics: ts.Diagnostic[] = [];

    if (analysis.providersRequiringFactory !== null &&
        analysis.meta.providers instanceof WrappedNodeExpr) {
      const providerDiagnostics = getProviderDiagnostics(
          analysis.providersRequiringFactory, analysis.meta.providers!.node,
          this.injectableRegistry);
      diagnostics.push(...providerDiagnostics);
    }

    if (analysis.viewProvidersRequiringFactory !== null &&
        analysis.meta.viewProviders instanceof WrappedNodeExpr) {
      const viewProviderDiagnostics = getProviderDiagnostics(
          analysis.viewProvidersRequiringFactory, analysis.meta.viewProviders!.node,
          this.injectableRegistry);
      diagnostics.push(...viewProviderDiagnostics);
    }

    const directiveDiagnostics = getDirectiveDiagnostics(
        node, this.metaReader, this.evaluator, this.reflector, this.scopeRegistry, 'Component');
    if (directiveDiagnostics !== null) {
      diagnostics.push(...directiveDiagnostics);
    }

    if (diagnostics.length > 0) {
      return {diagnostics};
    }

    return {data};
  }

  updateResources(node: ClassDeclaration, analysis: ComponentAnalysisData): void {
    const containingFile = node.getSourceFile().fileName;

    // If the template is external, re-parse it.
    const templateDecl = analysis.template.declaration;
    if (!templateDecl.isInline) {
      analysis.template = this.extractTemplate(node, templateDecl);
    }

    // Update any external stylesheets and rebuild the combined 'styles' list.
    // TODO(alxhub): write tests for styles when the primary compiler uses the updateResources path
    let styles: string[] = [];
    if (analysis.styleUrls !== null) {
      for (const styleUrl of analysis.styleUrls) {
        const resourceType =
            styleUrl.source === ResourceTypeForDiagnostics.StylesheetFromDecorator ?
            ResourceTypeForDiagnostics.StylesheetFromDecorator :
            ResourceTypeForDiagnostics.StylesheetFromTemplate;
        const resolvedStyleUrl = this._resolveResourceOrThrow(
            styleUrl.url, containingFile, styleUrl.nodeForError, resourceType);
        const styleText = this.resourceLoader.load(resolvedStyleUrl);
        styles.push(styleText);
      }
    }
    if (analysis.inlineStyles !== null) {
      for (const styleText of analysis.inlineStyles) {
        styles.push(styleText);
      }
    }
    for (const styleText of analysis.template.styles) {
      styles.push(styleText);
    }

    analysis.meta.styles = styles;
  }

  compileFull(
      node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>,
      resolution: Readonly<ComponentResolutionData>, pool: ConstantPool): CompileResult[] {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return [];
    }
    const meta: R3ComponentMetadata = {...analysis.meta, ...resolution};
    const fac = compileNgFactoryDefField(toFactoryMetadata(meta, FactoryTarget.Component));
    const def = compileComponentFromMetadata(meta, pool, makeBindingParser());
    return compileResults(fac, def, analysis.metadataStmt, 'ɵcmp');
  }

  compilePartial(
      node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>,
      resolution: Readonly<ComponentResolutionData>): CompileResult[] {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return [];
    }
    const meta: R3ComponentMetadata = {...analysis.meta, ...resolution};
    const fac = compileDeclareFactory(toFactoryMetadata(meta, FactoryTarget.Component));
    const def = compileDeclareComponentFromMetadata(meta, analysis.template);
    return compileResults(fac, def, analysis.metadataStmt, 'ɵcmp');
  }

  private _resolveLiteral(decorator: Decorator): ts.ObjectLiteralExpression {
    if (this.literalCache.has(decorator)) {
      return this.literalCache.get(decorator)!;
    }
    if (decorator.args === null || decorator.args.length !== 1) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARITY_WRONG, Decorator.nodeForError(decorator),
          `Incorrect number of arguments to @Component decorator`);
    }
    const meta = unwrapExpression(decorator.args[0]);

    if (!ts.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, `Decorator argument must be literal.`);
    }

    this.literalCache.set(decorator, meta);
    return meta;
  }

  private _resolveEnumValue(
      component: Map<string, ts.Expression>, field: string, enumSymbolName: string): number|null {
    let resolved: number|null = null;
    if (component.has(field)) {
      const expr = component.get(field)!;
      const value = this.evaluator.evaluate(expr) as any;
      if (value instanceof EnumValue && isAngularCoreReference(value.enumRef, enumSymbolName)) {
        resolved = value.resolved as number;
      } else {
        throw createValueHasWrongTypeError(
            expr, value, `${field} must be a member of ${enumSymbolName} enum from @angular/core`);
      }
    }
    return resolved;
  }

  private _extractComponentStyleUrls(
      component: Map<string, ts.Expression>,
      ): StyleUrlMeta[] {
    if (!component.has('styleUrls')) {
      return [];
    }

    return this._extractStyleUrlsFromExpression(component.get('styleUrls')!);
  }

  private _extractStyleUrlsFromExpression(styleUrlsExpr: ts.Expression): StyleUrlMeta[] {
    const styleUrls: StyleUrlMeta[] = [];

    if (ts.isArrayLiteralExpression(styleUrlsExpr)) {
      for (const styleUrlExpr of styleUrlsExpr.elements) {
        if (ts.isSpreadElement(styleUrlExpr)) {
          styleUrls.push(...this._extractStyleUrlsFromExpression(styleUrlExpr.expression));
        } else {
          const styleUrl = this.evaluator.evaluate(styleUrlExpr);

          if (typeof styleUrl !== 'string') {
            throw createValueHasWrongTypeError(styleUrlExpr, styleUrl, 'styleUrl must be a string');
          }

          styleUrls.push({
            url: styleUrl,
            source: ResourceTypeForDiagnostics.StylesheetFromDecorator,
            nodeForError: styleUrlExpr,
          });
        }
      }
    } else {
      const evaluatedStyleUrls = this.evaluator.evaluate(styleUrlsExpr);
      if (!isStringArray(evaluatedStyleUrls)) {
        throw createValueHasWrongTypeError(
            styleUrlsExpr, evaluatedStyleUrls, 'styleUrls must be an array of strings');
      }

      for (const styleUrl of evaluatedStyleUrls) {
        styleUrls.push({
          url: styleUrl,
          source: ResourceTypeForDiagnostics.StylesheetFromDecorator,
          nodeForError: styleUrlsExpr,
        });
      }
    }

    return styleUrls;
  }

  private _extractStyleResources(component: Map<string, ts.Expression>, containingFile: string):
      ReadonlySet<Resource> {
    const styles = new Set<Resource>();
    function stringLiteralElements(array: ts.ArrayLiteralExpression): ts.StringLiteralLike[] {
      return array.elements.filter(
          (e: ts.Expression): e is ts.StringLiteralLike => ts.isStringLiteralLike(e));
    }

    // If styleUrls is a literal array, process each resource url individually and
    // register ones that are string literals.
    const styleUrlsExpr = component.get('styleUrls');
    if (styleUrlsExpr !== undefined && ts.isArrayLiteralExpression(styleUrlsExpr)) {
      for (const expression of stringLiteralElements(styleUrlsExpr)) {
        const resourceUrl = this._resolveResourceOrThrow(
            expression.text, containingFile, expression,
            ResourceTypeForDiagnostics.StylesheetFromDecorator);
        styles.add({path: absoluteFrom(resourceUrl), expression});
      }
    }

    const stylesExpr = component.get('styles');
    if (stylesExpr !== undefined && ts.isArrayLiteralExpression(stylesExpr)) {
      for (const expression of stringLiteralElements(stylesExpr)) {
        styles.add({path: null, expression});
      }
    }

    return styles;
  }

  private _preloadAndParseTemplate(
      node: ClassDeclaration, decorator: Decorator, component: Map<string, ts.Expression>,
      containingFile: string): Promise<ParsedTemplateWithSource|null> {
    if (component.has('templateUrl')) {
      // Extract the templateUrl and preload it.
      const templateUrlExpr = component.get('templateUrl')!;
      const templateUrl = this.evaluator.evaluate(templateUrlExpr);
      if (typeof templateUrl !== 'string') {
        throw createValueHasWrongTypeError(
            templateUrlExpr, templateUrl, 'templateUrl must be a string');
      }
      const resourceUrl = this._resolveResourceOrThrow(
          templateUrl, containingFile, templateUrlExpr, ResourceTypeForDiagnostics.Template);
      const templatePromise =
          this.resourceLoader.preload(resourceUrl, {type: 'template', containingFile});

      // If the preload worked, then actually load and parse the template, and wait for any style
      // URLs to resolve.
      if (templatePromise !== undefined) {
        return templatePromise.then(() => {
          const templateDecl = this.parseTemplateDeclaration(decorator, component, containingFile);
          const template = this.extractTemplate(node, templateDecl);
          this.preanalyzeTemplateCache.set(node, template);
          return template;
        });
      } else {
        return Promise.resolve(null);
      }
    } else {
      const templateDecl = this.parseTemplateDeclaration(decorator, component, containingFile);
      const template = this.extractTemplate(node, templateDecl);
      this.preanalyzeTemplateCache.set(node, template);
      return Promise.resolve(template);
    }
  }

  private extractTemplate(node: ClassDeclaration, template: TemplateDeclaration):
      ParsedTemplateWithSource {
    if (template.isInline) {
      let templateStr: string;
      let templateLiteral: ts.Node|null = null;
      let templateUrl: string = '';
      let templateRange: LexerRange|null = null;
      let sourceMapping: TemplateSourceMapping;
      let escapedString = false;
      // We only support SourceMaps for inline templates that are simple string literals.
      if (ts.isStringLiteral(template.expression) ||
          ts.isNoSubstitutionTemplateLiteral(template.expression)) {
        // the start and end of the `templateExpr` node includes the quotation marks, which we must
        // strip
        templateRange = getTemplateRange(template.expression);
        templateStr = template.expression.getSourceFile().text;
        templateLiteral = template.expression;
        templateUrl = template.templateUrl;
        escapedString = true;
        sourceMapping = {
          type: 'direct',
          node: template.expression,
        };
      } else {
        const resolvedTemplate = this.evaluator.evaluate(template.expression);
        if (typeof resolvedTemplate !== 'string') {
          throw createValueHasWrongTypeError(
              template.expression, resolvedTemplate, 'template must be a string');
        }
        templateStr = resolvedTemplate;
        sourceMapping = {
          type: 'indirect',
          node: template.expression,
          componentClass: node,
          template: templateStr,
        };
      }

      return {
        ...this._parseTemplate(template, templateStr, templateRange, escapedString),
        sourceMapping,
        declaration: template,
      };
    } else {
      const templateStr = this.resourceLoader.load(template.resolvedTemplateUrl);
      if (this.depTracker !== null) {
        this.depTracker.addResourceDependency(
            node.getSourceFile(), absoluteFrom(template.resolvedTemplateUrl));
      }

      return {
        ...this._parseTemplate(
            template, templateStr, /* templateRange */ null,
            /* escapedString */ false),
        sourceMapping: {
          type: 'external',
          componentClass: node,
          // TODO(alxhub): TS in g3 is unable to make this inference on its own, so cast it here
          // until g3 is able to figure this out.
          node: (template as ExternalTemplateDeclaration).templateUrlExpression,
          template: templateStr,
          templateUrl: template.resolvedTemplateUrl,
        },
        declaration: template,
      };
    }
  }

  private _parseTemplate(
      template: TemplateDeclaration, templateStr: string, templateRange: LexerRange|null,
      escapedString: boolean): ParsedComponentTemplate {
    // We always normalize line endings if the template has been escaped (i.e. is inline).
    const i18nNormalizeLineEndingsInICUs = escapedString || this.i18nNormalizeLineEndingsInICUs;

    const parsedTemplate = parseTemplate(templateStr, template.sourceMapUrl, {
      preserveWhitespaces: template.preserveWhitespaces,
      interpolationConfig: template.interpolationConfig,
      range: templateRange ?? undefined,
      escapedString,
      enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
      i18nNormalizeLineEndingsInICUs,
      isInline: template.isInline,
      alwaysAttemptHtmlToR3AstConversion: this.usePoisonedData,
    });

    // Unfortunately, the primary parse of the template above may not contain accurate source map
    // information. If used directly, it would result in incorrect code locations in template
    // errors, etc. There are three main problems:
    //
    // 1. `preserveWhitespaces: false` annihilates the correctness of template source mapping, as
    //    the whitespace transformation changes the contents of HTML text nodes before they're
    //    parsed into Angular expressions.
    // 2. `preserveLineEndings: false` causes growing misalignments in templates that use '\r\n'
    //    line endings, by normalizing them to '\n'.
    // 3. By default, the template parser strips leading trivia characters (like spaces, tabs, and
    //    newlines). This also destroys source mapping information.
    //
    // In order to guarantee the correctness of diagnostics, templates are parsed a second time
    // with the above options set to preserve source mappings.

    const {nodes: diagNodes} = parseTemplate(templateStr, template.sourceMapUrl, {
      preserveWhitespaces: true,
      preserveLineEndings: true,
      interpolationConfig: template.interpolationConfig,
      range: templateRange ?? undefined,
      escapedString,
      enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
      i18nNormalizeLineEndingsInICUs,
      leadingTriviaChars: [],
      isInline: template.isInline,
      alwaysAttemptHtmlToR3AstConversion: this.usePoisonedData,
    });

    return {
      ...parsedTemplate,
      diagNodes,
      template: template.isInline ? new WrappedNodeExpr(template.expression) : templateStr,
      templateUrl: template.resolvedTemplateUrl,
      isInline: template.isInline,
      file: new ParseSourceFile(templateStr, template.resolvedTemplateUrl),
    };
  }

  private parseTemplateDeclaration(
      decorator: Decorator, component: Map<string, ts.Expression>,
      containingFile: string): TemplateDeclaration {
    let preserveWhitespaces: boolean = this.defaultPreserveWhitespaces;
    if (component.has('preserveWhitespaces')) {
      const expr = component.get('preserveWhitespaces')!;
      const value = this.evaluator.evaluate(expr);
      if (typeof value !== 'boolean') {
        throw createValueHasWrongTypeError(expr, value, 'preserveWhitespaces must be a boolean');
      }
      preserveWhitespaces = value;
    }

    let interpolationConfig = DEFAULT_INTERPOLATION_CONFIG;
    if (component.has('interpolation')) {
      const expr = component.get('interpolation')!;
      const value = this.evaluator.evaluate(expr);
      if (!Array.isArray(value) || value.length !== 2 ||
          !value.every(element => typeof element === 'string')) {
        throw createValueHasWrongTypeError(
            expr, value, 'interpolation must be an array with 2 elements of string type');
      }
      interpolationConfig = InterpolationConfig.fromArray(value as [string, string]);
    }

    if (component.has('templateUrl')) {
      const templateUrlExpr = component.get('templateUrl')!;
      const templateUrl = this.evaluator.evaluate(templateUrlExpr);
      if (typeof templateUrl !== 'string') {
        throw createValueHasWrongTypeError(
            templateUrlExpr, templateUrl, 'templateUrl must be a string');
      }
      const resourceUrl = this._resolveResourceOrThrow(
          templateUrl, containingFile, templateUrlExpr, ResourceTypeForDiagnostics.Template);

      return {
        isInline: false,
        interpolationConfig,
        preserveWhitespaces,
        templateUrl,
        templateUrlExpression: templateUrlExpr,
        resolvedTemplateUrl: resourceUrl,
        sourceMapUrl: sourceMapUrl(resourceUrl),
      };
    } else if (component.has('template')) {
      return {
        isInline: true,
        interpolationConfig,
        preserveWhitespaces,
        expression: component.get('template')!,
        templateUrl: containingFile,
        resolvedTemplateUrl: containingFile,
        sourceMapUrl: containingFile,
      };
    } else {
      throw new FatalDiagnosticError(
          ErrorCode.COMPONENT_MISSING_TEMPLATE, Decorator.nodeForError(decorator),
          'component is missing a template');
    }
  }

  private _resolveImportedFile(importedFile: ImportedFile, expr: Expression, origin: ts.SourceFile):
      ts.SourceFile|null {
    // If `importedFile` is not 'unknown' then it accurately reflects the source file that is
    // being imported.
    if (importedFile !== 'unknown') {
      return importedFile;
    }

    // Otherwise `expr` has to be inspected to determine the file that is being imported. If `expr`
    // is not an `ExternalExpr` then it does not correspond with an import, so return null in that
    // case.
    if (!(expr instanceof ExternalExpr)) {
      return null;
    }

    // Figure out what file is being imported.
    return this.moduleResolver.resolveModule(expr.value.moduleName!, origin.fileName);
  }

  /**
   * Check whether adding an import from `origin` to the source-file corresponding to `expr` would
   * create a cyclic import.
   *
   * @returns a `Cycle` object if a cycle would be created, otherwise `null`.
   */
  private _checkForCyclicImport(
      importedFile: ImportedFile, expr: Expression, origin: ts.SourceFile): Cycle|null {
    const imported = this._resolveImportedFile(importedFile, expr, origin);
    if (imported === null) {
      return null;
    }
    // Check whether the import is legal.
    return this.cycleAnalyzer.wouldCreateCycle(origin, imported);
  }

  private _recordSyntheticImport(
      importedFile: ImportedFile, expr: Expression, origin: ts.SourceFile): void {
    const imported = this._resolveImportedFile(importedFile, expr, origin);
    if (imported === null) {
      return;
    }

    this.cycleAnalyzer.recordSyntheticImport(origin, imported);
  }

  /**
   * Resolve the url of a resource relative to the file that contains the reference to it.
   *
   * Throws a FatalDiagnosticError when unable to resolve the file.
   */
  private _resolveResourceOrThrow(
      file: string, basePath: string, nodeForError: ts.Node,
      resourceType: ResourceTypeForDiagnostics): string {
    try {
      return this.resourceLoader.resolve(file, basePath);
    } catch (e) {
      let errorText: string;
      switch (resourceType) {
        case ResourceTypeForDiagnostics.Template:
          errorText = `Could not find template file '${file}'.`;
          break;
        case ResourceTypeForDiagnostics.StylesheetFromTemplate:
          errorText = `Could not find stylesheet file '${file}' linked from the template.`;
          break;
        case ResourceTypeForDiagnostics.StylesheetFromDecorator:
          errorText = `Could not find stylesheet file '${file}'.`;
          break;
      }

      throw new FatalDiagnosticError(
          ErrorCode.COMPONENT_RESOURCE_NOT_FOUND, nodeForError, errorText);
    }
  }

  private _extractTemplateStyleUrls(template: ParsedTemplateWithSource): StyleUrlMeta[] {
    if (template.styleUrls === null) {
      return [];
    }

    const nodeForError = getTemplateDeclarationNodeForError(template.declaration);
    return template.styleUrls.map(
        url => ({url, source: ResourceTypeForDiagnostics.StylesheetFromTemplate, nodeForError}));
  }
}

function getTemplateRange(templateExpr: ts.Expression) {
  const startPos = templateExpr.getStart() + 1;
  const {line, character} =
      ts.getLineAndCharacterOfPosition(templateExpr.getSourceFile(), startPos);
  return {
    startPos,
    startLine: line,
    startCol: character,
    endPos: templateExpr.getEnd() - 1,
  };
}

function sourceMapUrl(resourceUrl: string): string {
  if (!tsSourceMapBug29300Fixed()) {
    // By removing the template URL we are telling the translator not to try to
    // map the external source file to the generated code, since the version
    // of TS that is running does not support it.
    return '';
  } else {
    return resourceUrl;
  }
}

/** Determines if the result of an evaluation is a string array. */
function isStringArray(resolvedValue: ResolvedValue): resolvedValue is string[] {
  return Array.isArray(resolvedValue) && resolvedValue.every(elem => typeof elem === 'string');
}

/** Determines the node to use for debugging purposes for the given TemplateDeclaration. */
function getTemplateDeclarationNodeForError(declaration: TemplateDeclaration): ts.Node {
  // TODO(zarend): Change this to if/else when that is compatible with g3. This uses a switch
  // because if/else fails to compile on g3. That is because g3 compiles this in non-strict mode
  // where type inference does not work correctly.
  switch (declaration.isInline) {
    case true:
      return declaration.expression;
    case false:
      return declaration.templateUrlExpression;
  }
}

/**
 * Information about the template which was extracted during parsing.
 *
 * This contains the actual parsed template as well as any metadata collected during its parsing,
 * some of which might be useful for re-parsing the template with different options.
 */
export interface ParsedComponentTemplate extends ParsedTemplate {
  /**
   * True if the original template was stored inline;
   * False if the template was in an external file.
   */
  isInline: boolean;

  /**
   * The template AST, parsed in a manner which preserves source map information for diagnostics.
   *
   * Not useful for emit.
   */
  diagNodes: TmplAstNode[];

  /**
   * The `ParseSourceFile` for the template.
   */
  file: ParseSourceFile;
}

export interface ParsedTemplateWithSource extends ParsedComponentTemplate {
  sourceMapping: TemplateSourceMapping;
  declaration: TemplateDeclaration;
}

/**
 * Common fields extracted from the declaration of a template.
 */
interface CommonTemplateDeclaration {
  preserveWhitespaces: boolean;
  interpolationConfig: InterpolationConfig;
  templateUrl: string;
  resolvedTemplateUrl: string;
  sourceMapUrl: string;
}

/**
 * Information extracted from the declaration of an inline template.
 */
interface InlineTemplateDeclaration extends CommonTemplateDeclaration {
  isInline: true;
  expression: ts.Expression;
}

/**
 * Information extracted from the declaration of an external template.
 */
interface ExternalTemplateDeclaration extends CommonTemplateDeclaration {
  isInline: false;
  templateUrlExpression: ts.Expression;
}

/**
 * The declaration of a template extracted from a component decorator.
 *
 * This data is extracted and stored separately to faciliate re-interpreting the template
 * declaration whenever the compiler is notified of a change to a template file. With this
 * information, `ComponentDecoratorHandler` is able to re-read the template and update the component
 * record without needing to parse the original decorator again.
 */
type TemplateDeclaration = InlineTemplateDeclaration|ExternalTemplateDeclaration;

/**
 * Generate a diagnostic related information object that describes a potential cyclic import path.
 */
function makeCyclicImportInfo(
    ref: Reference, type: string, cycle: Cycle): ts.DiagnosticRelatedInformation {
  const name = ref.debugName || '(unknown)';
  const path = cycle.getPath().map(sf => sf.fileName).join(' -> ');
  const message =
      `The ${type} '${name}' is used in the template but importing it would create a cycle: `;
  return makeRelatedInformation(ref.node, message + path);
}
