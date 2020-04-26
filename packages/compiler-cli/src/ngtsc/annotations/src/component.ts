/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compileComponentFromMetadata, ConstantPool, CssSelector, DEFAULT_INTERPOLATION_CONFIG, DomElementSchemaRegistry, Expression, ExternalExpr, Identifiers, InterpolationConfig, LexerRange, makeBindingParser, ParseError, ParseSourceFile, parseTemplate, ParseTemplateOptions, R3ComponentMetadata, R3FactoryTarget, R3TargetBinder, SchemaMetadata, SelectorMatcher, Statement, TmplAstNode, WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {CycleAnalyzer} from '../../cycles';
import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {absoluteFrom, relative} from '../../file_system';
import {DefaultImportRecorder, ModuleResolver, Reference, ReferenceEmitter} from '../../imports';
import {DependencyTracker} from '../../incremental/api';
import {IndexingContext} from '../../indexer';
import {DirectiveMeta, extractDirectiveGuards, InjectableClassRegistry, MetadataReader, MetadataRegistry} from '../../metadata';
import {flattenInheritedDirectiveMetadata} from '../../metadata/src/inheritance';
import {EnumValue, PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, Decorator, ReflectionHost, reflectObjectLiteral} from '../../reflection';
import {ComponentScopeReader, LocalModuleScopeRegistry} from '../../scope';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerFlags, HandlerPrecedence, ResolveResult} from '../../transform';
import {TemplateSourceMapping, TypeCheckContext} from '../../typecheck';
import {tsSourceMapBug29300Fixed} from '../../util/src/ts_source_map_bug_29300';
import {SubsetOfKeys} from '../../util/src/typescript';

import {ResourceLoader} from './api';
import {getDirectiveDiagnostics, getProviderDiagnostics} from './diagnostics';
import {extractDirectiveMetadata, parseFieldArrayValue} from './directive';
import {compileNgFactoryDefField} from './factory';
import {generateSetClassMetadataCall} from './metadata';
import {findAngularDecorator, isAngularCoreReference, isExpressionForwardReference, makeDuplicateDeclarationError, readBaseClass, resolveProvidersRequiringFactory, unwrapExpression, wrapFunctionExpressionsInParens} from './util';

const EMPTY_MAP = new Map<string, Expression>();
const EMPTY_ARRAY: any[] = [];

/**
 * These fields of `R3ComponentMetadata` are updated in the `resolve` phase.
 *
 * The `keyof R3ComponentMetadata &` condition ensures that only fields of `R3ComponentMetadata` can
 * be included here.
 */
export type ComponentMetadataResolvedFields =
    SubsetOfKeys<R3ComponentMetadata, 'directives'|'pipes'|'wrapDirectivesAndPipesInClosure'>;

export interface ComponentAnalysisData {
  /**
   * `meta` includes those fields of `R3ComponentMetadata` which are calculated at `analyze` time
   * (not during resolve).
   */
  meta: Omit<R3ComponentMetadata, ComponentMetadataResolvedFields>;
  baseClass: Reference<ClassDeclaration>|'dynamic'|null;
  guards: ReturnType<typeof extractDirectiveGuards>;
  template: ParsedTemplateWithSource;
  metadataStmt: Statement|null;

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
}

export type ComponentResolutionData = Pick<R3ComponentMetadata, ComponentMetadataResolvedFields>;

/**
 * `DecoratorHandler` which handles the `@Component` annotation.
 */
export class ComponentDecoratorHandler implements
    DecoratorHandler<Decorator, ComponentAnalysisData, ComponentResolutionData> {
  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private metaRegistry: MetadataRegistry, private metaReader: MetadataReader,
      private scopeReader: ComponentScopeReader, private scopeRegistry: LocalModuleScopeRegistry,
      private isCore: boolean, private resourceLoader: ResourceLoader,
      private rootDirs: ReadonlyArray<string>, private defaultPreserveWhitespaces: boolean,
      private i18nUseExternalIds: boolean, private enableI18nLegacyMessageIdFormat: boolean,
      private i18nNormalizeLineEndingsInICUs: boolean|undefined,
      private moduleResolver: ModuleResolver, private cycleAnalyzer: CycleAnalyzer,
      private refEmitter: ReferenceEmitter, private defaultImportRecorder: DefaultImportRecorder,
      private depTracker: DependencyTracker|null,
      private injectableRegistry: InjectableClassRegistry,
      private annotateForClosureCompiler: boolean) {}

  private literalCache = new Map<Decorator, ts.ObjectLiteralExpression>();
  private elementSchemaRegistry = new DomElementSchemaRegistry();

  /**
   * During the asynchronous preanalyze phase, it's necessary to parse the template to extract
   * any potential <link> tags which might need to be loaded. This cache ensures that work is not
   * thrown away, and the parsed template is reused during the analyze phase.
   */
  private preanalyzeTemplateCache = new Map<ts.Declaration, ParsedTemplateWithSource>();

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

    // Convert a styleUrl string into a Promise to preload it.
    const resolveStyleUrl = (styleUrl: string): Promise<void> => {
      const resourceUrl = this.resourceLoader.resolve(styleUrl, containingFile);
      const promise = this.resourceLoader.preload(resourceUrl);
      return promise || Promise.resolve();
    };

    // A Promise that waits for the template and all <link>ed styles within it to be preloaded.
    const templateAndTemplateStyleResources =
        this._preloadAndParseTemplate(node, decorator, component, containingFile).then(template => {
          if (template === null) {
            return undefined;
          } else {
            return Promise.all(template.styleUrls.map(resolveStyleUrl)).then(() => undefined);
          }
        });

    // Extract all the styleUrls in the decorator.
    const styleUrls = this._extractStyleUrls(component, []);

    if (styleUrls === null) {
      // A fast path exists if there are no styleUrls, to just wait for
      // templateAndTemplateStyleResources.
      return templateAndTemplateStyleResources;
    } else {
      // Wait for both the template and all styleUrl resources to resolve.
      return Promise.all([templateAndTemplateStyleResources, ...styleUrls.map(resolveStyleUrl)])
          .then(() => undefined);
    }
  }

  analyze(
      node: ClassDeclaration, decorator: Readonly<Decorator>,
      flags: HandlerFlags = HandlerFlags.NONE): AnalysisOutput<ComponentAnalysisData> {
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
    const {decorator: component, metadata} = directiveResult;

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
      // The template was not already parsed. Either there's a templateUrl, or an inline template.
      if (component.has('templateUrl')) {
        const templateUrlExpr = component.get('templateUrl')!;
        const templateUrl = this.evaluator.evaluate(templateUrlExpr);
        if (typeof templateUrl !== 'string') {
          throw new FatalDiagnosticError(
              ErrorCode.VALUE_HAS_WRONG_TYPE, templateUrlExpr, 'templateUrl must be a string');
        }
        const resourceUrl = this.resourceLoader.resolve(templateUrl, containingFile);
        template = this._extractExternalTemplate(node, component, templateUrlExpr, resourceUrl);
      } else {
        // Expect an inline template to be present.
        template = this._extractInlineTemplate(node, decorator, component, containingFile);
      }
    }

    if (template.errors !== undefined) {
      throw new Error(
          `Errors parsing template: ${template.errors.map(e => e.toString()).join(', ')}`);
    }

    // Figure out the set of styles. The ordering here is important: external resources (styleUrls)
    // precede inline styles, and styles defined in the template override styles defined in the
    // component.
    let styles: string[]|null = null;

    const styleUrls = this._extractStyleUrls(component, template.styleUrls);
    if (styleUrls !== null) {
      if (styles === null) {
        styles = [];
      }
      for (const styleUrl of styleUrls) {
        const resourceUrl = this.resourceLoader.resolve(styleUrl, containingFile);
        const resourceStr = this.resourceLoader.load(resourceUrl);
        styles.push(resourceStr);
        if (this.depTracker !== null) {
          this.depTracker.addResourceDependency(node.getSourceFile(), absoluteFrom(resourceUrl));
        }
      }
    }
    if (component.has('styles')) {
      const litStyles = parseFieldArrayValue(component, 'styles', this.evaluator);
      if (litStyles !== null) {
        if (styles === null) {
          styles = litStyles;
        } else {
          styles.push(...litStyles);
        }
      }
    }
    if (template.styles.length > 0) {
      if (styles === null) {
        styles = template.styles;
      } else {
        styles.push(...template.styles);
      }
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
        meta: {
          ...metadata,
          template: {
            nodes: template.emitNodes,
            ngContentSelectors: template.ngContentSelectors,
          },
          encapsulation,
          interpolation: template.interpolation,
          styles: styles || [],

          // These will be replaced during the compilation step, after all `NgModule`s have been
          // analyzed and the full compilation scope for the component can be realized.
          animations,
          viewProviders: wrappedViewProviders,
          i18nUseExternalIds: this.i18nUseExternalIds,
          relativeContextFilePath,
        },
        guards: extractDirectiveGuards(node, this.reflector),
        metadataStmt: generateSetClassMetadataCall(
            node, this.reflector, this.defaultImportRecorder, this.isCore,
            this.annotateForClosureCompiler),
        template,
        providersRequiringFactory,
        viewProvidersRequiringFactory,
      },
    };
    if (changeDetection !== null) {
      output.analysis!.meta.changeDetection = changeDetection;
    }
    return output;
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
      inputs: analysis.meta.inputs,
      outputs: analysis.meta.outputs,
      queries: analysis.meta.queries.map(query => query.propertyName),
      isComponent: true,
      baseClass: analysis.baseClass,
      ...analysis.guards,
    });

    this.injectableRegistry.registerInjectable(node);
  }

  index(
      context: IndexingContext, node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>) {
    const scope = this.scopeReader.getScopeForComponent(node);
    const selector = analysis.meta.selector;
    const matcher = new SelectorMatcher<DirectiveMeta>();
    if (scope === 'error') {
      // Don't bother indexing components which had erroneous scopes.
      return null;
    }

    if (scope !== null) {
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
    if (!ts.isClassDeclaration(node)) {
      return;
    }

    const matcher = new SelectorMatcher<DirectiveMeta>();
    const pipes = new Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>();
    let schemas: SchemaMetadata[] = [];

    const scope = this.scopeReader.getScopeForComponent(node);
    if (scope === 'error') {
      // Don't type-check components that had errors in their scopes.
      return;
    }

    if (scope !== null) {
      for (const meta of scope.compilation.directives) {
        if (meta.selector !== null) {
          const extMeta = flattenInheritedDirectiveMetadata(this.metaReader, meta.ref);
          matcher.addSelectables(CssSelector.parse(meta.selector), extMeta);
        }
      }
      for (const {name, ref} of scope.compilation.pipes) {
        if (!ts.isClassDeclaration(ref.node)) {
          throw new Error(`Unexpected non-class declaration ${
              ts.SyntaxKind[ref.node.kind]} for pipe ${ref.debugName}`);
        }
        pipes.set(name, ref as Reference<ClassDeclaration<ts.ClassDeclaration>>);
      }
      schemas = scope.schemas;
    }

    const bound = new R3TargetBinder(matcher).bind({template: meta.template.diagNodes});
    ctx.addTemplate(
        new Reference(node), bound, pipes, schemas, meta.template.sourceMapping,
        meta.template.file);
  }

  resolve(node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>):
      ResolveResult<ComponentResolutionData> {
    const context = node.getSourceFile();
    // Check whether this component was registered with an NgModule. If so, it should be compiled
    // under that module's compilation scope.
    const scope = this.scopeReader.getScopeForComponent(node);
    let metadata = analysis.meta as Readonly<R3ComponentMetadata>;

    const data: ComponentResolutionData = {
      directives: EMPTY_ARRAY,
      pipes: EMPTY_MAP,
      wrapDirectivesAndPipesInClosure: false,
    };

    if (scope !== null && scope !== 'error') {
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
      // ConstantPool for the overall file being compiled (which isn't available until the transform
      // step).
      //
      // Instead, directives/pipes are matched independently here, using the R3TargetBinder. This is
      // an alternative implementation of template matching which is used for template type-checking
      // and will eventually replace matching in the TemplateDefinitionBuilder.


      // Set up the R3TargetBinder, as well as a 'directives' array and a 'pipes' map that are later
      // fed to the TemplateDefinitionBuilder. First, a SelectorMatcher is constructed to match
      // directives that are in scope.
      const matcher = new SelectorMatcher<DirectiveMeta&{expression: Expression}>();
      const directives: {selector: string, expression: Expression}[] = [];

      for (const dir of scope.compilation.directives) {
        const {ref, selector} = dir;
        if (selector !== null) {
          const expression = this.refEmitter.emit(ref, context);
          directives.push({selector, expression});
          matcher.addSelectables(CssSelector.parse(selector), {...dir, expression});
        }
      }
      const pipes = new Map<string, Expression>();
      for (const pipe of scope.compilation.pipes) {
        pipes.set(pipe.name, this.refEmitter.emit(pipe.ref, context));
      }

      // Next, the component template AST is bound using the R3TargetBinder. This produces an
      // BoundTarget, which is similar to a ts.TypeChecker.
      const binder = new R3TargetBinder(matcher);
      const bound = binder.bind({template: metadata.template.nodes});

      // The BoundTarget knows which directives and pipes matched the template.
      const usedDirectives = bound.getUsedDirectives();
      const usedPipes = bound.getUsedPipes().map(name => pipes.get(name)!);

      // Scan through the directives/pipes actually used in the template and check whether any
      // import which needs to be generated would create a cycle.
      const cycleDetected =
          usedDirectives.some(dir => this._isCyclicImport(dir.expression, context)) ||
          usedPipes.some(pipe => this._isCyclicImport(pipe, context));

      if (!cycleDetected) {
        // No cycle was detected. Record the imports that need to be created in the cycle detector
        // so that future cyclic import checks consider their production.
        for (const {expression} of usedDirectives) {
          this._recordSyntheticImport(expression, context);
        }
        for (const pipe of usedPipes) {
          this._recordSyntheticImport(pipe, context);
        }

        // Check whether the directive/pipe arrays in ɵcmp need to be wrapped in closures.
        // This is required if any directive/pipe reference is to a declaration in the same file but
        // declared after this component.
        const wrapDirectivesAndPipesInClosure =
            usedDirectives.some(
                dir => isExpressionForwardReference(dir.expression, node.name, context)) ||
            usedPipes.some(pipe => isExpressionForwardReference(pipe, node.name, context));

        // Actual compilation still uses the full scope, not the narrowed scope determined by
        // R3TargetBinder. This is a hedge against potential issues with the R3TargetBinder - right
        // now the TemplateDefinitionBuilder is the "source of truth" for which directives/pipes are
        // actually used (though the two should agree perfectly).
        //
        // TODO(alxhub): switch TemplateDefinitionBuilder over to using R3TargetBinder directly.
        data.directives = directives;
        data.pipes = pipes;
        data.wrapDirectivesAndPipesInClosure = wrapDirectivesAndPipesInClosure;
      } else {
        // Declaring the directiveDefs/pipeDefs arrays directly would require imports that would
        // create a cycle. Instead, mark this component as requiring remote scoping, so that the
        // NgModule file will take care of setting the directives for the component.
        this.scopeRegistry.setComponentAsRequiringRemoteScoping(node);
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

  compile(
      node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>,
      resolution: Readonly<ComponentResolutionData>, pool: ConstantPool): CompileResult[] {
    const meta: R3ComponentMetadata = {...analysis.meta, ...resolution};
    const res = compileComponentFromMetadata(meta, pool, makeBindingParser());
    const factoryRes = compileNgFactoryDefField(
        {...meta, injectFn: Identifiers.directiveInject, target: R3FactoryTarget.Component});
    if (analysis.metadataStmt !== null) {
      factoryRes.statements.push(analysis.metadataStmt);
    }
    return [
      factoryRes, {
        name: 'ɵcmp',
        initializer: res.expression,
        statements: [],
        type: res.type,
      }
    ];
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
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, expr,
            `${field} must be a member of ${enumSymbolName} enum from @angular/core`);
      }
    }
    return resolved;
  }

  private _extractStyleUrls(component: Map<string, ts.Expression>, extraUrls: string[]):
      string[]|null {
    if (!component.has('styleUrls')) {
      return extraUrls.length > 0 ? extraUrls : null;
    }

    const styleUrlsExpr = component.get('styleUrls')!;
    const styleUrls = this.evaluator.evaluate(styleUrlsExpr);
    if (!Array.isArray(styleUrls) || !styleUrls.every(url => typeof url === 'string')) {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, styleUrlsExpr, 'styleUrls must be an array of strings');
    }
    styleUrls.push(...extraUrls);
    return styleUrls as string[];
  }

  private _preloadAndParseTemplate(
      node: ClassDeclaration, decorator: Decorator, component: Map<string, ts.Expression>,
      containingFile: string): Promise<ParsedTemplate|null> {
    if (component.has('templateUrl')) {
      // Extract the templateUrl and preload it.
      const templateUrlExpr = component.get('templateUrl')!;
      const templateUrl = this.evaluator.evaluate(templateUrlExpr);
      if (typeof templateUrl !== 'string') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, templateUrlExpr, 'templateUrl must be a string');
      }
      const resourceUrl = this.resourceLoader.resolve(templateUrl, containingFile);
      const templatePromise = this.resourceLoader.preload(resourceUrl);

      // If the preload worked, then actually load and parse the template, and wait for any style
      // URLs to resolve.
      if (templatePromise !== undefined) {
        return templatePromise.then(() => {
          const template =
              this._extractExternalTemplate(node, component, templateUrlExpr, resourceUrl);
          this.preanalyzeTemplateCache.set(node, template);
          return template;
        });
      } else {
        return Promise.resolve(null);
      }
    } else {
      const template = this._extractInlineTemplate(node, decorator, component, containingFile);
      this.preanalyzeTemplateCache.set(node, template);
      return Promise.resolve(template);
    }
  }

  private _extractExternalTemplate(
      node: ClassDeclaration, component: Map<string, ts.Expression>, templateUrlExpr: ts.Expression,
      resourceUrl: string): ParsedTemplateWithSource {
    const templateStr = this.resourceLoader.load(resourceUrl);
    if (this.depTracker !== null) {
      this.depTracker.addResourceDependency(node.getSourceFile(), absoluteFrom(resourceUrl));
    }

    const template = this._parseTemplate(
        component, templateStr, sourceMapUrl(resourceUrl), /* templateRange */ undefined,
        /* escapedString */ false);

    return {
      ...template,
      sourceMapping: {
        type: 'external',
        componentClass: node,
        node: templateUrlExpr,
        template: templateStr,
        templateUrl: resourceUrl,
      },
    };
  }

  private _extractInlineTemplate(
      node: ClassDeclaration, decorator: Decorator, component: Map<string, ts.Expression>,
      containingFile: string): ParsedTemplateWithSource {
    if (!component.has('template')) {
      throw new FatalDiagnosticError(
          ErrorCode.COMPONENT_MISSING_TEMPLATE, Decorator.nodeForError(decorator),
          'component is missing a template');
    }
    const templateExpr = component.get('template')!;

    let templateStr: string;
    let templateUrl: string = '';
    let templateRange: LexerRange|undefined = undefined;
    let sourceMapping: TemplateSourceMapping;
    let escapedString = false;
    // We only support SourceMaps for inline templates that are simple string literals.
    if (ts.isStringLiteral(templateExpr) || ts.isNoSubstitutionTemplateLiteral(templateExpr)) {
      // the start and end of the `templateExpr` node includes the quotation marks, which we
      // must
      // strip
      templateRange = getTemplateRange(templateExpr);
      templateStr = templateExpr.getSourceFile().text;
      templateUrl = containingFile;
      escapedString = true;
      sourceMapping = {
        type: 'direct',
        node: templateExpr as (ts.StringLiteral | ts.NoSubstitutionTemplateLiteral),
      };
    } else {
      const resolvedTemplate = this.evaluator.evaluate(templateExpr);
      if (typeof resolvedTemplate !== 'string') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, templateExpr, 'template must be a string');
      }
      templateStr = resolvedTemplate;
      sourceMapping = {
        type: 'indirect',
        node: templateExpr,
        componentClass: node,
        template: templateStr,
      };
    }

    const template =
        this._parseTemplate(component, templateStr, templateUrl, templateRange, escapedString);

    return {...template, sourceMapping};
  }

  private _parseTemplate(
      component: Map<string, ts.Expression>, templateStr: string, templateUrl: string,
      templateRange: LexerRange|undefined, escapedString: boolean): ParsedTemplate {
    let preserveWhitespaces: boolean = this.defaultPreserveWhitespaces;
    if (component.has('preserveWhitespaces')) {
      const expr = component.get('preserveWhitespaces')!;
      const value = this.evaluator.evaluate(expr);
      if (typeof value !== 'boolean') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, expr, 'preserveWhitespaces must be a boolean');
      }
      preserveWhitespaces = value;
    }

    let interpolation: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG;
    if (component.has('interpolation')) {
      const expr = component.get('interpolation')!;
      const value = this.evaluator.evaluate(expr);
      if (!Array.isArray(value) || value.length !== 2 ||
          !value.every(element => typeof element === 'string')) {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, expr,
            'interpolation must be an array with 2 elements of string type');
      }
      interpolation = InterpolationConfig.fromArray(value as [string, string]);
    }

    const {errors, nodes: emitNodes, styleUrls, styles, ngContentSelectors} =
        parseTemplate(templateStr, templateUrl, {
          preserveWhitespaces,
          interpolationConfig: interpolation,
          range: templateRange,
          escapedString,
          enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
          i18nNormalizeLineEndingsInICUs: this.i18nNormalizeLineEndingsInICUs,
        });

    // Unfortunately, the primary parse of the template above may not contain accurate source map
    // information. If used directly, it would result in incorrect code locations in template
    // errors, etc. There are two main problems:
    //
    // 1. `preserveWhitespaces: false` annihilates the correctness of template source mapping, as
    //    the whitespace transformation changes the contents of HTML text nodes before they're
    //    parsed into Angular expressions.
    // 2. By default, the template parser strips leading trivia characters (like spaces, tabs, and
    //    newlines). This also destroys source mapping information.
    //
    // In order to guarantee the correctness of diagnostics, templates are parsed a second time with
    // the above options set to preserve source mappings.

    const {nodes: diagNodes} = parseTemplate(templateStr, templateUrl, {
      preserveWhitespaces: true,
      interpolationConfig: interpolation,
      range: templateRange,
      escapedString,
      enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
      i18nNormalizeLineEndingsInICUs: this.i18nNormalizeLineEndingsInICUs,
      leadingTriviaChars: [],
    });

    return {
      interpolation,
      emitNodes,
      diagNodes,
      styleUrls,
      styles,
      ngContentSelectors,
      errors,
      template: templateStr,
      templateUrl,
      isInline: component.has('template'),
      file: new ParseSourceFile(templateStr, templateUrl),
    };
  }

  private _expressionToImportedFile(expr: Expression, origin: ts.SourceFile): ts.SourceFile|null {
    if (!(expr instanceof ExternalExpr)) {
      return null;
    }

    // Figure out what file is being imported.
    return this.moduleResolver.resolveModule(expr.value.moduleName!, origin.fileName);
  }

  private _isCyclicImport(expr: Expression, origin: ts.SourceFile): boolean {
    const imported = this._expressionToImportedFile(expr, origin);
    if (imported === null) {
      return false;
    }

    // Check whether the import is legal.
    return this.cycleAnalyzer.wouldCreateCycle(origin, imported);
  }

  private _recordSyntheticImport(expr: Expression, origin: ts.SourceFile): void {
    const imported = this._expressionToImportedFile(expr, origin);
    if (imported === null) {
      return;
    }

    this.cycleAnalyzer.recordSyntheticImport(origin, imported);
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


/**
 * Information about the template which was extracted during parsing.
 *
 * This contains the actual parsed template as well as any metadata collected during its parsing,
 * some of which might be useful for re-parsing the template with different options.
 */
export interface ParsedTemplate {
  /**
   * The `InterpolationConfig` specified by the user.
   */
  interpolation: InterpolationConfig;

  /**
   * A full path to the file which contains the template.
   *
   * This can be either the original .ts file if the template is inline, or the .html file if an
   * external file was used.
   */
  templateUrl: string;

  /**
   * The string contents of the template.
   *
   * This is the "logical" template string, after expansion of any escaped characters (for inline
   * templates). This may differ from the actual template bytes as they appear in the .ts file.
   */
  template: string;

  /**
   * Any errors from parsing the template the first time.
   */
  errors?: ParseError[]|undefined;

  /**
   * The template AST, parsed according to the user's specifications.
   */
  emitNodes: TmplAstNode[];

  /**
   * The template AST, parsed in a manner which preserves source map information for diagnostics.
   *
   * Not useful for emit.
   */
  diagNodes: TmplAstNode[];

  /**
   *
   */

  /**
   * Any styleUrls extracted from the metadata.
   */
  styleUrls: string[];

  /**
   * Any inline styles extracted from the metadata.
   */
  styles: string[];

  /**
   * Any ng-content selectors extracted from the template.
   */
  ngContentSelectors: string[];

  /**
   * Whether the template was inline.
   */
  isInline: boolean;

  /**
   * The `ParseSourceFile` for the template.
   */
  file: ParseSourceFile;
}

export interface ParsedTemplateWithSource extends ParsedTemplate {
  sourceMapping: TemplateSourceMapping;
}
