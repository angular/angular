/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, CssSelector, DEFAULT_INTERPOLATION_CONFIG, DomElementSchemaRegistry, Expression, ExternalExpr, InterpolationConfig, LexerRange, ParseError, ParseSourceFile, ParseTemplateOptions, R3ComponentMetadata, R3TargetBinder, SelectorMatcher, Statement, TmplAstNode, WrappedNodeExpr, compileComponentFromMetadata, makeBindingParser, parseTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {CycleAnalyzer} from '../../cycles';
import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {absoluteFrom, relative} from '../../file_system';
import {DefaultImportRecorder, ModuleResolver, Reference, ReferenceEmitter} from '../../imports';
import {IndexingContext} from '../../indexer';
import {DirectiveMeta, MetadataReader, MetadataRegistry, extractDirectiveGuards} from '../../metadata';
import {flattenInheritedDirectiveMetadata} from '../../metadata/src/inheritance';
import {EnumValue, PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, Decorator, ReflectionHost, reflectObjectLiteral} from '../../reflection';
import {LocalModuleScopeRegistry} from '../../scope';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence, ResolveResult} from '../../transform';
import {TypeCheckContext} from '../../typecheck';
import {NoopResourceDependencyRecorder, ResourceDependencyRecorder} from '../../util/src/resource_recorder';
import {tsSourceMapBug29300Fixed} from '../../util/src/ts_source_map_bug_29300';

import {ResourceLoader} from './api';
import {extractDirectiveMetadata, parseFieldArrayValue} from './directive';
import {generateSetClassMetadataCall} from './metadata';
import {findAngularDecorator, isAngularCoreReference, isExpressionForwardReference, readBaseClass, unwrapExpression} from './util';

const EMPTY_MAP = new Map<string, Expression>();
const EMPTY_ARRAY: any[] = [];

export interface ComponentHandlerData {
  meta: R3ComponentMetadata;
  parsedTemplate: {nodes: TmplAstNode[]; file: ParseSourceFile};
  metadataStmt: Statement|null;
  parseTemplate: (options?: ParseTemplateOptions) => ParsedTemplate;
}

/**
 * `DecoratorHandler` which handles the `@Component` annotation.
 */
export class ComponentDecoratorHandler implements
    DecoratorHandler<ComponentHandlerData, Decorator> {
  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private metaRegistry: MetadataRegistry, private metaReader: MetadataReader,
      private scopeRegistry: LocalModuleScopeRegistry, private isCore: boolean,
      private resourceLoader: ResourceLoader, private rootDirs: string[],
      private defaultPreserveWhitespaces: boolean, private i18nUseExternalIds: boolean,
      private moduleResolver: ModuleResolver, private cycleAnalyzer: CycleAnalyzer,
      private refEmitter: ReferenceEmitter, private defaultImportRecorder: DefaultImportRecorder,
      private resourceDependencies:
          ResourceDependencyRecorder = new NoopResourceDependencyRecorder()) {}

  private literalCache = new Map<Decorator, ts.ObjectLiteralExpression>();
  private elementSchemaRegistry = new DomElementSchemaRegistry();

  /**
   * During the asynchronous preanalyze phase, it's necessary to parse the template to extract
   * any potential <link> tags which might need to be loaded. This cache ensures that work is not
   * thrown away, and the parsed template is reused during the analyze phase.
   */
  private preanalyzeTemplateCache = new Map<ts.Declaration, ParsedTemplate>();

  readonly precedence = HandlerPrecedence.PRIMARY;

  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<Decorator>|undefined {
    if (!decorators) {
      return undefined;
    }
    const decorator = findAngularDecorator(decorators, 'Component', this.isCore);
    if (decorator !== undefined) {
      return {
        trigger: decorator.node,
        metadata: decorator,
      };
    } else {
      return undefined;
    }
  }

  preanalyze(node: ClassDeclaration, decorator: Decorator): Promise<void>|undefined {
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

  analyze(node: ClassDeclaration, decorator: Decorator): AnalysisOutput<ComponentHandlerData> {
    const containingFile = node.getSourceFile().fileName;
    this.literalCache.delete(decorator);

    // @Component inherits @Directive, so begin by extracting the @Directive metadata and building
    // on it.
    const directiveResult = extractDirectiveMetadata(
        node, decorator, this.reflector, this.evaluator, this.defaultImportRecorder, this.isCore,
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
    }, undefined) !;

    const viewProviders: Expression|null = component.has('viewProviders') ?
        new WrappedNodeExpr(component.get('viewProviders') !) :
        null;

    // Parse the template.
    // If a preanalyze phase was executed, the template may already exist in parsed form, so check
    // the preanalyzeTemplateCache.
    // Extract a closure of the template parsing code so that it can be reparsed with different
    // options if needed, like in the indexing pipeline.
    let parseTemplate: (options?: ParseTemplateOptions) => ParsedTemplate;
    if (this.preanalyzeTemplateCache.has(node)) {
      // The template was parsed in preanalyze. Use it and delete it to save memory.
      const template = this.preanalyzeTemplateCache.get(node) !;
      this.preanalyzeTemplateCache.delete(node);

      // A pre-analyzed template cannot be reparsed. Pre-analysis is never run with the indexing
      // pipeline.
      parseTemplate = (options?: ParseTemplateOptions) => {
        if (options !== undefined) {
          throw new Error(`Cannot reparse a pre-analyzed template with new options`);
        }
        return template;
      };
    } else {
      // The template was not already parsed. Either there's a templateUrl, or an inline template.
      if (component.has('templateUrl')) {
        const templateUrlExpr = component.get('templateUrl') !;
        const evalTemplateUrl = this.evaluator.evaluate(templateUrlExpr);
        if (typeof evalTemplateUrl !== 'string') {
          throw new FatalDiagnosticError(
              ErrorCode.VALUE_HAS_WRONG_TYPE, templateUrlExpr, 'templateUrl must be a string');
        }
        const templateUrl = this.resourceLoader.resolve(evalTemplateUrl, containingFile);
        const templateStr = this.resourceLoader.load(templateUrl);
        this.resourceDependencies.recordResourceDependency(node.getSourceFile(), templateUrl);

        parseTemplate = (options?: ParseTemplateOptions) => this._parseTemplate(
            component, templateStr, sourceMapUrl(templateUrl), /* templateRange */ undefined,
            /* escapedString */ false, options);
      } else {
        // Expect an inline template to be present.
        const inlineTemplate = this._extractInlineTemplate(component, containingFile);
        if (inlineTemplate === null) {
          throw new FatalDiagnosticError(
              ErrorCode.COMPONENT_MISSING_TEMPLATE, decorator.node,
              'component is missing a template');
        }
        const {templateStr, templateUrl, templateRange, escapedString} = inlineTemplate;
        parseTemplate = (options?: ParseTemplateOptions) => this._parseTemplate(
            component, templateStr, templateUrl, templateRange, escapedString, options);
      }
    }
    const template = parseTemplate();

    if (template.errors !== undefined) {
      throw new Error(
          `Errors parsing template: ${template.errors.map(e => e.toString()).join(', ')}`);
    }

    // If the component has a selector, it should be registered with the
    // `LocalModuleScopeRegistry`
    // so that when this component appears in an `@NgModule` scope, its selector can be
    // determined.
    if (metadata.selector !== null) {
      const ref = new Reference(node);
      this.metaRegistry.registerDirectiveMetadata({
        ref,
        name: node.name.text,
        selector: metadata.selector,
        exportAs: metadata.exportAs,
        inputs: metadata.inputs,
        outputs: metadata.outputs,
        queries: metadata.queries.map(query => query.propertyName),
        isComponent: true, ...extractDirectiveGuards(node, this.reflector),
        baseClass: readBaseClass(node, this.reflector, this.evaluator),
      });
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
        this.resourceDependencies.recordResourceDependency(node.getSourceFile(), resourceUrl);
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
      animations = new WrappedNodeExpr(component.get('animations') !);
    }

    const output = {
      analysis: {
        meta: {
          ...metadata,
          template,
          encapsulation,
          interpolation: template.interpolation,
          styles: styles || [],

          // These will be replaced during the compilation step, after all `NgModule`s have been
          // analyzed and the full compilation scope for the component can be realized.
          pipes: EMPTY_MAP,
          directives: EMPTY_ARRAY,
          wrapDirectivesAndPipesInClosure: false,  //
          animations,
          viewProviders,
          i18nUseExternalIds: this.i18nUseExternalIds, relativeContextFilePath
        },
        metadataStmt: generateSetClassMetadataCall(
            node, this.reflector, this.defaultImportRecorder, this.isCore),
        parsedTemplate: template, parseTemplate,
      },
      typeCheck: true,
    };
    if (changeDetection !== null) {
      (output.analysis.meta as R3ComponentMetadata).changeDetection = changeDetection;
    }
    return output;
  }

  index(context: IndexingContext, node: ClassDeclaration, analysis: ComponentHandlerData) {
    // The component template may have been previously parsed without preserving whitespace or with
    // `leadingTriviaChar`s, both of which may manipulate the AST into a form not representative of
    // the source code, making it unsuitable for indexing. The template is reparsed with preserving
    // options to remedy this.
    const template = analysis.parseTemplate({
      preserveWhitespaces: true,
      leadingTriviaChars: [],
    });
    const scope = this.scopeRegistry.getScopeForComponent(node);
    const selector = analysis.meta.selector;
    const matcher = new SelectorMatcher<DirectiveMeta>();
    if (scope !== null) {
      for (const directive of scope.compilation.directives) {
        matcher.addSelectables(CssSelector.parse(directive.selector), directive);
      }
    }
    const binder = new R3TargetBinder(matcher);
    const boundTemplate = binder.bind({template: template.nodes});

    context.addComponent({
      declaration: node,
      selector,
      boundTemplate,
      templateMeta: {
        isInline: template.isInline,
        file: template.file,
      },
    });
  }

  typeCheck(ctx: TypeCheckContext, node: ClassDeclaration, meta: ComponentHandlerData): void {
    if (!ts.isClassDeclaration(node)) {
      return;
    }
    const scope = this.scopeRegistry.getScopeForComponent(node);
    const matcher = new SelectorMatcher<DirectiveMeta>();
    if (scope !== null) {
      for (const meta of scope.compilation.directives) {
        const extMeta = flattenInheritedDirectiveMetadata(this.metaReader, meta.ref);
        matcher.addSelectables(CssSelector.parse(meta.selector), extMeta);
      }
      const bound = new R3TargetBinder(matcher).bind({template: meta.parsedTemplate.nodes});
      const pipes = new Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>();
      for (const {name, ref} of scope.compilation.pipes) {
        if (!ts.isClassDeclaration(ref.node)) {
          throw new Error(
              `Unexpected non-class declaration ${ts.SyntaxKind[ref.node.kind]} for pipe ${ref.debugName}`);
        }
        pipes.set(name, ref as Reference<ClassDeclaration<ts.ClassDeclaration>>);
      }
      ctx.addTemplate(new Reference(node), bound, pipes, meta.parsedTemplate.file);
    }
  }

  resolve(node: ClassDeclaration, analysis: ComponentHandlerData): ResolveResult {
    const context = node.getSourceFile();
    // Check whether this component was registered with an NgModule. If so, it should be compiled
    // under that module's compilation scope.
    const scope = this.scopeRegistry.getScopeForComponent(node);
    let metadata = analysis.meta;
    if (scope !== null) {
      // Replace the empty components and directives from the analyze() step with a fully expanded
      // scope. This is possible now because during resolve() the whole compilation unit has been
      // fully analyzed.
      //
      // First it needs to be determined if actually importing the directives/pipes used in the
      // template would create a cycle. Currently ngtsc refuses to generate cycles, so an option
      // known as "remote scoping" is used if a cycle would be created. In remote scoping, the
      // module file sets the directives/pipes on the ngComponentDef of the component, without
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
        const expression = this.refEmitter.emit(ref, context);
        directives.push({selector, expression});
        matcher.addSelectables(CssSelector.parse(selector), {...dir, expression});
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
      const usedPipes = bound.getUsedPipes().map(name => pipes.get(name) !);

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

        // Check whether the directive/pipe arrays in ngComponentDef need to be wrapped in closures.
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
        metadata.directives = directives;
        metadata.pipes = pipes;
        metadata.wrapDirectivesAndPipesInClosure = wrapDirectivesAndPipesInClosure;
      } else {
        // Declaring the directiveDefs/pipeDefs arrays directly would require imports that would
        // create a cycle. Instead, mark this component as requiring remote scoping, so that the
        // NgModule file will take care of setting the directives for the component.
        this.scopeRegistry.setComponentAsRequiringRemoteScoping(node);
      }
    }
    return {};
  }

  compile(node: ClassDeclaration, analysis: ComponentHandlerData, pool: ConstantPool):
      CompileResult {
    const res = compileComponentFromMetadata(analysis.meta, pool, makeBindingParser());

    const statements = res.statements;
    if (analysis.metadataStmt !== null) {
      statements.push(analysis.metadataStmt);
    }
    return {
      name: 'ngComponentDef',
      initializer: res.expression, statements,
      type: res.type,
    };
  }

  private _resolveLiteral(decorator: Decorator): ts.ObjectLiteralExpression {
    if (this.literalCache.has(decorator)) {
      return this.literalCache.get(decorator) !;
    }
    if (decorator.args === null || decorator.args.length !== 1) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARITY_WRONG, decorator.node,
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
      const expr = component.get(field) !;
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

    const styleUrlsExpr = component.get('styleUrls') !;
    const styleUrls = this.evaluator.evaluate(styleUrlsExpr);
    if (!Array.isArray(styleUrls) || !styleUrls.every(url => typeof url === 'string')) {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, styleUrlsExpr, 'styleUrls must be an array of strings');
    }
    styleUrls.push(...extraUrls);
    return styleUrls as string[];
  }

  private _preloadAndParseTemplate(
      node: ts.Declaration, decorator: Decorator, component: Map<string, ts.Expression>,
      containingFile: string): Promise<ParsedTemplate|null> {
    if (component.has('templateUrl')) {
      // Extract the templateUrl and preload it.
      const templateUrlExpr = component.get('templateUrl') !;
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
          const templateStr = this.resourceLoader.load(resourceUrl);
          this.resourceDependencies.recordResourceDependency(node.getSourceFile(), resourceUrl);
          const template = this._parseTemplate(
              component, templateStr, sourceMapUrl(resourceUrl), /* templateRange */ undefined,
              /* escapedString */ false);
          this.preanalyzeTemplateCache.set(node, template);
          return template;
        });
      } else {
        return Promise.resolve(null);
      }
    } else {
      const inlineTemplate = this._extractInlineTemplate(component, containingFile);
      if (inlineTemplate === null) {
        throw new FatalDiagnosticError(
            ErrorCode.COMPONENT_MISSING_TEMPLATE, decorator.node,
            'component is missing a template');
      }

      const {templateStr, templateUrl, escapedString, templateRange} = inlineTemplate;
      const template =
          this._parseTemplate(component, templateStr, templateUrl, templateRange, escapedString);
      this.preanalyzeTemplateCache.set(node, template);
      return Promise.resolve(template);
    }
  }

  private _extractInlineTemplate(component: Map<string, ts.Expression>, containingFile: string): {
    templateStr: string,
    templateUrl: string,
    templateRange: LexerRange|undefined,
    escapedString: boolean
  }|null {
    // If there is no inline template, then return null.
    if (!component.has('template')) {
      return null;
    }
    const templateExpr = component.get('template') !;
    let templateStr: string;
    let templateUrl: string = '';
    let templateRange: LexerRange|undefined = undefined;
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
    } else {
      const resolvedTemplate = this.evaluator.evaluate(templateExpr);
      if (typeof resolvedTemplate !== 'string') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, templateExpr, 'template must be a string');
      }
      templateStr = resolvedTemplate;
    }
    return {templateStr, templateUrl, templateRange, escapedString};
  }

  private _parseTemplate(
      component: Map<string, ts.Expression>, templateStr: string, templateUrl: string,
      templateRange: LexerRange|undefined, escapedString: boolean,
      options: ParseTemplateOptions = {}): ParsedTemplate {
    let preserveWhitespaces: boolean = this.defaultPreserveWhitespaces;
    if (component.has('preserveWhitespaces')) {
      const expr = component.get('preserveWhitespaces') !;
      const value = this.evaluator.evaluate(expr);
      if (typeof value !== 'boolean') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, expr, 'preserveWhitespaces must be a boolean');
      }
      preserveWhitespaces = value;
    }

    let interpolation: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG;
    if (component.has('interpolation')) {
      const expr = component.get('interpolation') !;
      const value = this.evaluator.evaluate(expr);
      if (!Array.isArray(value) || value.length !== 2 ||
          !value.every(element => typeof element === 'string')) {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, expr,
            'interpolation must be an array with 2 elements of string type');
      }
      interpolation = InterpolationConfig.fromArray(value as[string, string]);
    }

    return {
      interpolation,
      ...parseTemplate(templateStr, templateUrl, {
        preserveWhitespaces,
        interpolationConfig: interpolation,
        range: templateRange, escapedString, ...options,
      }),
      isInline: component.has('template'),
      file: new ParseSourceFile(templateStr, templateUrl),
    };
  }

  private _expressionToImportedFile(expr: Expression, origin: ts.SourceFile): ts.SourceFile|null {
    if (!(expr instanceof ExternalExpr)) {
      return null;
    }

    // Figure out what file is being imported.
    return this.moduleResolver.resolveModuleName(expr.value.moduleName !, origin);
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

interface ParsedTemplate {
  interpolation: InterpolationConfig;
  errors?: ParseError[]|undefined;
  nodes: TmplAstNode[];
  styleUrls: string[];
  styles: string[];
  isInline: boolean;
  file: ParseSourceFile;
}
