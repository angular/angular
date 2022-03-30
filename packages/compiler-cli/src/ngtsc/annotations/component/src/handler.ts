/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationTriggerNames, compileClassMetadata, compileComponentFromMetadata, compileDeclareClassMetadata, compileDeclareComponentFromMetadata, ConstantPool, CssSelector, DeclarationListEmitMode, DeclareComponentTemplateInfo, DEFAULT_INTERPOLATION_CONFIG, DomElementSchemaRegistry, Expression, FactoryTarget, makeBindingParser, R3ComponentMetadata, R3DirectiveDependencyMetadata, R3NgModuleDependencyMetadata, R3PipeDependencyMetadata, R3TargetBinder, R3TemplateDependency, R3TemplateDependencyKind, R3TemplateDependencyMetadata, SelectorMatcher, ViewEncapsulation, WrappedNodeExpr} from '@angular/compiler';
import ts from 'typescript';

import {Cycle, CycleAnalyzer, CycleHandlingStrategy} from '../../../cycles';
import {ErrorCode, FatalDiagnosticError, makeDiagnostic} from '../../../diagnostics';
import {absoluteFrom, relative} from '../../../file_system';
import {assertSuccessfulReferenceEmit, ImportedFile, ModuleResolver, Reference, ReferenceEmitter} from '../../../imports';
import {DependencyTracker} from '../../../incremental/api';
import {extractSemanticTypeParameters, SemanticDepGraphUpdater} from '../../../incremental/semantic_graph';
import {IndexingContext} from '../../../indexer';
import {DirectiveMeta, extractDirectiveTypeCheckMeta, InjectableClassRegistry, MetadataReader, MetadataRegistry, MetaKind, PipeMeta, ResourceRegistry} from '../../../metadata';
import {PartialEvaluator} from '../../../partial_evaluator';
import {PerfEvent, PerfRecorder} from '../../../perf';
import {ClassDeclaration, DeclarationNode, Decorator, ReflectionHost, reflectObjectLiteral} from '../../../reflection';
import {ComponentScopeReader, DtsModuleScopeResolver, LocalModuleScopeRegistry, TypeCheckScopeRegistry} from '../../../scope';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerFlags, HandlerPrecedence, ResolveResult} from '../../../transform';
import {TypeCheckContext} from '../../../typecheck/api';
import {ExtendedTemplateChecker} from '../../../typecheck/extended/api';
import {getSourceFile} from '../../../util/src/typescript';
import {Xi18nContext} from '../../../xi18n';
import {compileDeclareFactory, compileNgFactoryDefField, compileResults, extractClassMetadata, findAngularDecorator, getDirectiveDiagnostics, getProviderDiagnostics, isExpressionForwardReference, readBaseClass, resolveEnumValue, resolveImportedFile, resolveLiteral, resolveProvidersRequiringFactory, ResourceLoader, toFactoryMetadata, wrapFunctionExpressionsInParens} from '../../common';
import {extractDirectiveMetadata, parseFieldArrayValue} from '../../directive';
import {NgModuleSymbol} from '../../ng_module';

import {checkCustomElementSelectorForErrors, makeCyclicImportInfo} from './diagnostics';
import {ComponentAnalysisData, ComponentResolutionData} from './metadata';
import {_extractTemplateStyleUrls, extractComponentStyleUrls, extractStyleResources, extractTemplate, makeResourceNotFoundError, ParsedTemplateWithSource, parseTemplateDeclaration, preloadAndParseTemplate, ResourceTypeForDiagnostics, StyleUrlMeta, transformDecoratorToInlineResources} from './resources';
import {scopeTemplate} from './scope';
import {ComponentSymbol} from './symbol';
import {animationTriggerResolver, collectAnimationNames, validateAndFlattenComponentImports} from './util';

const EMPTY_MAP = new Map<string, Expression>();
const EMPTY_ARRAY: any[] = [];

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
      private resourceLoader: ResourceLoader, private rootDirs: ReadonlyArray<string>,
      private defaultPreserveWhitespaces: boolean, private i18nUseExternalIds: boolean,
      private enableI18nLegacyMessageIdFormat: boolean, private usePoisonedData: boolean,
      private i18nNormalizeLineEndingsInICUs: boolean, private moduleResolver: ModuleResolver,
      private cycleAnalyzer: CycleAnalyzer, private cycleHandlingStrategy: CycleHandlingStrategy,
      private refEmitter: ReferenceEmitter, private depTracker: DependencyTracker|null,
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

  private extractTemplateOptions = {
    enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
    i18nNormalizeLineEndingsInICUs: this.i18nNormalizeLineEndingsInICUs,
    usePoisonedData: this.usePoisonedData,
  };

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
            this.extractTemplateOptions)
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

  analyze(
      node: ClassDeclaration, decorator: Readonly<Decorator>,
      flags: HandlerFlags = HandlerFlags.NONE): AnalysisOutput<ComponentAnalysisData> {
    this.perf.eventCount(PerfEvent.AnalyzeComponent);
    const containingFile = node.getSourceFile().fileName;
    this.literalCache.delete(decorator);

    let diagnostics: ts.Diagnostic[]|undefined;
    let isPoisoned = false;
    // @Component inherits @Directive, so begin by extracting the @Directive metadata and building
    // on it.
    const directiveResult = extractDirectiveMetadata(
        node, decorator, this.reflector, this.evaluator, this.isCore, flags,
        this.annotateForClosureCompiler,
        this.elementSchemaRegistry.getDefaultComponentElementName());
    if (directiveResult === undefined) {
      // `extractDirectiveMetadata` returns undefined when the @Directive has `jit: true`. In this
      // case, compilation of the decorator is skipped. Returning an empty object signifies
      // that no analysis was produced.
      return {};
    }

    // Next, read the `@Component`-specific fields.
    const {decorator: component, metadata, inputs, outputs} = directiveResult;
    const encapsulation: number =
        resolveEnumValue(this.evaluator, component, 'encapsulation', 'ViewEncapsulation') ??
        ViewEncapsulation.Emulated;
    const changeDetection: number|null =
        resolveEnumValue(this.evaluator, component, 'changeDetection', 'ChangeDetectionStrategy');

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

    let imports: {
      resolved: Reference<ClassDeclaration>[],
      raw: ts.Expression,
    }|null = null;

    if (component.has('imports') && !metadata.isStandalone) {
      if (diagnostics === undefined) {
        diagnostics = [];
      }
      diagnostics.push(makeDiagnostic(
          ErrorCode.COMPONENT_NOT_STANDALONE, component.get('imports')!,
          `'imports' is only valid on a component that is standalone.`));
    } else if (component.has('imports')) {
      const expr = component.get('imports')!;
      const imported = this.evaluator.evaluate(expr);
      const {imports: flattened, diagnostics: importDiagnostics} =
          validateAndFlattenComponentImports(imported, expr);

      imports = {
        resolved: flattened,
        raw: expr,
      };

      if (importDiagnostics.length > 0) {
        isPoisoned = true;
        if (diagnostics === undefined) {
          diagnostics = [];
        }
        diagnostics.push(...importDiagnostics);
      }
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
          decorator, component, containingFile, this.evaluator, this.resourceLoader,
          this.defaultPreserveWhitespaces);
      template = extractTemplate(
          node, templateDecl, this.evaluator, this.depTracker, this.resourceLoader, {
            enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
            i18nNormalizeLineEndingsInICUs: this.i18nNormalizeLineEndingsInICUs,
            usePoisonedData: this.usePoisonedData,
          });
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
        classMetadata: extractClassMetadata(
            node, this.reflector, this.isCore, this.annotateForClosureCompiler,
            dec => transformDecoratorToInlineResources(dec, component, styles, template)),
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
        imports,
      },
      diagnostics,
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
      kind: MetaKind.Directive,
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
      isStandalone: analysis.meta.isStandalone,
      animationTriggerNames: analysis.animationTriggerNames,
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

      for (const dep of scope.compilation.dependencies) {
        if (dep.kind === MetaKind.Directive && dep.selector !== null) {
          matcher.addSelectables(CssSelector.parse(dep.selector), dep);
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
    };
    const diagnostics: ts.Diagnostic[] = [];

    const scope = scopeTemplate(
        this.scopeReader, this.dtsScopeReader, this.scopeRegistry, this.metaReader, node, analysis,
        this.usePoisonedData);


    if (scope !== null) {
      diagnostics.push(...scope.diagnostics);

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

      const pipes = new Map<string, PipeMeta>();

      for (const dep of scope.dependencies) {
        if (dep.kind === MetaKind.Directive && dep.selector !== null) {
          matcher.addSelectables(CssSelector.parse(dep.selector), dep as MatchedDirective);
        } else if (dep.kind === MetaKind.Pipe) {
          pipes.set(dep.name, dep);
        }
      }

      // Next, the component template AST is bound using the R3TargetBinder. This produces a
      // BoundTarget, which is similar to a ts.TypeChecker.
      const binder = new R3TargetBinder(matcher);
      const bound = binder.bind({template: metadata.template.nodes});

      // The BoundTarget knows which directives and pipes matched the template.
      type UsedDirective = R3DirectiveDependencyMetadata&
          {ref: Reference<ClassDeclaration>, importedFile: ImportedFile};

      const used = new Set<ClassDeclaration>();
      for (const dir of bound.getUsedDirectives()) {
        used.add(dir.ref.node);
      }
      for (const name of bound.getUsedPipes()) {
        if (!pipes.has(name)) {
          continue;
        }
        used.add(pipes.get(name)!.ref.node);
      }

      type UsedPipe = R3PipeDependencyMetadata&{
        ref: Reference<ClassDeclaration>,
        importedFile: ImportedFile,
      };

      type UsedNgModule = R3NgModuleDependencyMetadata&{
        importedFile: ImportedFile,
      };

      const declarations: (UsedPipe|UsedDirective|UsedNgModule)[] = [];
      const seen = new Set<ClassDeclaration>();

      // Transform the dependencies list, filtering out unused dependencies.
      for (const dep of scope.dependencies) {
        // Only emit references to each dependency once.
        if (seen.has(dep.ref.node)) {
          continue;
        }
        seen.add(dep.ref.node);

        switch (dep.kind) {
          case MetaKind.Directive:
            if (!used.has(dep.ref.node)) {
              continue;
            }
            const dirType = this.refEmitter.emit(dep.ref, context);
            assertSuccessfulReferenceEmit(
                dirType, node.name, dep.isComponent ? 'component' : 'directive');

            declarations.push({
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
            if (!used.has(dep.ref.node)) {
              continue;
            }

            const pipeType = this.refEmitter.emit(dep.ref, context);
            assertSuccessfulReferenceEmit(pipeType, node.name, 'pipe');

            declarations.push({
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

            declarations.push({
              kind: R3TemplateDependencyKind.NgModule,
              type: ngModuleType.expression,
              importedFile: ngModuleType.importedFile,
            });
            break;
        }
      }

      const isUsedDirective = (decl: UsedDirective|UsedPipe|UsedNgModule): decl is UsedDirective =>
          decl.kind === R3TemplateDependencyKind.Directive;
      const isUsedPipe = (decl: UsedDirective|UsedPipe|UsedNgModule): decl is UsedPipe =>
          decl.kind === R3TemplateDependencyKind.Pipe;

      const getSemanticReference = (decl: UsedDirective|UsedPipe) =>
          this.semanticDepGraphUpdater!.getSemanticReference(decl.ref.node, decl.type);

      if (this.semanticDepGraphUpdater !== null) {
        symbol.usedDirectives = declarations.filter(isUsedDirective).map(getSemanticReference);
        symbol.usedPipes = declarations.filter(isUsedPipe).map(getSemanticReference);
      }

      // Scan through the directives/pipes actually used in the template and check whether any
      // import which needs to be generated would create a cycle.
      const cyclesFromDirectives = new Map<UsedDirective, Cycle>();
      const cyclesFromPipes = new Map<UsedPipe, Cycle>();
      for (const usedDep of declarations) {
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

      const cycleDetected = cyclesFromDirectives.size !== 0 || cyclesFromPipes.size !== 0;
      if (!cycleDetected) {
        // No cycle was detected. Record the imports that need to be created in the cycle detector
        // so that future cyclic import checks consider their production.
        for (const {type, importedFile} of declarations) {
          this._recordSyntheticImport(importedFile, type, context);
        }

        // Check whether the dependencies arrays in ɵcmp need to be wrapped in a closure.
        // This is required if any dependency reference is to a declaration in the same file
        // but declared after this component.
        const wrapDirectivesAndPipesInClosure =
            declarations.some(decl => isExpressionForwardReference(decl.type, node.name, context));

        data.declarations = declarations;
        data.declarationListEmitMode = wrapDirectivesAndPipesInClosure ?
            DeclarationListEmitMode.Closure :
            DeclarationListEmitMode.Direct;
      } else {
        if (this.cycleHandlingStrategy === CycleHandlingStrategy.UseRemoteScoping) {
          // Declaring the directiveDefs/pipeDefs arrays directly would require imports that would
          // create a cycle. Instead, mark this component as requiring remote scoping, so that the
          // NgModule file will take care of setting the directives for the component.
          this.scopeRegistry.setComponentRemoteScope(
              node, declarations.filter(isUsedDirective).map(dir => dir.ref),
              declarations.filter(isUsedPipe).map(pipe => pipe.ref));
          symbol.isRemotelyScoped = true;

          // If a semantic graph is being tracked, record the fact that this component is remotely
          // scoped with the declaring NgModule symbol as the NgModule's emit becomes dependent on
          // the directive/pipe usages of this component.
          if (this.semanticDepGraphUpdater !== null && scope.ngModule !== null) {
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
          this.extractTemplateOptions);
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

    analysis.meta.styles = styles;
  }

  compileFull(
      node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>,
      resolution: Readonly<ComponentResolutionData>, pool: ConstantPool): CompileResult[] {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return [];
    }
    const meta: R3ComponentMetadata<R3TemplateDependency> = {...analysis.meta, ...resolution};
    const fac = compileNgFactoryDefField(toFactoryMetadata(meta, FactoryTarget.Component));
    const def = compileComponentFromMetadata(meta, pool, makeBindingParser());
    const classMetadata = analysis.classMetadata !== null ?
        compileClassMetadata(analysis.classMetadata).toStmt() :
        null;
    return compileResults(fac, def, classMetadata, 'ɵcmp');
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
    const def = compileDeclareComponentFromMetadata(meta, analysis.template, templateInfo);
    const classMetadata = analysis.classMetadata !== null ?
        compileDeclareClassMetadata(analysis.classMetadata).toStmt() :
        null;
    return compileResults(fac, def, classMetadata, 'ɵcmp');
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

  private _recordSyntheticImport(
      importedFile: ImportedFile, expr: Expression, origin: ts.SourceFile): void {
    const imported = resolveImportedFile(this.moduleResolver, importedFile, expr, origin);
    if (imported === null) {
      return;
    }

    this.cycleAnalyzer.recordSyntheticImport(origin, imported);
  }
}
