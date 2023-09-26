/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationTriggerNames, BoundTarget, compileClassDebugInfo, compileClassMetadata, compileComponentClassMetadata, compileComponentFromMetadata, compileDeclareClassMetadata, compileDeclareComponentFromMetadata, ConstantPool, CssSelector, DeclarationListEmitMode, DeclareComponentTemplateInfo, DEFAULT_INTERPOLATION_CONFIG, DomElementSchemaRegistry, Expression, FactoryTarget, makeBindingParser, R3ComponentMetadata, R3DeferBlockTemplateDependency, R3DirectiveDependencyMetadata, R3NgModuleDependencyMetadata, R3PipeDependencyMetadata, R3TargetBinder, R3TemplateDependency, R3TemplateDependencyKind, R3TemplateDependencyMetadata, SchemaMetadata, SelectorMatcher, TmplAstDeferredBlock, TmplAstDeferredBlockTriggers, TmplAstDeferredTrigger, TmplAstElement, ViewEncapsulation, WrappedNodeExpr} from '@angular/compiler';
import ts from 'typescript';

import {Cycle, CycleAnalyzer, CycleHandlingStrategy} from '../../../cycles';
import {ErrorCode, FatalDiagnosticError, makeDiagnostic, makeRelatedInformation} from '../../../diagnostics';
import {absoluteFrom, relative} from '../../../file_system';
import {assertSuccessfulReferenceEmit, DeferredSymbolTracker, ImportedFile, ModuleResolver, Reference, ReferenceEmitter} from '../../../imports';
import {DependencyTracker} from '../../../incremental/api';
import {extractSemanticTypeParameters, SemanticDepGraphUpdater} from '../../../incremental/semantic_graph';
import {IndexingContext} from '../../../indexer';
import {DirectiveMeta, extractDirectiveTypeCheckMeta, HostDirectivesResolver, MatchSource, MetadataReader, MetadataRegistry, MetaKind, PipeMeta, ResourceRegistry} from '../../../metadata';
import {PartialEvaluator} from '../../../partial_evaluator';
import {PerfEvent, PerfRecorder} from '../../../perf';
import {ClassDeclaration, DeclarationNode, Decorator, isNamedClassDeclaration, ReflectionHost, reflectObjectLiteral} from '../../../reflection';
import {ComponentScopeKind, ComponentScopeReader, DtsModuleScopeResolver, LocalModuleScopeRegistry, makeNotStandaloneDiagnostic, makeUnknownComponentImportDiagnostic, TypeCheckScopeRegistry} from '../../../scope';
import {AnalysisOutput, CompilationMode, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence, ResolveResult} from '../../../transform';
import {TypeCheckableDirectiveMeta, TypeCheckContext} from '../../../typecheck/api';
import {ExtendedTemplateChecker} from '../../../typecheck/extended/api';
import {getSourceFile} from '../../../util/src/typescript';
import {Xi18nContext} from '../../../xi18n';
import {combineResolvers, compileDeclareFactory, compileInputTransformFields, compileNgFactoryDefField, compileResults, extractClassDebugInfo, extractClassMetadata, extractSchemas, findAngularDecorator, forwardRefResolver, getDirectiveDiagnostics, getProviderDiagnostics, InjectableClassRegistry, isExpressionForwardReference, readBaseClass, ReferencesRegistry, removeIdentifierReferences, resolveEncapsulationEnumValueLocally, resolveEnumValue, resolveImportedFile, resolveLiteral, resolveProvidersRequiringFactory, ResourceLoader, toFactoryMetadata, tryUnwrapForwardRef, validateHostDirectives, wrapFunctionExpressionsInParens} from '../../common';
import {extractDirectiveMetadata, parseDirectiveStyles} from '../../directive';
import {createModuleWithProvidersResolver, NgModuleSymbol} from '../../ng_module';

import {checkCustomElementSelectorForErrors, makeCyclicImportInfo} from './diagnostics';
import {ComponentAnalysisData, ComponentResolutionData} from './metadata';
import {_extractTemplateStyleUrls, extractComponentStyleUrls, extractStyleResources, extractTemplate, makeResourceNotFoundError, ParsedTemplateWithSource, parseTemplateDeclaration, preloadAndParseTemplate, ResourceTypeForDiagnostics, StyleUrlMeta, transformDecoratorResources} from './resources';
import {ComponentSymbol} from './symbol';
import {animationTriggerResolver, collectAnimationNames, validateAndFlattenComponentImports} from './util';

const EMPTY_ARRAY: any[] = [];

type UsedDirective =
    R3DirectiveDependencyMetadata&{ref: Reference<ClassDeclaration>, importedFile: ImportedFile};

type UsedPipe = R3PipeDependencyMetadata&{
  ref: Reference<ClassDeclaration>,
  importedFile: ImportedFile,
};

type UsedNgModule = R3NgModuleDependencyMetadata&{
  importedFile: ImportedFile,
};

type AnyUsedType = UsedPipe|UsedDirective|UsedNgModule;

const isUsedDirective = (decl: AnyUsedType): decl is UsedDirective =>
    decl.kind === R3TemplateDependencyKind.Directive;

const isUsedPipe = (decl: AnyUsedType): decl is UsedPipe =>
    decl.kind === R3TemplateDependencyKind.Pipe;

/**
 * `DecoratorHandler` which handles the `@Component` annotation.
 */
export class ComponentDecoratorHandler implements
    DecoratorHandler<Decorator, ComponentAnalysisData, ComponentSymbol, ComponentResolutionData> {
  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private metaRegistry: MetadataRegistry, private metaReader: MetadataReader,
      private scopeReader: ComponentScopeReader, private dtsScopeReader: DtsModuleScopeResolver,
      private scopeRegistry: LocalModuleScopeRegistry,
      private typeCheckScopeRegistry: TypeCheckScopeRegistry,
      private resourceRegistry: ResourceRegistry, private isCore: boolean,
      private strictCtorDeps: boolean, private resourceLoader: ResourceLoader,
      private rootDirs: ReadonlyArray<string>, private defaultPreserveWhitespaces: boolean,
      private i18nUseExternalIds: boolean, private enableI18nLegacyMessageIdFormat: boolean,
      private usePoisonedData: boolean, private i18nNormalizeLineEndingsInICUs: boolean,
      private moduleResolver: ModuleResolver, private cycleAnalyzer: CycleAnalyzer,
      private cycleHandlingStrategy: CycleHandlingStrategy, private refEmitter: ReferenceEmitter,
      private referencesRegistry: ReferencesRegistry, private depTracker: DependencyTracker|null,
      private injectableRegistry: InjectableClassRegistry,
      private semanticDepGraphUpdater: SemanticDepGraphUpdater|null,
      private annotateForClosureCompiler: boolean, private perf: PerfRecorder,
      private hostDirectivesResolver: HostDirectivesResolver, private includeClassMetadata: boolean,
      private readonly compilationMode: CompilationMode,
      private readonly deferredSymbolTracker: DeferredSymbolTracker) {
    this.extractTemplateOptions = {
      enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
      i18nNormalizeLineEndingsInICUs: this.i18nNormalizeLineEndingsInICUs,
      usePoisonedData: this.usePoisonedData,
    };
  }

  private literalCache = new Map<Decorator, ts.ObjectLiteralExpression>();
  private elementSchemaRegistry = new DomElementSchemaRegistry();

  /**
   * During the asynchronous preanalyze phase, it's necessary to parse the template to extract
   * any potential <link> tags which might need to be loaded. This cache ensures that work is not
   * thrown away, and the parsed template is reused during the analyze phase.
   */
  private preanalyzeTemplateCache = new Map<DeclarationNode, ParsedTemplateWithSource>();
  private preanalyzeStylesCache = new Map<DeclarationNode, string[]|null>();

  private extractTemplateOptions: {
    enableI18nLegacyMessageIdFormat: boolean,
    i18nNormalizeLineEndingsInICUs: boolean,
    usePoisonedData: boolean,
  };

  readonly precedence = HandlerPrecedence.PRIMARY;
  readonly name = 'ComponentDecoratorHandler';


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

    const meta = resolveLiteral(decorator, this.literalCache);
    const component = reflectObjectLiteral(meta);
    const containingFile = node.getSourceFile().fileName;

    const resolveStyleUrl = (styleUrl: string): Promise<void>|undefined => {
      try {
        const resourceUrl = this.resourceLoader.resolve(styleUrl, containingFile);
        return this.resourceLoader.preload(resourceUrl, {type: 'style', containingFile});
      } catch {
        // Don't worry about failures to preload. We can handle this problem during analysis by
        // producing a diagnostic.
        return undefined;
      }
    };

    // A Promise that waits for the template and all <link>ed styles within it to be preloaded.
    const templateAndTemplateStyleResources =
        preloadAndParseTemplate(
            this.evaluator, this.resourceLoader, this.depTracker, this.preanalyzeTemplateCache,
            node, decorator, component, containingFile, this.defaultPreserveWhitespaces,
            this.extractTemplateOptions, this.compilationMode)
            .then((template: ParsedTemplateWithSource|null): Promise<void>|undefined => {
              if (template === null) {
                return undefined;
              }

              return Promise.all(template.styleUrls.map(styleUrl => resolveStyleUrl(styleUrl)))
                  .then(() => undefined);
            });

    // Extract all the styleUrls in the decorator.
    const componentStyleUrls = extractComponentStyleUrls(this.evaluator, component);

    // Extract inline styles, process, and cache for use in synchronous analyze phase
    let inlineStyles;
    if (component.has('styles')) {
      const litStyles = parseDirectiveStyles(component, this.evaluator, this.compilationMode);
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
    } else {
      this.preanalyzeStylesCache.set(node, null);
    }

    // Wait for both the template and all styleUrl resources to resolve.
    return Promise
        .all([
          templateAndTemplateStyleResources, inlineStyles,
          ...componentStyleUrls.map(styleUrl => resolveStyleUrl(styleUrl.url))
        ])
        .then(() => undefined);
  }

  analyze(node: ClassDeclaration, decorator: Readonly<Decorator>):
      AnalysisOutput<ComponentAnalysisData> {
    this.perf.eventCount(PerfEvent.AnalyzeComponent);
    const containingFile = node.getSourceFile().fileName;
    this.literalCache.delete(decorator);

    let diagnostics: ts.Diagnostic[]|undefined;
    let isPoisoned = false;
    // @Component inherits @Directive, so begin by extracting the @Directive metadata and building
    // on it.
    const directiveResult = extractDirectiveMetadata(
        node, decorator, this.reflector, this.evaluator, this.refEmitter, this.referencesRegistry,
        this.isCore, this.annotateForClosureCompiler, this.compilationMode,
        this.elementSchemaRegistry.getDefaultComponentElementName());
    if (directiveResult === undefined) {
      // `extractDirectiveMetadata` returns undefined when the @Directive has `jit: true`. In this
      // case, compilation of the decorator is skipped. Returning an empty object signifies
      // that no analysis was produced.
      return {};
    }

    // Next, read the `@Component`-specific fields.
    const {decorator: component, metadata, inputs, outputs, hostDirectives, rawHostDirectives} =
        directiveResult;
    const encapsulation: number =
        (this.compilationMode !== CompilationMode.LOCAL ?
             resolveEnumValue(this.evaluator, component, 'encapsulation', 'ViewEncapsulation') :
             resolveEncapsulationEnumValueLocally(component.get('encapsulation'))) ??
        ViewEncapsulation.Emulated;

    let changeDetection: number|Expression|null = null;
    if (this.compilationMode !== CompilationMode.LOCAL) {
      changeDetection =
          resolveEnumValue(this.evaluator, component, 'changeDetection', 'ChangeDetectionStrategy');
    } else if (component.has('changeDetection')) {
      changeDetection = new WrappedNodeExpr(component.get('changeDetection')!);
    }

    let animations: Expression|null = null;
    let animationTriggerNames: AnimationTriggerNames|null = null;
    if (component.has('animations')) {
      const animationExpression = component.get('animations')!;
      animations = new WrappedNodeExpr(animationExpression);
      const animationsValue =
          this.evaluator.evaluate(animationExpression, animationTriggerResolver);
      animationTriggerNames = {includesDynamicAnimations: false, staticTriggerNames: []};
      collectAnimationNames(animationsValue, animationTriggerNames);
    }

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

    let resolvedImports: Reference<ClassDeclaration>[]|null = null;
    let rawImports: ts.Expression|null = component.get('imports') ?? null;

    if (rawImports && !metadata.isStandalone) {
      if (diagnostics === undefined) {
        diagnostics = [];
      }
      diagnostics.push(makeDiagnostic(
          ErrorCode.COMPONENT_NOT_STANDALONE, component.get('imports')!,
          `'imports' is only valid on a component that is standalone.`,
          [makeRelatedInformation(
              node.name, `Did you forget to add 'standalone: true' to this @Component?`)]));
      // Poison the component so that we don't spam further template type-checking errors that
      // result from misconfigured imports.
      isPoisoned = true;
    } else if (this.compilationMode !== CompilationMode.LOCAL && rawImports) {
      const expr = rawImports;
      const importResolvers = combineResolvers([
        createModuleWithProvidersResolver(this.reflector, this.isCore),
        forwardRefResolver,
      ]);
      const imported = this.evaluator.evaluate(expr, importResolvers);
      const {imports: flattened, diagnostics: importDiagnostics} =
          validateAndFlattenComponentImports(imported, expr);

      resolvedImports = flattened;
      rawImports = expr;

      if (importDiagnostics.length > 0) {
        isPoisoned = true;
        if (diagnostics === undefined) {
          diagnostics = [];
        }
        diagnostics.push(...importDiagnostics);
      }
    }

    let schemas: SchemaMetadata[]|null = null;
    if (component.has('schemas') && !metadata.isStandalone) {
      if (diagnostics === undefined) {
        diagnostics = [];
      }
      diagnostics.push(makeDiagnostic(
          ErrorCode.COMPONENT_NOT_STANDALONE, component.get('schemas')!,
          `'schemas' is only valid on a component that is standalone.`));
    } else if (this.compilationMode !== CompilationMode.LOCAL && component.has('schemas')) {
      schemas = extractSchemas(component.get('schemas')!, this.evaluator, 'Component');
    } else if (metadata.isStandalone) {
      schemas = [];
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
      const templateDecl = parseTemplateDeclaration(
          node, decorator, component, containingFile, this.evaluator, this.depTracker,
          this.resourceLoader, this.defaultPreserveWhitespaces);
      template = extractTemplate(
          node, templateDecl, this.evaluator, this.depTracker, this.resourceLoader, {
            enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
            i18nNormalizeLineEndingsInICUs: this.i18nNormalizeLineEndingsInICUs,
            usePoisonedData: this.usePoisonedData,
          },
          this.compilationMode);
    }
    const templateResource =
        template.declaration.isInline ? {path: null, expression: component.get('template')!} : {
          path: absoluteFrom(template.declaration.resolvedTemplateUrl),
          expression: template.sourceMapping.node
        };

    // Figure out the set of styles. The ordering here is important: external resources (styleUrls)
    // precede inline styles, and styles defined in the template override styles defined in the
    // component.
    let styles: string[] = [];

    const styleResources = extractStyleResources(this.resourceLoader, component, containingFile);
    const styleUrls: StyleUrlMeta[] = [
      ...extractComponentStyleUrls(this.evaluator, component),
      ..._extractTemplateStyleUrls(template)
    ];

    for (const styleUrl of styleUrls) {
      try {
        const resourceUrl = this.resourceLoader.resolve(styleUrl.url, containingFile);
        const resourceStr = this.resourceLoader.load(resourceUrl);
        styles.push(resourceStr);
        if (this.depTracker !== null) {
          this.depTracker.addResourceDependency(node.getSourceFile(), absoluteFrom(resourceUrl));
        }
      } catch {
        if (this.depTracker !== null) {
          // The analysis of this file cannot be re-used if one of the style URLs could
          // not be resolved or loaded. Future builds should re-analyze and re-attempt
          // resolution/loading.
          this.depTracker.recordDependencyAnalysisFailure(node.getSourceFile());
        }

        if (diagnostics === undefined) {
          diagnostics = [];
        }
        const resourceType =
            styleUrl.source === ResourceTypeForDiagnostics.StylesheetFromDecorator ?
            ResourceTypeForDiagnostics.StylesheetFromDecorator :
            ResourceTypeForDiagnostics.StylesheetFromTemplate;
        diagnostics.push(
            makeResourceNotFoundError(styleUrl.url, styleUrl.nodeForError, resourceType)
                .toDiagnostic());
      }
    }

    if (encapsulation === ViewEncapsulation.ShadowDom && metadata.selector !== null) {
      const selectorError = checkCustomElementSelectorForErrors(metadata.selector);
      if (selectorError !== null) {
        if (diagnostics === undefined) {
          diagnostics = [];
        }
        diagnostics.push(makeDiagnostic(
            ErrorCode.COMPONENT_INVALID_SHADOW_DOM_SELECTOR, component.get('selector')!,
            selectorError));
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
        const litStyles = parseDirectiveStyles(component, this.evaluator, this.compilationMode);
        if (litStyles !== null) {
          inlineStyles = [...litStyles];
          styles.push(...litStyles);
        }
      }
    }
    if (template.styles.length > 0) {
      styles.push(...template.styles);
    }

    const output: AnalysisOutput<ComponentAnalysisData> = {
      analysis: {
        baseClass: readBaseClass(node, this.reflector, this.evaluator),
        inputs,
        outputs,
        hostDirectives,
        rawHostDirectives,
        meta: {
          ...metadata,
          template: {
            nodes: template.nodes,
            ngContentSelectors: template.ngContentSelectors,
          },
          encapsulation,
          changeDetection,
          interpolation: template.interpolationConfig ?? DEFAULT_INTERPOLATION_CONFIG,
          styles,

          // These will be replaced during the compilation step, after all `NgModule`s have been
          // analyzed and the full compilation scope for the component can be realized.
          animations,
          viewProviders: wrappedViewProviders,
          i18nUseExternalIds: this.i18nUseExternalIds,
          relativeContextFilePath,
          rawImports: rawImports !== null ? new WrappedNodeExpr(rawImports) : undefined,
        },
        typeCheckMeta: extractDirectiveTypeCheckMeta(node, inputs, this.reflector),
        classMetadata: this.includeClassMetadata ?
            extractClassMetadata(
                node, this.reflector, this.isCore, this.annotateForClosureCompiler,
                dec => transformDecoratorResources(dec, component, styles, template)) :
            null,
        classDebugInfo: extractClassDebugInfo(node, this.reflector, this.rootDirs),
        template,
        providersRequiringFactory,
        viewProvidersRequiringFactory,
        inlineStyles,
        styleUrls,
        resources: {
          styles: styleResources,
          template: templateResource,
        },
        isPoisoned,
        animationTriggerNames,
        rawImports,
        resolvedImports,
        schemas,
        decorator: decorator?.node as ts.Decorator | null ?? null,
      },
      diagnostics,
    };

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
      kind: MetaKind.Directive,
      matchSource: MatchSource.Selector,
      ref,
      name: node.name.text,
      selector: analysis.meta.selector,
      exportAs: analysis.meta.exportAs,
      inputs: analysis.inputs,
      outputs: analysis.outputs,
      queries: analysis.meta.queries.map(query => query.propertyName),
      isComponent: true,
      baseClass: analysis.baseClass,
      hostDirectives: analysis.hostDirectives,
      ...analysis.typeCheckMeta,
      isPoisoned: analysis.isPoisoned,
      isStructural: false,
      isStandalone: analysis.meta.isStandalone,
      isSignal: analysis.meta.isSignal,
      imports: analysis.resolvedImports,
      animationTriggerNames: analysis.animationTriggerNames,
      schemas: analysis.schemas,
      decorator: analysis.decorator,
      assumedToExportProviders: false,
    });

    this.resourceRegistry.registerResources(analysis.resources, node);
    this.injectableRegistry.registerInjectable(node, {
      ctorDeps: analysis.meta.deps,
    });
  }

  index(
      context: IndexingContext, node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>) {
    if (analysis.isPoisoned && !this.usePoisonedData) {
      return null;
    }
    const scope = this.scopeReader.getScopeForComponent(node);
    const selector = analysis.meta.selector;
    const matcher = new SelectorMatcher<DirectiveMeta[]>();
    if (scope !== null) {
      let {dependencies, isPoisoned} =
          scope.kind === ComponentScopeKind.NgModule ? scope.compilation : scope;
      if ((isPoisoned ||
           (scope.kind === ComponentScopeKind.NgModule && scope.exported.isPoisoned)) &&
          !this.usePoisonedData) {
        // Don't bother indexing components which had erroneous scopes, unless specifically
        // requested.
        return null;
      }

      for (const dep of dependencies) {
        if (dep.kind === MetaKind.Directive && dep.selector !== null) {
          matcher.addSelectables(
              CssSelector.parse(dep.selector), [...this.hostDirectivesResolver.resolve(dep), dep]);
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
        isInline: analysis.template.declaration.isInline,
        file: analysis.template.file,
      },
    });
    return null;
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

    const binder = new R3TargetBinder<TypeCheckableDirectiveMeta>(scope.matcher);
    ctx.addTemplate(
        new Reference(node), binder, meta.template.diagNodes, scope.pipes, scope.schemas,
        meta.template.sourceMapping, meta.template.file, meta.template.errors,
        meta.meta.isStandalone);
  }

  extendedTemplateCheck(
      component: ts.ClassDeclaration,
      extendedTemplateChecker: ExtendedTemplateChecker): ts.Diagnostic[] {
    return extendedTemplateChecker.getDiagnosticsForComponent(component);
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

    const context = getSourceFile(node);
    const metadata = analysis.meta as Readonly<R3ComponentMetadata<R3TemplateDependencyMetadata>>;


    const data: ComponentResolutionData = {
      declarations: EMPTY_ARRAY,
      declarationListEmitMode: DeclarationListEmitMode.Direct,
      deferBlocks: new Map(),
      deferrableDeclToImportDecl: new Map(),
    };
    const diagnostics: ts.Diagnostic[] = [];

    const scope = this.scopeReader.getScopeForComponent(node);
    if (scope !== null) {
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
      const matcher = new SelectorMatcher<DirectiveMeta[]>();

      const pipes = new Map<string, PipeMeta>();

      const dependencies = scope.kind === ComponentScopeKind.NgModule ?
          scope.compilation.dependencies :
          scope.dependencies;

      for (const dep of dependencies) {
        if (dep.kind === MetaKind.Directive && dep.selector !== null) {
          matcher.addSelectables(CssSelector.parse(dep.selector), [dep]);
        } else if (dep.kind === MetaKind.Pipe) {
          pipes.set(dep.name, dep);
        }
      }

      // Next, the component template AST is bound using the R3TargetBinder. This produces a
      // BoundTarget, which is similar to a ts.TypeChecker.
      const binder = new R3TargetBinder(matcher);
      const bound = binder.bind({template: metadata.template.nodes});

      // Find all defer blocks used in the template and for each block
      // bind its own scope.
      const deferBlocks = new Map<TmplAstDeferredBlock, BoundTarget<DirectiveMeta>>();
      for (const deferBlock of bound.getDeferBlocks()) {
        deferBlocks.set(deferBlock, binder.bind({template: deferBlock.children}));
      }

      // Register all Directives and Pipes used at the top level (outside
      // of any defer blocks), which would be eagerly referenced.
      const eagerlyUsed = new Set<ClassDeclaration>();
      for (const dir of bound.getEagerlyUsedDirectives()) {
        eagerlyUsed.add(dir.ref.node);
      }
      for (const name of bound.getEagerlyUsedPipes()) {
        if (!pipes.has(name)) {
          continue;
        }
        eagerlyUsed.add(pipes.get(name)!.ref.node);
      }

      // Set of Directives and Pipes used across the entire template,
      // including all defer blocks.
      const wholeTemplateUsed = new Set<ClassDeclaration>(eagerlyUsed);
      for (const bound of deferBlocks.values()) {
        for (const dir of bound.getEagerlyUsedDirectives()) {
          wholeTemplateUsed.add(dir.ref.node);
        }
        for (const name of bound.getEagerlyUsedPipes()) {
          if (!pipes.has(name)) {
            continue;
          }
          wholeTemplateUsed.add(pipes.get(name)!.ref.node);
        }
      }

      const declarations = new Map<ClassDeclaration, UsedPipe|UsedDirective|UsedNgModule>();

      // Transform the dependencies list, filtering out unused dependencies.
      for (const dep of dependencies) {
        // Only emit references to each dependency once.
        if (declarations.has(dep.ref.node)) {
          continue;
        }

        switch (dep.kind) {
          case MetaKind.Directive:
            if (!wholeTemplateUsed.has(dep.ref.node) || dep.matchSource !== MatchSource.Selector) {
              continue;
            }
            const dirType = this.refEmitter.emit(dep.ref, context);
            assertSuccessfulReferenceEmit(
                dirType, node.name, dep.isComponent ? 'component' : 'directive');

            declarations.set(dep.ref.node, {
              kind: R3TemplateDependencyKind.Directive,
              ref: dep.ref,
              type: dirType.expression,
              importedFile: dirType.importedFile,
              selector: dep.selector!,
              inputs: dep.inputs.propertyNames,
              outputs: dep.outputs.propertyNames,
              exportAs: dep.exportAs,
              isComponent: dep.isComponent,
            });
            break;
          case MetaKind.Pipe:
            if (!wholeTemplateUsed.has(dep.ref.node)) {
              continue;
            }

            const pipeType = this.refEmitter.emit(dep.ref, context);
            assertSuccessfulReferenceEmit(pipeType, node.name, 'pipe');

            declarations.set(dep.ref.node, {
              kind: R3TemplateDependencyKind.Pipe,
              type: pipeType.expression,
              name: dep.name,
              ref: dep.ref,
              importedFile: pipeType.importedFile,
            });
            break;
          case MetaKind.NgModule:
            const ngModuleType = this.refEmitter.emit(dep.ref, context);
            assertSuccessfulReferenceEmit(ngModuleType, node.name, 'NgModule');

            declarations.set(dep.ref.node, {
              kind: R3TemplateDependencyKind.NgModule,
              type: ngModuleType.expression,
              importedFile: ngModuleType.importedFile,
            });
            break;
        }
      }

      const getSemanticReference = (decl: UsedDirective|UsedPipe) =>
          this.semanticDepGraphUpdater!.getSemanticReference(decl.ref.node, decl.type);

      if (this.semanticDepGraphUpdater !== null) {
        symbol.usedDirectives =
            Array.from(declarations.values()).filter(isUsedDirective).map(getSemanticReference);
        symbol.usedPipes =
            Array.from(declarations.values()).filter(isUsedPipe).map(getSemanticReference);
      }

      const eagerDeclarations = Array.from(declarations.values())
                                    .filter(
                                        decl => decl.kind === R3TemplateDependencyKind.NgModule ||
                                            eagerlyUsed.has(decl.ref.node));

      // Process information related to defer blocks
      this.resolveDeferBlocks(deferBlocks, declarations, data, analysis, eagerlyUsed, bound);

      const cyclesFromDirectives = new Map<UsedDirective, Cycle>();
      const cyclesFromPipes = new Map<UsedPipe, Cycle>();

      // Scan through the directives/pipes actually used in the template and check whether any
      // import which needs to be generated would create a cycle. This check is skipped for
      // standalone components as the dependencies of a standalone component have already been
      // imported directly by the user, so Angular won't introduce any imports that aren't already
      // in the user's program.
      if (!metadata.isStandalone) {
        for (const usedDep of eagerDeclarations) {
          const cycle = this._checkForCyclicImport(usedDep.importedFile, usedDep.type, context);
          if (cycle !== null) {
            switch (usedDep.kind) {
              case R3TemplateDependencyKind.Directive:
                cyclesFromDirectives.set(usedDep, cycle);
                break;
              case R3TemplateDependencyKind.Pipe:
                cyclesFromPipes.set(usedDep, cycle);
                break;
            }
          }
        }
      }
      // Check whether any usages of standalone components in imports requires the dependencies
      // array to be wrapped in a closure. This check is technically a heuristic as there's no
      // direct way to check whether a `Reference` came from a `forwardRef`. Instead, we check if
      // the reference is `synthetic`, implying it came from _any_ foreign function resolver,
      // including the `forwardRef` resolver.
      const standaloneImportMayBeForwardDeclared =
          analysis.resolvedImports !== null && analysis.resolvedImports.some(ref => ref.synthetic);

      const cycleDetected = cyclesFromDirectives.size !== 0 || cyclesFromPipes.size !== 0;
      if (!cycleDetected) {
        // No cycle was detected. Record the imports that need to be created in the cycle detector
        // so that future cyclic import checks consider their production.
        for (const {type, importedFile} of eagerDeclarations) {
          this.maybeRecordSyntheticImport(importedFile, type, context);
        }

        // Check whether the dependencies arrays in ɵcmp need to be wrapped in a closure.
        // This is required if any dependency reference is to a declaration in the same file
        // but declared after this component.
        const declarationIsForwardDeclared = eagerDeclarations.some(
            decl => isExpressionForwardReference(decl.type, node.name, context));

        const wrapDirectivesAndPipesInClosure =
            declarationIsForwardDeclared || standaloneImportMayBeForwardDeclared;

        data.declarations = eagerDeclarations;
        data.declarationListEmitMode = wrapDirectivesAndPipesInClosure ?
            DeclarationListEmitMode.Closure :
            DeclarationListEmitMode.Direct;
      } else {
        if (this.cycleHandlingStrategy === CycleHandlingStrategy.UseRemoteScoping) {
          // Declaring the directiveDefs/pipeDefs arrays directly would require imports that would
          // create a cycle. Instead, mark this component as requiring remote scoping, so that the
          // NgModule file will take care of setting the directives for the component.
          this.scopeRegistry.setComponentRemoteScope(
              node, eagerDeclarations.filter(isUsedDirective).map(dir => dir.ref),
              eagerDeclarations.filter(isUsedPipe).map(pipe => pipe.ref));
          symbol.isRemotelyScoped = true;

          // If a semantic graph is being tracked, record the fact that this component is remotely
          // scoped with the declaring NgModule symbol as the NgModule's emit becomes dependent on
          // the directive/pipe usages of this component.
          if (this.semanticDepGraphUpdater !== null && scope.kind === ComponentScopeKind.NgModule &&
              scope.ngModule !== null) {
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
    } else {
      // If there is no scope, we can still use the binder to retrieve
      // *some* information about the deferred blocks.
      const directivelessBinder = new R3TargetBinder<DirectiveMeta>(new SelectorMatcher());
      const bound = directivelessBinder.bind({template: metadata.template.nodes});
      const deferredBlocks = bound.getDeferBlocks();
      const triggerElements = new Map<TmplAstDeferredTrigger, TmplAstElement|null>();

      for (const block of deferredBlocks) {
        this.resolveDeferTriggers(block, block.triggers, bound, triggerElements);
        this.resolveDeferTriggers(block, block.prefetchTriggers, bound, triggerElements);
        // We can't determine the dependencies without a scope so we leave them empty.
        data.deferBlocks.set(block, {deps: [], triggerElements});
      }
    }

    if (analysis.resolvedImports !== null && analysis.rawImports !== null) {
      const standaloneDiagnostics = validateStandaloneImports(
          analysis.resolvedImports, analysis.rawImports, this.metaReader, this.scopeReader);
      diagnostics.push(...standaloneDiagnostics);
    }

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
        node, this.injectableRegistry, this.evaluator, this.reflector, this.scopeRegistry,
        this.strictCtorDeps, 'Component');
    if (directiveDiagnostics !== null) {
      diagnostics.push(...directiveDiagnostics);
    }

    const hostDirectivesDiagnotics = analysis.hostDirectives && analysis.rawHostDirectives ?
        validateHostDirectives(
            analysis.rawHostDirectives, analysis.hostDirectives, this.metaReader) :
        null;
    if (hostDirectivesDiagnotics !== null) {
      diagnostics.push(...hostDirectivesDiagnotics);
    }

    if (diagnostics.length > 0) {
      return {diagnostics};
    }

    return {data};
  }

  xi18n(ctx: Xi18nContext, node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>):
      void {
    ctx.updateFromTemplate(
        analysis.template.content, analysis.template.declaration.resolvedTemplateUrl,
        analysis.template.interpolationConfig ?? DEFAULT_INTERPOLATION_CONFIG);
  }

  updateResources(node: ClassDeclaration, analysis: ComponentAnalysisData): void {
    const containingFile = node.getSourceFile().fileName;

    // If the template is external, re-parse it.
    const templateDecl = analysis.template.declaration;
    if (!templateDecl.isInline) {
      analysis.template = extractTemplate(
          node, templateDecl, this.evaluator, this.depTracker, this.resourceLoader,
          this.extractTemplateOptions, this.compilationMode);
    }

    // Update any external stylesheets and rebuild the combined 'styles' list.
    // TODO(alxhub): write tests for styles when the primary compiler uses the updateResources
    // path
    let styles: string[] = [];
    if (analysis.styleUrls !== null) {
      for (const styleUrl of analysis.styleUrls) {
        try {
          const resolvedStyleUrl = this.resourceLoader.resolve(styleUrl.url, containingFile);
          const styleText = this.resourceLoader.load(resolvedStyleUrl);
          styles.push(styleText);
        } catch (e) {
          // Resource resolve failures should already be in the diagnostics list from the analyze
          // stage. We do not need to do anything with them when updating resources.
        }
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

    analysis.meta.styles = styles.filter(s => s.trim().length > 0);
  }

  compileFull(
      node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>,
      resolution: Readonly<ComponentResolutionData>, pool: ConstantPool): CompileResult[] {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return [];
    }

    // Deferrable symbol name -> corresponding import path.
    const deferrableTypes = new Map<string, string>();

    // Go over all dependencies of all defer blocks and update the value of
    // the `isDeferrable` flag and the `importPath` to reflect the current
    // state after visiting all components during the `resolve` phase.
    for (const [_, metadata] of resolution.deferBlocks) {
      for (const deferBlockDep of metadata.deps) {
        const dep = deferBlockDep as unknown as {classDeclaration: ts.ClassDeclaration};
        const classDecl = dep.classDeclaration as unknown as Expression;
        const importDecl = resolution.deferrableDeclToImportDecl.get(classDecl) as unknown as
                ts.ImportDeclaration ??
            null;
        if (importDecl && this.deferredSymbolTracker.canDefer(importDecl)) {
          deferBlockDep.isDeferrable = true;
          deferBlockDep.importPath = (importDecl.moduleSpecifier as ts.StringLiteral).text;

          deferrableTypes.set(deferBlockDep.symbolName, deferBlockDep.importPath);
        }
      }
    }

    const meta: R3ComponentMetadata<R3TemplateDependency> = {...analysis.meta, ...resolution};
    const fac = compileNgFactoryDefField(toFactoryMetadata(meta, FactoryTarget.Component));

    if (analysis.classMetadata) {
      // Drop references to existing imports for deferrable symbols that should be present
      // in the `setClassMetadataAsync` call. Otherwise, an import declaration gets retained.
      const deferrableSymbols = new Set(deferrableTypes.keys());
      const rewrittenDecoratorsNode = removeIdentifierReferences(
          (analysis.classMetadata.decorators as WrappedNodeExpr<ts.Node>).node, deferrableSymbols);
      analysis.classMetadata.decorators = new WrappedNodeExpr(rewrittenDecoratorsNode);
    }

    const def = compileComponentFromMetadata(meta, pool, makeBindingParser());
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata = analysis.classMetadata !== null ?
        compileComponentClassMetadata(analysis.classMetadata, deferrableTypes).toStmt() :
        null;
    const debugInfo = analysis.classDebugInfo !== null ?
        compileClassDebugInfo(analysis.classDebugInfo).toStmt() :
        null;
    const deferrableImports = this.deferredSymbolTracker.getDeferrableImportDecls();
    return compileResults(
        fac, def, classMetadata, 'ɵcmp', inputTransformFields, deferrableImports, debugInfo);
  }

  compilePartial(
      node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>,
      resolution: Readonly<ComponentResolutionData>): CompileResult[] {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return [];
    }
    const templateInfo: DeclareComponentTemplateInfo = {
      content: analysis.template.content,
      sourceUrl: analysis.template.declaration.resolvedTemplateUrl,
      isInline: analysis.template.declaration.isInline,
      inlineTemplateLiteralExpression: analysis.template.sourceMapping.type === 'direct' ?
          new WrappedNodeExpr(analysis.template.sourceMapping.node) :
          null,
    };
    const meta:
        R3ComponentMetadata<R3TemplateDependencyMetadata> = {...analysis.meta, ...resolution};
    const fac = compileDeclareFactory(toFactoryMetadata(meta, FactoryTarget.Component));
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const def = compileDeclareComponentFromMetadata(meta, analysis.template, templateInfo);
    const classMetadata = analysis.classMetadata !== null ?
        compileDeclareClassMetadata(analysis.classMetadata).toStmt() :
        null;

    return compileResults(
        fac, def, classMetadata, 'ɵcmp', inputTransformFields, null /* deferrableImports */);
  }

  compileLocal(
      node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>,
      pool: ConstantPool): CompileResult[] {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return [];
    }

    const meta: R3ComponentMetadata<R3TemplateDependency> = {
      ...analysis.meta,
      declarationListEmitMode: (!analysis.meta.isStandalone || analysis.rawImports !== null) ?
          DeclarationListEmitMode.RuntimeResolved :
          DeclarationListEmitMode.Direct,
      declarations: EMPTY_ARRAY,
      deferBlocks: new Map(),
      deferrableDeclToImportDecl: new Map(),
    };

    const fac = compileNgFactoryDefField(toFactoryMetadata(meta, FactoryTarget.Component));
    const def = compileComponentFromMetadata(meta, pool, makeBindingParser());
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata = analysis.classMetadata !== null ?
        compileClassMetadata(analysis.classMetadata).toStmt() :
        null;
    const debugInfo = analysis.classDebugInfo !== null ?
        compileClassDebugInfo(analysis.classDebugInfo).toStmt() :
        null;
    return compileResults(
        fac, def, classMetadata, 'ɵcmp', inputTransformFields, null /* deferrableImports */,
        debugInfo);
  }

  /**
   * Check whether adding an import from `origin` to the source-file corresponding to `expr` would
   * create a cyclic import.
   *
   * @returns a `Cycle` object if a cycle would be created, otherwise `null`.
   */
  private _checkForCyclicImport(
      importedFile: ImportedFile, expr: Expression, origin: ts.SourceFile): Cycle|null {
    const imported = resolveImportedFile(this.moduleResolver, importedFile, expr, origin);
    if (imported === null) {
      return null;
    }
    // Check whether the import is legal.
    return this.cycleAnalyzer.wouldCreateCycle(origin, imported);
  }

  private maybeRecordSyntheticImport(
      importedFile: ImportedFile, expr: Expression, origin: ts.SourceFile): void {
    const imported = resolveImportedFile(this.moduleResolver, importedFile, expr, origin);
    if (imported === null) {
      return;
    }

    this.cycleAnalyzer.recordSyntheticImport(origin, imported);
  }

  /**
   * Resolves information about defer blocks dependencies to make it
   * available for the final `compile` step.
   */
  private resolveDeferBlocks(
      deferBlocks: Map<TmplAstDeferredBlock, BoundTarget<DirectiveMeta>>,
      deferrableDecls: Map<ClassDeclaration, AnyUsedType>,
      resolutionData: ComponentResolutionData,
      analysisData: Readonly<ComponentAnalysisData>,
      eagerlyUsedDecls: Set<ClassDeclaration>,
      componentBoundTarget: BoundTarget<DirectiveMeta>,
  ) {
    // Collect all deferred decls from all defer blocks from the entire template
    // to intersect with the information from the `imports` field of a particular
    // Component.
    const allDeferredDecls = new Set<ClassDeclaration>();

    for (const [deferBlock, bound] of deferBlocks) {
      const usedDirectives = new Set(bound.getEagerlyUsedDirectives().map(d => d.ref.node));
      const usedPipes = new Set(bound.getEagerlyUsedPipes());
      const deps: Array<R3DeferBlockTemplateDependency&{classDeclaration: ts.ClassDeclaration}> =
          [];
      const triggerElements = new Map<TmplAstDeferredTrigger, TmplAstElement|null>();

      for (const decl of Array.from(deferrableDecls.values())) {
        if (decl.kind === R3TemplateDependencyKind.NgModule) {
          continue;
        }
        if (decl.kind === R3TemplateDependencyKind.Directive &&
            !usedDirectives.has(decl.ref.node)) {
          continue;
        }
        if (decl.kind === R3TemplateDependencyKind.Pipe && !usedPipes.has(decl.name)) {
          continue;
        }
        // Collect initial information about this dependency.
        // The `isDeferrable` flag and the `importPath` info would be
        // added later during the `compile` step.
        deps.push({
          type: decl.type as WrappedNodeExpr<ts.Identifier>,
          symbolName: decl.ref.node.name.escapedText as string,
          isDeferrable: false,
          importPath: null,
          // Extra info to match corresponding import during the `compile` phase.
          classDeclaration: decl.ref.node as ts.ClassDeclaration,
        });
        allDeferredDecls.add(decl.ref.node);
      }

      this.resolveDeferTriggers(
          deferBlock, deferBlock.triggers, componentBoundTarget, triggerElements);
      this.resolveDeferTriggers(
          deferBlock, deferBlock.prefetchTriggers, componentBoundTarget, triggerElements);

      resolutionData.deferBlocks.set(deferBlock, {deps, triggerElements});
    }

    // For standalone components with the `imports` field - inspect the list of
    // referenced symbols and mark the ones used in defer blocks as potential candidates
    // for defer loading.
    if (analysisData.meta.isStandalone && analysisData.rawImports !== null &&
        ts.isArrayLiteralExpression(analysisData.rawImports)) {
      for (const element of analysisData.rawImports.elements) {
        const node = tryUnwrapForwardRef(element, this.reflector) || element;

        if (!ts.isIdentifier(node)) {
          // Can't defer-load non-literal references.
          continue;
        }

        const imp = this.reflector.getImportOfIdentifier(node);
        if (imp === null) {
          // Can't defer-load symbols which aren't imported.
          continue;
        }

        const decl = this.reflector.getDeclarationOfIdentifier(node);
        if (decl === null) {
          // Can't defer-load symbols which don't exist.
          continue;
        }

        if (!isNamedClassDeclaration(decl.node)) {
          // Can't defer-load symbols which aren't classes.
          continue;
        }

        // Are we even trying to defer-load this symbol?
        if (!allDeferredDecls.has(decl.node)) {
          continue;
        }

        if (eagerlyUsedDecls.has(decl.node)) {
          // Can't defer-load symbols that are eagerly referenced as a dependency
          // in a template outside of a defer block.
          continue;
        }

        // Is it a standalone directive/component?
        const dirMeta = this.metaReader.getDirectiveMetadata(new Reference(decl.node));
        if (dirMeta !== null && !dirMeta.isStandalone) {
          continue;
        }

        // Is it a standalone pipe?
        const pipeMeta = this.metaReader.getPipeMetadata(new Reference(decl.node));
        if (pipeMeta !== null && !pipeMeta.isStandalone) {
          continue;
        }

        if (dirMeta === null && pipeMeta === null) {
          // This is not a directive or a pipe.
          continue;
        }

        // Keep track of how this class made it into the current source file
        // (which ts.ImportDeclaration was used for this symbol).
        resolutionData.deferrableDeclToImportDecl.set(
            decl.node as unknown as Expression, imp.node as unknown as Expression);

        // We're okay deferring this reference to the imported symbol.
        this.deferredSymbolTracker.markAsDeferrableCandidate(node, imp.node);
      }
    }
  }

  /** Resolves the triggers of the defer block to the elements that they're pointing to. */
  private resolveDeferTriggers(
      block: TmplAstDeferredBlock, triggers: TmplAstDeferredBlockTriggers,
      componentBoundTarget: BoundTarget<DirectiveMeta>,
      triggerElements: Map<TmplAstDeferredTrigger, TmplAstElement|null>): void {
    Object.keys(triggers).forEach(key => {
      const trigger = triggers[key as keyof TmplAstDeferredBlockTriggers]!;
      triggerElements.set(trigger, componentBoundTarget.getDeferredTriggerTarget(block, trigger));
    });
  }
}

function validateStandaloneImports(
    importRefs: Reference<ClassDeclaration>[], importExpr: ts.Expression,
    metaReader: MetadataReader, scopeReader: ComponentScopeReader): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = [];
  for (const ref of importRefs) {
    const dirMeta = metaReader.getDirectiveMetadata(ref);
    if (dirMeta !== null) {
      if (!dirMeta.isStandalone) {
        // Directly importing a directive that's not standalone is an error.
        diagnostics.push(makeNotStandaloneDiagnostic(
            scopeReader, ref, importExpr, dirMeta.isComponent ? 'component' : 'directive'));
      }
      continue;
    }

    const pipeMeta = metaReader.getPipeMetadata(ref);
    if (pipeMeta !== null) {
      if (!pipeMeta.isStandalone) {
        diagnostics.push(makeNotStandaloneDiagnostic(scopeReader, ref, importExpr, 'pipe'));
      }
      continue;
    }

    const ngModuleMeta = metaReader.getNgModuleMetadata(ref);
    if (ngModuleMeta !== null) {
      // Importing NgModules is always legal.
      continue;
    }

    // Make an error?
    diagnostics.push(makeUnknownComponentImportDiagnostic(ref, importExpr));
  }

  return diagnostics;
}
