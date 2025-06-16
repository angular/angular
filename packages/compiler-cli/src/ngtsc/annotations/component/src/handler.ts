/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AnimationTriggerNames,
  BoundTarget,
  compileClassDebugInfo,
  compileHmrInitializer,
  compileComponentClassMetadata,
  compileComponentDeclareClassMetadata,
  compileComponentFromMetadata,
  compileDeclareComponentFromMetadata,
  compileDeferResolverFunction,
  ConstantPool,
  CssSelector,
  DeclarationListEmitMode,
  DeclareComponentTemplateInfo,
  DEFAULT_INTERPOLATION_CONFIG,
  DeferBlockDepsEmitMode,
  DomElementSchemaRegistry,
  ExternalExpr,
  FactoryTarget,
  makeBindingParser,
  outputAst as o,
  R3ComponentDeferMetadata,
  R3ComponentMetadata,
  R3DeferPerComponentDependency,
  R3DirectiveDependencyMetadata,
  R3NgModuleDependencyMetadata,
  R3PipeDependencyMetadata,
  R3TargetBinder,
  R3TemplateDependency,
  R3TemplateDependencyKind,
  R3TemplateDependencyMetadata,
  SchemaMetadata,
  SelectorMatcher,
  TmplAstDeferredBlock,
  ViewEncapsulation,
  DirectiveMatcher,
  SelectorlessMatcher,
} from '@angular/compiler';
import ts from 'typescript';

import {Cycle, CycleAnalyzer, CycleHandlingStrategy} from '../../../cycles';
import {
  ErrorCode,
  FatalDiagnosticError,
  makeDiagnostic,
  makeRelatedInformation,
} from '../../../diagnostics';
import {absoluteFrom, relative} from '../../../file_system';
import {
  assertSuccessfulReferenceEmit,
  DeferredSymbolTracker,
  ImportedFile,
  ImportedSymbolsTracker,
  LocalCompilationExtraImportsTracker,
  ModuleResolver,
  Reference,
  ReferenceEmitter,
} from '../../../imports';
import {DependencyTracker} from '../../../incremental/api';
import {
  extractSemanticTypeParameters,
  SemanticDepGraphUpdater,
} from '../../../incremental/semantic_graph';
import {IndexingContext} from '../../../indexer';
import {
  DirectiveMeta,
  extractDirectiveTypeCheckMeta,
  HostDirectivesResolver,
  MatchSource,
  MetadataReader,
  MetadataRegistry,
  MetaKind,
  NgModuleMeta,
  PipeMeta,
  Resource,
  ResourceRegistry,
} from '../../../metadata';
import {PartialEvaluator} from '../../../partial_evaluator';
import {PerfEvent, PerfRecorder} from '../../../perf';
import {
  ClassDeclaration,
  DeclarationNode,
  Decorator,
  Import,
  isNamedClassDeclaration,
  ReflectionHost,
  reflectObjectLiteral,
} from '../../../reflection';
import {
  ComponentScopeKind,
  ComponentScopeReader,
  DtsModuleScopeResolver,
  LocalModuleScope,
  LocalModuleScopeRegistry,
  makeNotStandaloneDiagnostic,
  makeUnknownComponentImportDiagnostic,
  StandaloneScope,
  TypeCheckScopeRegistry,
} from '../../../scope';
import {
  getDiagnosticNode,
  makeUnknownComponentDeferredImportDiagnostic,
} from '../../../scope/src/util';
import {
  AnalysisOutput,
  CompilationMode,
  CompileResult,
  DecoratorHandler,
  DetectResult,
  HandlerPrecedence,
  ResolveResult,
} from '../../../transform';
import {
  TypeCheckId,
  TypeCheckableDirectiveMeta,
  TypeCheckContext,
  TemplateContext,
  HostBindingsContext,
} from '../../../typecheck/api';
import {ExtendedTemplateChecker} from '../../../typecheck/extended/api';
import {TemplateSemanticsChecker} from '../../../typecheck/template_semantics/api/api';
import {getSourceFile} from '../../../util/src/typescript';
import {Xi18nContext} from '../../../xi18n';
import {
  combineResolvers,
  compileDeclareFactory,
  compileInputTransformFields,
  compileNgFactoryDefField,
  compileResults,
  createForwardRefResolver,
  extractClassDebugInfo,
  extractClassMetadata,
  extractSchemas,
  findAngularDecorator,
  getDirectiveDiagnostics,
  getProviderDiagnostics,
  InjectableClassRegistry,
  isExpressionForwardReference,
  readBaseClass,
  ReferencesRegistry,
  removeIdentifierReferences,
  resolveEncapsulationEnumValueLocally,
  resolveEnumValue,
  resolveImportedFile,
  resolveLiteral,
  resolveProvidersRequiringFactory,
  ResourceLoader,
  toFactoryMetadata,
  tryUnwrapForwardRef,
  validateHostDirectives,
  wrapFunctionExpressionsInParens,
} from '../../common';
import {
  extractDirectiveMetadata,
  extractHostBindingResources,
  parseDirectiveStyles,
} from '../../directive';
import {createModuleWithProvidersResolver, NgModuleSymbol} from '../../ng_module';

import {checkCustomElementSelectorForErrors, makeCyclicImportInfo} from './diagnostics';
import {
  ComponentAnalysisData,
  ComponentResolutionData,
  DeferredComponentDependency,
} from './metadata';
import {
  _extractTemplateStyleUrls,
  createEmptyTemplate,
  extractComponentStyleUrls,
  extractInlineStyleResources,
  extractTemplate,
  makeResourceNotFoundError,
  ParsedTemplateWithSource,
  parseTemplateDeclaration,
  preloadAndParseTemplate,
  ResourceTypeForDiagnostics,
  StyleUrlMeta,
  transformDecoratorResources,
} from './resources';
import {ComponentSymbol} from './symbol';
import {
  animationTriggerResolver,
  collectAnimationNames,
  validateAndFlattenComponentImports,
} from './util';
import {getTemplateDiagnostics, createHostElement} from '../../../typecheck';
import {JitDeclarationRegistry} from '../../common/src/jit_declaration_registry';
import {extractHmrMetatadata, getHmrUpdateDeclaration} from '../../../hmr';
import {getProjectRelativePath} from '../../../util/src/path';
import {ComponentScope} from '../../../scope/src/api';
import {analyzeTemplateForSelectorless} from './selectorless';

const EMPTY_ARRAY: any[] = [];

type UsedDirective = R3DirectiveDependencyMetadata & {
  ref: Reference<ClassDeclaration>;
  importedFile: ImportedFile;
};

type UsedPipe = R3PipeDependencyMetadata & {
  ref: Reference<ClassDeclaration>;
  importedFile: ImportedFile;
};

type UsedNgModule = R3NgModuleDependencyMetadata & {
  importedFile: ImportedFile;
};

type AnyUsedType = UsedPipe | UsedDirective | UsedNgModule;

type ComponentTemplate = R3ComponentMetadata<R3TemplateDependency>['template'];

type ComponentDeclarations = Map<ClassDeclaration, UsedPipe | UsedDirective | UsedNgModule>;

const isUsedDirective = (decl: AnyUsedType): decl is UsedDirective =>
  decl.kind === R3TemplateDependencyKind.Directive;

const isUsedPipe = (decl: AnyUsedType): decl is UsedPipe =>
  decl.kind === R3TemplateDependencyKind.Pipe;

/**
 * `DecoratorHandler` which handles the `@Component` annotation.
 */
export class ComponentDecoratorHandler
  implements
    DecoratorHandler<Decorator, ComponentAnalysisData, ComponentSymbol, ComponentResolutionData>
{
  constructor(
    private reflector: ReflectionHost,
    private evaluator: PartialEvaluator,
    private metaRegistry: MetadataRegistry,
    private metaReader: MetadataReader,
    private scopeReader: ComponentScopeReader,
    private compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
    private scopeRegistry: LocalModuleScopeRegistry,
    private typeCheckScopeRegistry: TypeCheckScopeRegistry,
    private resourceRegistry: ResourceRegistry,
    private isCore: boolean,
    private strictCtorDeps: boolean,
    private resourceLoader: ResourceLoader,
    private rootDirs: ReadonlyArray<string>,
    private defaultPreserveWhitespaces: boolean,
    private i18nUseExternalIds: boolean,
    private enableI18nLegacyMessageIdFormat: boolean,
    private usePoisonedData: boolean,
    private i18nNormalizeLineEndingsInICUs: boolean,
    private moduleResolver: ModuleResolver,
    private cycleAnalyzer: CycleAnalyzer,
    private cycleHandlingStrategy: CycleHandlingStrategy,
    private refEmitter: ReferenceEmitter,
    private referencesRegistry: ReferencesRegistry,
    private depTracker: DependencyTracker | null,
    private injectableRegistry: InjectableClassRegistry,
    private semanticDepGraphUpdater: SemanticDepGraphUpdater | null,
    private annotateForClosureCompiler: boolean,
    private perf: PerfRecorder,
    private hostDirectivesResolver: HostDirectivesResolver,
    private importTracker: ImportedSymbolsTracker,
    private includeClassMetadata: boolean,
    private readonly compilationMode: CompilationMode,
    private readonly deferredSymbolTracker: DeferredSymbolTracker,
    private readonly forbidOrphanRendering: boolean,
    private readonly enableBlockSyntax: boolean,
    private readonly enableLetSyntax: boolean,
    private readonly externalRuntimeStyles: boolean,
    private readonly localCompilationExtraImportsTracker: LocalCompilationExtraImportsTracker | null,
    private readonly jitDeclarationRegistry: JitDeclarationRegistry,
    private readonly i18nPreserveSignificantWhitespace: boolean,
    private readonly strictStandalone: boolean,
    private readonly enableHmr: boolean,
    private readonly implicitStandaloneValue: boolean,
    private readonly typeCheckHostBindings: boolean,
    private readonly enableSelectorless: boolean,
    private readonly emitDeclarationOnly: boolean,
  ) {
    this.extractTemplateOptions = {
      enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
      i18nNormalizeLineEndingsInICUs: this.i18nNormalizeLineEndingsInICUs,
      usePoisonedData: this.usePoisonedData,
      enableBlockSyntax: this.enableBlockSyntax,
      enableLetSyntax: this.enableLetSyntax,
      enableSelectorless: this.enableSelectorless,
      preserveSignificantWhitespace: this.i18nPreserveSignificantWhitespace,
    };

    // Dependencies can't be deferred during HMR, because the HMR update module can't have
    // dynamic imports and its dependencies need to be passed in directly. If dependencies
    // are deferred, their imports will be deleted so we may lose the reference to them.
    this.canDeferDeps = !enableHmr;
  }

  private literalCache = new Map<Decorator, ts.ObjectLiteralExpression>();
  private elementSchemaRegistry = new DomElementSchemaRegistry();

  /**
   * During the asynchronous preanalyze phase, it's necessary to parse the template to extract
   * any potential <link> tags which might need to be loaded. This cache ensures that work is not
   * thrown away, and the parsed template is reused during the analyze phase.
   */
  private preanalyzeTemplateCache = new Map<DeclarationNode, ParsedTemplateWithSource>();
  private preanalyzeStylesCache = new Map<DeclarationNode, string[] | null>();

  /** Whether generated code for a component can defer its dependencies. */
  private readonly canDeferDeps: boolean;

  private extractTemplateOptions: {
    enableI18nLegacyMessageIdFormat: boolean;
    i18nNormalizeLineEndingsInICUs: boolean;
    usePoisonedData: boolean;
    enableBlockSyntax: boolean;
    enableLetSyntax: boolean;
    enableSelectorless: boolean;
    preserveSignificantWhitespace?: boolean;
  };

  readonly precedence = HandlerPrecedence.PRIMARY;
  readonly name = 'ComponentDecoratorHandler';

  detect(
    node: ClassDeclaration,
    decorators: Decorator[] | null,
  ): DetectResult<Decorator> | undefined {
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

  preanalyze(node: ClassDeclaration, decorator: Readonly<Decorator>): Promise<void> | undefined {
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

    const resolveStyleUrl = (styleUrl: string): Promise<void> | undefined => {
      try {
        const resourceUrl = this.resourceLoader.resolve(styleUrl, containingFile);
        return this.resourceLoader.preload(resourceUrl, {
          type: 'style',
          containingFile,
          className: node.name.text,
        });
      } catch {
        // Don't worry about failures to preload. We can handle this problem during analysis by
        // producing a diagnostic.
        return undefined;
      }
    };

    // A Promise that waits for the template and all <link>ed styles within it to be preloaded.
    const templateAndTemplateStyleResources = preloadAndParseTemplate(
      this.evaluator,
      this.resourceLoader,
      this.depTracker,
      this.preanalyzeTemplateCache,
      node,
      decorator,
      component,
      containingFile,
      this.defaultPreserveWhitespaces,
      this.extractTemplateOptions,
      this.compilationMode,
    ).then(
      (template): {templateUrl?: string; templateStyles: string[]; templateStyleUrls: string[]} => {
        if (template === null) {
          return {templateStyles: [], templateStyleUrls: []};
        }

        let templateUrl;
        if (template.sourceMapping.type === 'external') {
          templateUrl = template.sourceMapping.templateUrl;
        }

        return {
          templateUrl,
          templateStyles: template.styles,
          templateStyleUrls: template.styleUrls,
        };
      },
    );

    // Extract all the styleUrls in the decorator.
    const componentStyleUrls = extractComponentStyleUrls(this.evaluator, component);

    return templateAndTemplateStyleResources.then(async (templateInfo) => {
      // Extract inline styles, process, and cache for use in synchronous analyze phase
      let styles: string[] | null = null;
      // Order plus className allows inline styles to be identified per component by a preprocessor
      let orderOffset = 0;
      const rawStyles = parseDirectiveStyles(component, this.evaluator, this.compilationMode);
      if (rawStyles?.length) {
        styles = await Promise.all(
          rawStyles.map((style) =>
            this.resourceLoader.preprocessInline(style, {
              type: 'style',
              containingFile,
              order: orderOffset++,
              className: node.name.text,
            }),
          ),
        );
      }
      if (templateInfo.templateStyles) {
        styles ??= [];
        styles.push(
          ...(await Promise.all(
            templateInfo.templateStyles.map((style) =>
              this.resourceLoader.preprocessInline(style, {
                type: 'style',
                containingFile: templateInfo.templateUrl ?? containingFile,
                order: orderOffset++,
                className: node.name.text,
              }),
            ),
          )),
        );
      }

      this.preanalyzeStylesCache.set(node, styles);

      if (this.externalRuntimeStyles) {
        // No preanalysis required for style URLs with external runtime styles
        return;
      }

      // Wait for both the template and all styleUrl resources to resolve.
      await Promise.all([
        ...componentStyleUrls.map((styleUrl) => resolveStyleUrl(styleUrl.url)),
        ...templateInfo.templateStyleUrls.map((url) => resolveStyleUrl(url)),
      ]);
    });
  }

  analyze(
    node: ClassDeclaration,
    decorator: Readonly<Decorator>,
  ): AnalysisOutput<ComponentAnalysisData> {
    this.perf.eventCount(PerfEvent.AnalyzeComponent);
    const containingFile = node.getSourceFile().fileName;
    this.literalCache.delete(decorator);

    let diagnostics: ts.Diagnostic[] | undefined;
    let isPoisoned = false;
    // @Component inherits @Directive, so begin by extracting the @Directive metadata and building
    // on it.
    const directiveResult = extractDirectiveMetadata(
      node,
      decorator,
      this.reflector,
      this.importTracker,
      this.evaluator,
      this.refEmitter,
      this.referencesRegistry,
      this.isCore,
      this.annotateForClosureCompiler,
      this.compilationMode,
      this.elementSchemaRegistry.getDefaultComponentElementName(),
      this.strictStandalone,
      this.implicitStandaloneValue,
      this.emitDeclarationOnly,
    );
    // `extractDirectiveMetadata` returns `jitForced = true` when the `@Component` has
    // set `jit: true`. In this case, compilation of the decorator is skipped. Returning
    // an empty object signifies that no analysis was produced.
    if (directiveResult.jitForced) {
      this.jitDeclarationRegistry.jitDeclarations.add(node);
      return {};
    }

    // Next, read the `@Component`-specific fields.
    const {
      decorator: component,
      metadata,
      inputs,
      outputs,
      hostDirectives,
      rawHostDirectives,
    } = directiveResult;
    const encapsulation: number =
      (this.compilationMode !== CompilationMode.LOCAL
        ? resolveEnumValue(
            this.evaluator,
            component,
            'encapsulation',
            'ViewEncapsulation',
            this.isCore,
          )
        : resolveEncapsulationEnumValueLocally(component.get('encapsulation'))) ??
      ViewEncapsulation.Emulated;

    let changeDetection: number | o.Expression | null = null;
    if (this.compilationMode !== CompilationMode.LOCAL) {
      changeDetection = resolveEnumValue(
        this.evaluator,
        component,
        'changeDetection',
        'ChangeDetectionStrategy',
        this.isCore,
      );
    } else if (component.has('changeDetection')) {
      changeDetection = new o.WrappedNodeExpr(component.get('changeDetection')!);
    }

    let animations: o.Expression | null = null;
    let animationTriggerNames: AnimationTriggerNames | null = null;
    if (component.has('animations')) {
      const animationExpression = component.get('animations')!;
      animations = new o.WrappedNodeExpr(animationExpression);
      const animationsValue = this.evaluator.evaluate(
        animationExpression,
        animationTriggerResolver,
      );
      animationTriggerNames = {includesDynamicAnimations: false, staticTriggerNames: []};
      collectAnimationNames(animationsValue, animationTriggerNames);
    }

    // Go through the root directories for this project, and select the one with the smallest
    // relative path representation.
    const relativeContextFilePath = this.rootDirs.reduce<string | undefined>(
      (previous, rootDir) => {
        const candidate = relative(absoluteFrom(rootDir), absoluteFrom(containingFile));
        if (previous === undefined || candidate.length < previous.length) {
          return candidate;
        } else {
          return previous;
        }
      },
      undefined,
    )!;

    // Note that we could technically combine the `viewProvidersRequiringFactory` and
    // `providersRequiringFactory` into a single set, but we keep the separate so that
    // we can distinguish where an error is coming from when logging the diagnostics in `resolve`.
    let viewProvidersRequiringFactory: Set<Reference<ClassDeclaration>> | null = null;
    let providersRequiringFactory: Set<Reference<ClassDeclaration>> | null = null;
    let wrappedViewProviders: o.Expression | null = null;

    if (component.has('viewProviders')) {
      const viewProviders = component.get('viewProviders')!;
      viewProvidersRequiringFactory = resolveProvidersRequiringFactory(
        viewProviders,
        this.reflector,
        this.evaluator,
      );
      wrappedViewProviders = new o.WrappedNodeExpr(
        this.annotateForClosureCompiler
          ? wrapFunctionExpressionsInParens(viewProviders)
          : viewProviders,
      );
    }

    if (component.has('providers')) {
      providersRequiringFactory = resolveProvidersRequiringFactory(
        component.get('providers')!,
        this.reflector,
        this.evaluator,
      );
    }

    let resolvedImports: Reference<ClassDeclaration>[] | null = null;
    let resolvedDeferredImports: Reference<ClassDeclaration>[] | null = null;

    let rawImports: ts.Expression | null = component.get('imports') ?? null;
    let rawDeferredImports: ts.Expression | null = component.get('deferredImports') ?? null;

    if ((rawImports || rawDeferredImports) && !metadata.isStandalone) {
      if (diagnostics === undefined) {
        diagnostics = [];
      }
      const importsField = rawImports ? 'imports' : 'deferredImports';
      diagnostics.push(
        makeDiagnostic(
          ErrorCode.COMPONENT_NOT_STANDALONE,
          component.get(importsField)!,
          `'${importsField}' is only valid on a component that is standalone.`,
          [
            makeRelatedInformation(
              node.name,
              `Did you forget to add 'standalone: true' to this @Component?`,
            ),
          ],
        ),
      );
      // Poison the component so that we don't spam further template type-checking errors that
      // result from misconfigured imports.
      isPoisoned = true;
    } else if (
      this.compilationMode !== CompilationMode.LOCAL &&
      (rawImports || rawDeferredImports)
    ) {
      const importResolvers = combineResolvers([
        createModuleWithProvidersResolver(this.reflector, this.isCore),
        createForwardRefResolver(this.isCore),
      ]);

      const importDiagnostics: ts.Diagnostic[] = [];

      if (rawImports) {
        const expr = rawImports;
        const imported = this.evaluator.evaluate(expr, importResolvers);
        const {imports: flattened, diagnostics} = validateAndFlattenComponentImports(
          imported,
          expr,
          false /* isDeferred */,
        );
        importDiagnostics.push(...diagnostics);
        resolvedImports = flattened;
        rawImports = expr;
      }

      if (rawDeferredImports) {
        const expr = rawDeferredImports;
        const imported = this.evaluator.evaluate(expr, importResolvers);
        const {imports: flattened, diagnostics} = validateAndFlattenComponentImports(
          imported,
          expr,
          true /* isDeferred */,
        );
        importDiagnostics.push(...diagnostics);
        resolvedDeferredImports = flattened;
        rawDeferredImports = expr;
      }

      if (importDiagnostics.length > 0) {
        isPoisoned = true;
        if (diagnostics === undefined) {
          diagnostics = [];
        }
        diagnostics.push(...importDiagnostics);
      }
    }

    let schemas: SchemaMetadata[] | null = null;
    if (component.has('schemas') && !metadata.isStandalone) {
      if (diagnostics === undefined) {
        diagnostics = [];
      }
      diagnostics.push(
        makeDiagnostic(
          ErrorCode.COMPONENT_NOT_STANDALONE,
          component.get('schemas')!,
          `'schemas' is only valid on a component that is standalone.`,
        ),
      );
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
      try {
        const templateDecl = parseTemplateDeclaration(
          node,
          decorator,
          component,
          containingFile,
          this.evaluator,
          this.depTracker,
          this.resourceLoader,
          this.defaultPreserveWhitespaces,
        );
        template = extractTemplate(
          node,
          templateDecl,
          this.evaluator,
          this.depTracker,
          this.resourceLoader,
          {
            enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
            i18nNormalizeLineEndingsInICUs: this.i18nNormalizeLineEndingsInICUs,
            usePoisonedData: this.usePoisonedData,
            enableBlockSyntax: this.enableBlockSyntax,
            enableLetSyntax: this.enableLetSyntax,
            enableSelectorless: this.enableSelectorless,
            preserveSignificantWhitespace: this.i18nPreserveSignificantWhitespace,
          },
          this.compilationMode,
        );

        if (
          this.compilationMode === CompilationMode.LOCAL &&
          template.errors &&
          template.errors.length > 0
        ) {
          // Template errors are handled at the type check phase. But we skip this phase in local
          // compilation mode. As a result we need to handle the errors now and add them to the diagnostics.
          if (diagnostics === undefined) {
            diagnostics = [];
          }

          diagnostics.push(
            ...getTemplateDiagnostics(
              template.errors,
              // Type check ID is required as part of the ype check, mainly for mapping the
              // diagnostic back to its source. But here we are generating the diagnostic outside
              // of the type check context, and so we skip the template ID.
              '' as TypeCheckId,
              template.sourceMapping,
            ),
          );
        }
      } catch (e) {
        if (e instanceof FatalDiagnosticError) {
          diagnostics ??= [];
          diagnostics.push(e.toDiagnostic());
          isPoisoned = true;
          // Create an empty template for the missing/invalid template.
          // A build will still fail in this case. However, for the language service,
          // this allows the component to exist in the compiler registry and prevents
          // cascading diagnostics within an IDE due to "missing" components. The
          // originating template related errors will still be reported in the IDE.
          template = createEmptyTemplate(node, component, containingFile);
        } else {
          throw e;
        }
      }
    }
    const templateResource: Resource = template.declaration.isInline
      ? {path: null, node: component.get('template')!}
      : {
          path: absoluteFrom(template.declaration.resolvedTemplateUrl),
          node: template.sourceMapping.node,
        };
    const relativeTemplatePath = getProjectRelativePath(
      templateResource.path ?? ts.getOriginalNode(node).getSourceFile().fileName,
      this.rootDirs,
      this.compilerHost,
    );

    let selectorlessEnabled = false;
    let localReferencedSymbols: Set<string> | null = null;

    if (this.enableSelectorless) {
      const templateAnalysis = analyzeTemplateForSelectorless(template.nodes);
      selectorlessEnabled = templateAnalysis.isSelectorless;
      localReferencedSymbols = templateAnalysis.localReferencedSymbols;
    }

    if (selectorlessEnabled) {
      if (!metadata.isStandalone) {
        isPoisoned = true;
        diagnostics ??= [];
        diagnostics.push(
          makeDiagnostic(
            ErrorCode.COMPONENT_NOT_STANDALONE,
            component.get('standalone') || node.name,
            `Cannot use selectorless with a component that is not standalone`,
          ),
        );
      } else if (rawImports || rawDeferredImports) {
        isPoisoned = true;
        diagnostics ??= [];
        diagnostics.push(
          makeDiagnostic(
            ErrorCode.UNSUPPORTED_SELECTORLESS_COMPONENT_FIELD,
            (rawImports || rawDeferredImports)!,
            `Cannot use the "${rawImports === null ? 'deferredImports' : 'imports'}" field in a selectorless component`,
          ),
        );
      }
    }

    // Figure out the set of styles. The ordering here is important: external resources (styleUrls)
    // precede inline styles, and styles defined in the template override styles defined in the
    // component.
    let styles: string[] = [];
    const externalStyles: string[] = [];

    const hostBindingResources = extractHostBindingResources(directiveResult.hostBindingNodes);
    const styleResources = extractInlineStyleResources(component);
    const styleUrls: StyleUrlMeta[] = [
      ...extractComponentStyleUrls(this.evaluator, component),
      ..._extractTemplateStyleUrls(template),
    ];

    for (const styleUrl of styleUrls) {
      try {
        const resourceUrl = this.resourceLoader.resolve(styleUrl.url, containingFile);
        if (this.externalRuntimeStyles) {
          // External runtime styles are not considered disk-based and may not actually exist on disk
          externalStyles.push(resourceUrl);
          continue;
        }
        if (
          styleUrl.source === ResourceTypeForDiagnostics.StylesheetFromDecorator &&
          ts.isStringLiteralLike(styleUrl.expression)
        ) {
          // Only string literal values from the decorator are considered style resources
          styleResources.add({
            path: absoluteFrom(resourceUrl),
            node: styleUrl.expression,
          });
        }
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
          styleUrl.source === ResourceTypeForDiagnostics.StylesheetFromDecorator
            ? ResourceTypeForDiagnostics.StylesheetFromDecorator
            : ResourceTypeForDiagnostics.StylesheetFromTemplate;
        diagnostics.push(
          makeResourceNotFoundError(styleUrl.url, styleUrl.expression, resourceType).toDiagnostic(),
        );
      }
    }

    if (encapsulation === ViewEncapsulation.ShadowDom && metadata.selector !== null) {
      const selectorError = checkCustomElementSelectorForErrors(metadata.selector);
      if (selectorError !== null) {
        if (diagnostics === undefined) {
          diagnostics = [];
        }
        diagnostics.push(
          makeDiagnostic(
            ErrorCode.COMPONENT_INVALID_SHADOW_DOM_SELECTOR,
            component.get('selector')!,
            selectorError,
          ),
        );
      }
    }

    // If inline styles were preprocessed use those
    let inlineStyles: string[] | null = null;
    if (this.preanalyzeStylesCache.has(node)) {
      inlineStyles = this.preanalyzeStylesCache.get(node)!;
      this.preanalyzeStylesCache.delete(node);
      if (inlineStyles?.length) {
        if (this.externalRuntimeStyles) {
          // When external runtime styles is enabled, a list of URLs is provided
          externalStyles.push(...inlineStyles);
        } else {
          styles.push(...inlineStyles);
        }
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

      if (template.styles.length > 0) {
        styles.push(...template.styles);
      }
    }

    // Collect all explicitly deferred symbols from the `@Component.deferredImports` field
    // (if it exists) and populate the `DeferredSymbolTracker` state. These operations are safe
    // for the local compilation mode, since they don't require accessing/resolving symbols
    // outside of the current source file.
    let explicitlyDeferredTypes: R3DeferPerComponentDependency[] | null = null;
    if (metadata.isStandalone && rawDeferredImports !== null) {
      const deferredTypes = this.collectExplicitlyDeferredSymbols(rawDeferredImports);
      for (const [deferredType, importDetails] of deferredTypes) {
        explicitlyDeferredTypes ??= [];
        explicitlyDeferredTypes.push({
          symbolName: importDetails.name,
          importPath: importDetails.from,
          isDefaultImport: isDefaultImport(importDetails.node),
        });
        this.deferredSymbolTracker.markAsDeferrableCandidate(
          deferredType,
          importDetails.node,
          node,
          true /* isExplicitlyDeferred */,
        );
      }
    }

    const output: AnalysisOutput<ComponentAnalysisData> = {
      analysis: {
        baseClass: readBaseClass(node, this.reflector, this.evaluator),
        inputs,
        inputFieldNamesFromMetadataArray: directiveResult.inputFieldNamesFromMetadataArray,
        outputs,
        hostDirectives,
        rawHostDirectives,
        selectorlessEnabled,
        localReferencedSymbols,
        meta: {
          ...metadata,
          template,
          encapsulation,
          changeDetection,
          interpolation: template.interpolationConfig ?? DEFAULT_INTERPOLATION_CONFIG,
          styles,
          externalStyles,
          // These will be replaced during the compilation step, after all `NgModule`s have been
          // analyzed and the full compilation scope for the component can be realized.
          animations,
          viewProviders: wrappedViewProviders,
          i18nUseExternalIds: this.i18nUseExternalIds,
          relativeContextFilePath,
          rawImports: rawImports !== null ? new o.WrappedNodeExpr(rawImports) : undefined,
          relativeTemplatePath,
        },
        typeCheckMeta: extractDirectiveTypeCheckMeta(node, inputs, this.reflector),
        classMetadata: this.includeClassMetadata
          ? extractClassMetadata(
              node,
              this.reflector,
              this.isCore,
              this.annotateForClosureCompiler,
              (dec) => transformDecoratorResources(dec, component, styles, template),
            )
          : null,
        classDebugInfo: extractClassDebugInfo(
          node,
          this.reflector,
          this.compilerHost,
          this.rootDirs,
          /* forbidOrphanRenderering */ this.forbidOrphanRendering,
        ),
        template,
        providersRequiringFactory,
        viewProvidersRequiringFactory,
        inlineStyles,
        styleUrls,
        resources: {
          styles: styleResources,
          template: templateResource,
          hostBindings: hostBindingResources,
        },
        isPoisoned,
        animationTriggerNames,
        rawImports,
        resolvedImports,
        rawDeferredImports,
        resolvedDeferredImports,
        explicitlyDeferredTypes,
        schemas,
        decorator: (decorator?.node as ts.Decorator | null) ?? null,
        hostBindingNodes: directiveResult.hostBindingNodes,
      },
      diagnostics,
    };

    return output;
  }

  symbol(node: ClassDeclaration, analysis: Readonly<ComponentAnalysisData>): ComponentSymbol {
    const typeParameters = extractSemanticTypeParameters(node);

    return new ComponentSymbol(
      node,
      analysis.meta.selector,
      analysis.inputs,
      analysis.outputs,
      analysis.meta.exportAs,
      analysis.typeCheckMeta,
      typeParameters,
    );
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
      inputFieldNamesFromMetadataArray: analysis.inputFieldNamesFromMetadataArray,
      outputs: analysis.outputs,
      queries: analysis.meta.queries.map((query) => query.propertyName),
      isComponent: true,
      baseClass: analysis.baseClass,
      hostDirectives: analysis.hostDirectives,
      ...analysis.typeCheckMeta,
      isPoisoned: analysis.isPoisoned,
      isStructural: false,
      isStandalone: analysis.meta.isStandalone,
      isSignal: analysis.meta.isSignal,
      imports: analysis.resolvedImports,
      rawImports: analysis.rawImports,
      deferredImports: analysis.resolvedDeferredImports,
      animationTriggerNames: analysis.animationTriggerNames,
      schemas: analysis.schemas,
      decorator: analysis.decorator,
      assumedToExportProviders: false,
      ngContentSelectors: analysis.template.ngContentSelectors,
      preserveWhitespaces: analysis.template.preserveWhitespaces ?? false,
      isExplicitlyDeferred: false,
      selectorlessEnabled: analysis.selectorlessEnabled,
      localReferencedSymbols: analysis.localReferencedSymbols,
    });

    this.resourceRegistry.registerResources(analysis.resources, node);
    this.injectableRegistry.registerInjectable(node, {
      ctorDeps: analysis.meta.deps,
    });
  }

  index(
    context: IndexingContext,
    node: ClassDeclaration,
    analysis: Readonly<ComponentAnalysisData>,
  ) {
    if (analysis.isPoisoned && !this.usePoisonedData) {
      return null;
    }
    const scope = this.scopeReader.getScopeForComponent(node);
    const selector = analysis.meta.selector;
    let matcher: DirectiveMatcher<DirectiveMeta> | null = null;
    if (scope !== null) {
      const isPoisoned =
        scope.kind === ComponentScopeKind.NgModule
          ? scope.compilation.isPoisoned
          : scope.isPoisoned;

      if (
        (isPoisoned || (scope.kind === ComponentScopeKind.NgModule && scope.exported.isPoisoned)) &&
        !this.usePoisonedData
      ) {
        // Don't bother indexing components which had erroneous scopes, unless specifically
        // requested.
        return null;
      }

      matcher = createMatcherFromScope(scope, this.hostDirectivesResolver);
    }

    const binder = new R3TargetBinder<DirectiveMeta>(matcher);
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

  typeCheck(
    ctx: TypeCheckContext,
    node: ClassDeclaration,
    meta: Readonly<ComponentAnalysisData>,
  ): void {
    if (!ts.isClassDeclaration(node) || (meta.isPoisoned && !this.usePoisonedData)) {
      return;
    }
    const scope = this.typeCheckScopeRegistry.getTypeCheckScope(node);
    if (scope.isPoisoned && !this.usePoisonedData) {
      // Don't type-check components that had errors in their scopes, unless requested.
      return;
    }

    const binder = new R3TargetBinder<TypeCheckableDirectiveMeta>(scope.matcher);
    const templateContext: TemplateContext = {
      nodes: meta.template.diagNodes,
      pipes: scope.pipes,
      sourceMapping: meta.template.sourceMapping,
      file: meta.template.file,
      parseErrors: meta.template.errors,
      preserveWhitespaces: meta.meta.template.preserveWhitespaces ?? false,
    };

    const hostElement = this.typeCheckHostBindings
      ? createHostElement(
          'component',
          meta.meta.selector,
          node,
          meta.hostBindingNodes.literal,
          meta.hostBindingNodes.bindingDecorators,
          meta.hostBindingNodes.listenerDecorators,
        )
      : null;
    const hostBindingsContext: HostBindingsContext | null =
      hostElement === null
        ? null
        : {
            node: hostElement,
            sourceMapping: {type: 'direct', node},
          };

    ctx.addDirective(
      new Reference(node),
      binder,
      scope.schemas,
      templateContext,
      hostBindingsContext,
      meta.meta.isStandalone,
    );
  }

  extendedTemplateCheck(
    component: ts.ClassDeclaration,
    extendedTemplateChecker: ExtendedTemplateChecker,
  ): ts.Diagnostic[] {
    return extendedTemplateChecker.getDiagnosticsForComponent(component);
  }

  templateSemanticsCheck(
    component: ts.ClassDeclaration,
    templateSemanticsChecker: TemplateSemanticsChecker,
  ): ts.Diagnostic[] {
    return templateSemanticsChecker.getDiagnosticsForComponent(component);
  }

  resolve(
    node: ClassDeclaration,
    analysis: Readonly<ComponentAnalysisData>,
    symbol: ComponentSymbol,
  ): ResolveResult<ComponentResolutionData> {
    const metadata = analysis.meta as Readonly<R3ComponentMetadata<R3TemplateDependencyMetadata>>;
    const diagnostics: ts.Diagnostic[] = [];
    const context = getSourceFile(node);

    // Check if there are some import declarations that contain symbols used within
    // the `@Component.deferredImports` field, but those imports contain other symbols
    // and thus the declaration can not be removed. This diagnostics is shared between local and
    // global compilation modes.
    const nonRemovableImports = this.deferredSymbolTracker.getNonRemovableDeferredImports(
      context,
      node,
    );
    if (nonRemovableImports.length > 0) {
      for (const importDecl of nonRemovableImports) {
        const diagnostic = makeDiagnostic(
          ErrorCode.DEFERRED_DEPENDENCY_IMPORTED_EAGERLY,
          importDecl,
          `This import contains symbols that are used both inside and outside of the ` +
            `\`@Component.deferredImports\` fields in the file. This renders all these ` +
            `defer imports useless as this import remains and its module is eagerly loaded. ` +
            `To fix this, make sure that all symbols from the import are *only* used within ` +
            `\`@Component.deferredImports\` arrays and there are no other references to those ` +
            `symbols present in this file.`,
        );
        diagnostics.push(diagnostic);
      }
      return {diagnostics};
    }

    let data: ComponentResolutionData;

    if (this.compilationMode === CompilationMode.LOCAL) {
      // Initial value in local compilation mode.
      data = {
        declarations: EMPTY_ARRAY,
        declarationListEmitMode:
          !analysis.meta.isStandalone || analysis.rawImports !== null
            ? DeclarationListEmitMode.RuntimeResolved
            : DeclarationListEmitMode.Direct,
        deferPerBlockDependencies: this.locateDeferBlocksWithoutScope(analysis.template),
        deferBlockDepsEmitMode: DeferBlockDepsEmitMode.PerComponent,
        deferrableDeclToImportDecl: new Map(),
        deferPerComponentDependencies: analysis.explicitlyDeferredTypes ?? [],
        hasDirectiveDependencies: true,
      };

      if (this.localCompilationExtraImportsTracker === null) {
        // In local compilation mode the resolve phase is only needed for generating extra imports.
        // Otherwise we can skip it.
        return {data};
      }
    } else {
      // Initial value in global compilation mode.
      data = {
        declarations: EMPTY_ARRAY,
        declarationListEmitMode: DeclarationListEmitMode.Direct,
        deferPerBlockDependencies: new Map(),
        deferBlockDepsEmitMode: DeferBlockDepsEmitMode.PerBlock,
        deferrableDeclToImportDecl: new Map(),
        deferPerComponentDependencies: [],
        hasDirectiveDependencies: true,
      };
    }

    if (this.semanticDepGraphUpdater !== null && analysis.baseClass instanceof Reference) {
      symbol.baseClass = this.semanticDepGraphUpdater.getSymbol(analysis.baseClass.node);
    }

    if (analysis.isPoisoned && !this.usePoisonedData) {
      return {};
    }

    const scope = this.scopeReader.getScopeForComponent(node);
    if (scope === null) {
      // If there is no scope, we can still use the binder to retrieve *some* information about the
      // deferred blocks.
      data.deferPerBlockDependencies = this.locateDeferBlocksWithoutScope(metadata.template);
    } else {
      const {eagerlyUsed, deferBlocks, allDependencies, wholeTemplateUsed, pipes} =
        this.resolveComponentDependencies(node, context, analysis, scope, metadata, diagnostics);

      const declarations = this.componentDependenciesToDeclarations(
        node,
        context,
        allDependencies,
        wholeTemplateUsed,
        pipes,
      );

      if (this.semanticDepGraphUpdater !== null) {
        const getSemanticReference = (decl: UsedDirective | UsedPipe) =>
          this.semanticDepGraphUpdater!.getSemanticReference(decl.ref.node, decl.type);

        symbol.usedDirectives = Array.from(declarations.values())
          .filter(isUsedDirective)
          .map(getSemanticReference);
        symbol.usedPipes = Array.from(declarations.values())
          .filter(isUsedPipe)
          .map(getSemanticReference);
      }

      // Process information related to defer blocks
      if (this.compilationMode !== CompilationMode.LOCAL) {
        this.resolveDeferBlocks(
          node,
          scope,
          deferBlocks,
          declarations,
          data,
          analysis,
          eagerlyUsed,
        );
        data.hasDirectiveDependencies =
          !analysis.meta.isStandalone ||
          allDependencies.some(({kind, ref}) => {
            // Note that `allDependencies` includes ones that aren't
            // used in the template so we need to filter them out.
            return (
              (kind === MetaKind.Directive || kind === MetaKind.NgModule) &&
              wholeTemplateUsed.has(ref.node)
            );
          });
      } else {
        // We don't have the ability to inspect the component's dependencies in local
        // compilation mode. Assume that it always has directive dependencies in such cases.
        data.hasDirectiveDependencies = true;
      }

      this.handleDependencyCycles(
        node,
        context,
        scope,
        data,
        analysis,
        metadata,
        declarations,
        eagerlyUsed,
        symbol,
      );
    }

    // Run diagnostics only in global mode.
    if (this.compilationMode !== CompilationMode.LOCAL) {
      const nonLocalDiagnostics = this.getNonLocalDiagnostics(node, analysis);
      if (nonLocalDiagnostics !== null) {
        diagnostics.push(...nonLocalDiagnostics);
      }
    }

    if (diagnostics.length > 0) {
      return {diagnostics};
    }

    return {data};
  }

  xi18n(
    ctx: Xi18nContext,
    node: ClassDeclaration,
    analysis: Readonly<ComponentAnalysisData>,
  ): void {
    ctx.updateFromTemplate(
      analysis.template.content,
      analysis.template.declaration.resolvedTemplateUrl,
      analysis.template.interpolationConfig ?? DEFAULT_INTERPOLATION_CONFIG,
    );
  }

  updateResources(node: ClassDeclaration, analysis: ComponentAnalysisData): void {
    const containingFile = node.getSourceFile().fileName;

    // If the template is external, re-parse it.
    const templateDecl = analysis.template.declaration;
    if (!templateDecl.isInline) {
      analysis.template = extractTemplate(
        node,
        templateDecl,
        this.evaluator,
        this.depTracker,
        this.resourceLoader,
        this.extractTemplateOptions,
        this.compilationMode,
      );
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

    analysis.meta.styles = styles.filter((s) => s.trim().length > 0);
  }

  compileFull(
    node: ClassDeclaration,
    analysis: Readonly<ComponentAnalysisData>,
    resolution: Readonly<ComponentResolutionData>,
    pool: ConstantPool,
  ): CompileResult[] {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return [];
    }

    const perComponentDeferredDeps = this.canDeferDeps
      ? this.resolveAllDeferredDependencies(resolution)
      : null;
    const defer = this.compileDeferBlocks(resolution);
    const meta: R3ComponentMetadata<R3TemplateDependency> = {
      ...analysis.meta,
      ...resolution,
      defer,
    };
    const fac = compileNgFactoryDefField(toFactoryMetadata(meta, FactoryTarget.Component));

    if (perComponentDeferredDeps !== null) {
      removeDeferrableTypesFromComponentDecorator(analysis, perComponentDeferredDeps);
    }

    const def = compileComponentFromMetadata(meta, pool, this.getNewBindingParser());
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileComponentClassMetadata(analysis.classMetadata, perComponentDeferredDeps).toStmt()
        : null;
    const debugInfo =
      analysis.classDebugInfo !== null
        ? compileClassDebugInfo(analysis.classDebugInfo).toStmt()
        : null;
    const hmrMeta = this.enableHmr
      ? extractHmrMetatadata(
          node,
          this.reflector,
          this.evaluator,
          this.compilerHost,
          this.rootDirs,
          def,
          fac,
          defer,
          classMetadata,
          debugInfo,
        )
      : null;
    const hmrInitializer = hmrMeta ? compileHmrInitializer(hmrMeta).toStmt() : null;
    const deferrableImports = this.canDeferDeps
      ? this.deferredSymbolTracker.getDeferrableImportDecls()
      : null;
    return compileResults(
      fac,
      def,
      classMetadata,
      'ɵcmp',
      inputTransformFields,
      deferrableImports,
      debugInfo,
      hmrInitializer,
    );
  }

  compilePartial(
    node: ClassDeclaration,
    analysis: Readonly<ComponentAnalysisData>,
    resolution: Readonly<ComponentResolutionData>,
  ): CompileResult[] {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return [];
    }
    const templateInfo: DeclareComponentTemplateInfo = {
      content: analysis.template.content,
      sourceUrl: analysis.template.declaration.resolvedTemplateUrl,
      isInline: analysis.template.declaration.isInline,
      inlineTemplateLiteralExpression:
        analysis.template.sourceMapping.type === 'direct'
          ? new o.WrappedNodeExpr(analysis.template.sourceMapping.node)
          : null,
    };

    const perComponentDeferredDeps = this.canDeferDeps
      ? this.resolveAllDeferredDependencies(resolution)
      : null;
    const defer = this.compileDeferBlocks(resolution);
    const meta: R3ComponentMetadata<R3TemplateDependencyMetadata> = {
      ...analysis.meta,
      ...resolution,
      defer,
    };
    const fac = compileDeclareFactory(toFactoryMetadata(meta, FactoryTarget.Component));
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const def = compileDeclareComponentFromMetadata(meta, analysis.template, templateInfo);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileComponentDeclareClassMetadata(
            analysis.classMetadata,
            perComponentDeferredDeps,
          ).toStmt()
        : null;
    const hmrMeta = this.enableHmr
      ? extractHmrMetatadata(
          node,
          this.reflector,
          this.evaluator,
          this.compilerHost,
          this.rootDirs,
          def,
          fac,
          defer,
          classMetadata,
          null,
        )
      : null;
    const hmrInitializer = hmrMeta ? compileHmrInitializer(hmrMeta).toStmt() : null;
    const deferrableImports = this.canDeferDeps
      ? this.deferredSymbolTracker.getDeferrableImportDecls()
      : null;
    return compileResults(
      fac,
      def,
      classMetadata,
      'ɵcmp',
      inputTransformFields,
      deferrableImports,
      null,
      hmrInitializer,
    );
  }

  compileLocal(
    node: ClassDeclaration,
    analysis: Readonly<ComponentAnalysisData>,
    resolution: Readonly<Partial<ComponentResolutionData>>,
    pool: ConstantPool,
  ): CompileResult[] {
    // In the local compilation mode we can only rely on the information available
    // within the `@Component.deferredImports` array, because in this mode compiler
    // doesn't have information on which dependencies belong to which defer blocks.
    const deferrableTypes = this.canDeferDeps ? analysis.explicitlyDeferredTypes : null;

    const defer = this.compileDeferBlocks(resolution);
    const meta = {
      ...analysis.meta,
      ...resolution,
      defer,
    } as R3ComponentMetadata<R3TemplateDependency>;

    if (deferrableTypes !== null) {
      removeDeferrableTypesFromComponentDecorator(analysis, deferrableTypes);
    }

    const fac = compileNgFactoryDefField(toFactoryMetadata(meta, FactoryTarget.Component));
    const def = compileComponentFromMetadata(meta, pool, this.getNewBindingParser());
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileComponentClassMetadata(analysis.classMetadata, deferrableTypes).toStmt()
        : null;
    const debugInfo =
      analysis.classDebugInfo !== null
        ? compileClassDebugInfo(analysis.classDebugInfo).toStmt()
        : null;
    const hmrMeta = this.enableHmr
      ? extractHmrMetatadata(
          node,
          this.reflector,
          this.evaluator,
          this.compilerHost,
          this.rootDirs,
          def,
          fac,
          defer,
          classMetadata,
          debugInfo,
        )
      : null;
    const hmrInitializer = hmrMeta ? compileHmrInitializer(hmrMeta).toStmt() : null;
    const deferrableImports = this.canDeferDeps
      ? this.deferredSymbolTracker.getDeferrableImportDecls()
      : null;
    return compileResults(
      fac,
      def,
      classMetadata,
      'ɵcmp',
      inputTransformFields,
      deferrableImports,
      debugInfo,
      hmrInitializer,
    );
  }

  compileHmrUpdateDeclaration(
    node: ClassDeclaration,
    analysis: Readonly<ComponentAnalysisData>,
    resolution: Readonly<ComponentResolutionData>,
  ): ts.FunctionDeclaration | null {
    if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
      return null;
    }

    // Create a brand-new constant pool since there shouldn't be any constant sharing.
    const pool = new ConstantPool();
    const defer = this.compileDeferBlocks(resolution);
    const meta: R3ComponentMetadata<R3TemplateDependency> = {
      ...analysis.meta,
      ...resolution,
      defer,
    };
    const fac = compileNgFactoryDefField(toFactoryMetadata(meta, FactoryTarget.Component));
    const def = compileComponentFromMetadata(meta, pool, this.getNewBindingParser());
    const classMetadata =
      analysis.classMetadata !== null
        ? compileComponentClassMetadata(analysis.classMetadata, null).toStmt()
        : null;
    const debugInfo =
      analysis.classDebugInfo !== null
        ? compileClassDebugInfo(analysis.classDebugInfo).toStmt()
        : null;
    const hmrMeta = this.enableHmr
      ? extractHmrMetatadata(
          node,
          this.reflector,
          this.evaluator,
          this.compilerHost,
          this.rootDirs,
          def,
          fac,
          defer,
          classMetadata,
          debugInfo,
        )
      : null;
    const res = compileResults(fac, def, classMetadata, 'ɵcmp', null, null, debugInfo, null);
    return hmrMeta === null || res.length === 0
      ? null
      : getHmrUpdateDeclaration(res, pool.statements, hmrMeta, node);
  }

  /**
   * Determines the dependencies of a component and
   * categorizes them based on how they were introduced.
   */
  private resolveComponentDependencies(
    node: ClassDeclaration,
    context: ts.SourceFile,
    analysis: Readonly<ComponentAnalysisData>,
    scope: ComponentScope,
    metadata: Readonly<R3ComponentMetadata<R3TemplateDependencyMetadata>>,
    diagnostics: ts.Diagnostic[],
  ): {
    allDependencies: (DirectiveMeta | PipeMeta | NgModuleMeta)[];
    eagerlyUsed: Set<ClassDeclaration>;
    wholeTemplateUsed: Set<ClassDeclaration>;
    deferBlocks: Map<TmplAstDeferredBlock, BoundTarget<DirectiveMeta>>;
    pipes: Map<string, PipeMeta>;
  } {
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

    const isModuleScope = scope.kind === ComponentScopeKind.NgModule;
    const isSelectorlessScope = scope.kind === ComponentScopeKind.Selectorless;
    const pipes = new Map<string, PipeMeta>();

    // Dependencies from the `@Component.deferredImports` field.
    const explicitlyDeferredDependencies =
      scope.kind === ComponentScopeKind.Standalone ? scope.deferredDependencies : null;
    const dependencies: (DirectiveMeta | PipeMeta | NgModuleMeta)[] = [];

    if (isSelectorlessScope) {
      for (const [localName, dep] of scope.dependencies) {
        // In selectorless the pipes are referred to by their local name.
        if (dep.kind === MetaKind.Pipe) {
          pipes.set(localName, dep);
        }
        dependencies.push(dep);
      }
    } else {
      const scopeDeps = isModuleScope ? scope.compilation.dependencies : scope.dependencies;
      for (const dep of scopeDeps) {
        // Outside of selectorless the pipes are referred to by their defined name.
        if (dep.kind === MetaKind.Pipe && dep.name !== null) {
          pipes.set(dep.name, dep);
        }
        dependencies.push(dep);
      }
    }

    // Mark the component is an NgModule-based component with its NgModule in a different file
    // then mark this file for extra import generation
    if (isModuleScope && context.fileName !== getSourceFile(scope.ngModule).fileName) {
      this.localCompilationExtraImportsTracker?.markFileForExtraImportGeneration(context);
    }

    // Make sure that `@Component.imports` and `@Component.deferredImports` do not have
    // the same dependencies.
    if (
      !isSelectorlessScope &&
      metadata.isStandalone &&
      analysis.rawDeferredImports !== null &&
      explicitlyDeferredDependencies !== null &&
      explicitlyDeferredDependencies.length > 0
    ) {
      const diagnostic = validateNoImportOverlap(
        dependencies,
        explicitlyDeferredDependencies,
        analysis.rawDeferredImports,
      );
      if (diagnostic !== null) {
        diagnostics.push(diagnostic);
      }
    }

    // Set up the R3TargetBinder.
    const binder = new R3TargetBinder(createMatcherFromScope(scope, this.hostDirectivesResolver));
    let allDependencies = dependencies;
    let deferBlockBinder = binder;

    // If there are any explicitly deferred dependencies (via `@Component.deferredImports`),
    // re-compute the list of dependencies and create a new binder for defer blocks. This
    // is because we have deferred dependencies that are not in the standard imports list
    // and need to be referenced later when determining what dependencies need to be in a
    // defer function / instruction call. Otherwise they end up treated as a standard
    // import, which is wrong.
    if (explicitlyDeferredDependencies !== null && explicitlyDeferredDependencies.length > 0) {
      allDependencies = [...explicitlyDeferredDependencies, ...dependencies];

      const deferBlockMatcher = new SelectorMatcher<DirectiveMeta[]>();
      for (const dep of allDependencies) {
        if (dep.kind === MetaKind.Pipe && dep.name !== null) {
          pipes.set(dep.name, dep);
        } else if (dep.kind === MetaKind.Directive && dep.selector !== null) {
          deferBlockMatcher.addSelectables(CssSelector.parse(dep.selector), [dep]);
        }
      }
      deferBlockBinder = new R3TargetBinder(deferBlockMatcher);
    }

    // Next, the component template AST is bound using the R3TargetBinder. This produces a
    // BoundTarget, which is similar to a ts.TypeChecker.
    const bound = binder.bind({template: metadata.template.nodes});

    // Find all defer blocks used in the template and for each block
    // bind its own scope.
    const deferBlocks = new Map<TmplAstDeferredBlock, BoundTarget<DirectiveMeta>>();
    for (const deferBlock of bound.getDeferBlocks()) {
      deferBlocks.set(deferBlock, deferBlockBinder.bind({template: deferBlock.children}));
    }

    // Register all Directives and Pipes used at the top level (outside
    // of any defer blocks), which would be eagerly referenced.
    const eagerlyUsed = new Set<ClassDeclaration>();

    if (this.enableHmr) {
      // In HMR we need to preserve all the dependencies, because they have to remain consistent
      // with the initially-generated code no matter what the template looks like.
      for (const dep of dependencies) {
        if (dep.ref.node !== node) {
          eagerlyUsed.add(dep.ref.node);
        } else {
          const used = bound.getEagerlyUsedDirectives();
          if (used.some((current) => current.ref.node === node)) {
            eagerlyUsed.add(node);
          }
        }
      }
    } else {
      for (const dir of bound.getEagerlyUsedDirectives()) {
        eagerlyUsed.add(dir.ref.node);
      }
      for (const name of bound.getEagerlyUsedPipes()) {
        if (pipes.has(name)) {
          eagerlyUsed.add(pipes.get(name)!.ref.node);
        }
      }
    }

    // Set of Directives and Pipes used across the entire template,
    // including all defer blocks.
    const wholeTemplateUsed = new Set<ClassDeclaration>(eagerlyUsed);
    for (const bound of deferBlocks.values()) {
      for (const dir of bound.getUsedDirectives()) {
        wholeTemplateUsed.add(dir.ref.node);
      }
      for (const name of bound.getUsedPipes()) {
        if (!pipes.has(name)) {
          continue;
        }
        wholeTemplateUsed.add(pipes.get(name)!.ref.node);
      }
    }

    return {allDependencies, eagerlyUsed, wholeTemplateUsed, deferBlocks, pipes};
  }

  /**
   * Converts component dependencies into declarations by
   * resolving their metadata and deduplicating them.
   */
  private componentDependenciesToDeclarations(
    node: ClassDeclaration,
    context: ts.SourceFile,
    allDependencies: (DirectiveMeta | PipeMeta | NgModuleMeta)[],
    wholeTemplateUsed: Set<ClassDeclaration>,
    pipes: Map<string, PipeMeta>,
  ): ComponentDeclarations {
    const declarations: ComponentDeclarations = new Map();

    // Transform the dependencies list, filtering out unused dependencies.
    for (const dep of allDependencies) {
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
            dirType,
            node.name,
            dep.isComponent ? 'component' : 'directive',
          );

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

    for (const [localName, dep] of pipes) {
      if (!wholeTemplateUsed.has(dep.ref.node)) {
        continue;
      }

      const pipeType = this.refEmitter.emit(dep.ref, context);
      assertSuccessfulReferenceEmit(pipeType, node.name, 'pipe');

      declarations.set(dep.ref.node, {
        kind: R3TemplateDependencyKind.Pipe,
        type: pipeType.expression,
        // Use the local name for pipes to account for selectorless.
        name: localName,
        ref: dep.ref,
        importedFile: pipeType.importedFile,
      });
    }

    return declarations;
  }

  /** Handles any cycles in the dependencies of a component. */
  private handleDependencyCycles(
    node: ClassDeclaration,
    context: ts.SourceFile,
    scope: ComponentScope,
    data: ComponentResolutionData,
    analysis: Readonly<ComponentAnalysisData>,
    metadata: Readonly<R3ComponentMetadata<R3TemplateDependencyMetadata>>,
    declarations: ComponentDeclarations,
    eagerlyUsed: Set<ClassDeclaration>,
    symbol: ComponentSymbol,
  ): void {
    const eagerDeclarations = Array.from(declarations.values()).filter((decl) => {
      return decl.kind === R3TemplateDependencyKind.NgModule || eagerlyUsed.has(decl.ref.node);
    });
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
      analysis.resolvedImports !== null && analysis.resolvedImports.some((ref) => ref.synthetic);

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
      const declarationIsForwardDeclared = eagerDeclarations.some((decl) =>
        isExpressionForwardReference(decl.type, node.name, context),
      );

      if (
        this.compilationMode !== CompilationMode.LOCAL &&
        (declarationIsForwardDeclared || standaloneImportMayBeForwardDeclared)
      ) {
        data.declarationListEmitMode = DeclarationListEmitMode.Closure;
      }

      data.declarations = eagerDeclarations;

      // Register extra local imports.
      if (
        this.compilationMode === CompilationMode.LOCAL &&
        this.localCompilationExtraImportsTracker !== null
      ) {
        // In global compilation mode `eagerDeclarations` contains "all" the component
        // dependencies, whose import statements will be added to the file. In local compilation
        // mode `eagerDeclarations` only includes the "local" dependencies, meaning those that are
        // declared inside this compilation unit.Here the import info of these local dependencies
        // are added to the tracker so that we can generate extra imports representing these local
        // dependencies. For non-local dependencies we use another technique of adding some
        // best-guess extra imports globally to all files using
        // `localCompilationExtraImportsTracker.addGlobalImportFromIdentifier`.
        for (const {type} of eagerDeclarations) {
          if (type instanceof ExternalExpr && type.value.moduleName) {
            this.localCompilationExtraImportsTracker.addImportForFile(
              context,
              type.value.moduleName,
            );
          }
        }
      }
    } else if (this.cycleHandlingStrategy === CycleHandlingStrategy.UseRemoteScoping) {
      // Declaring the directiveDefs/pipeDefs arrays directly would require imports that would
      // create a cycle. Instead, mark this component as requiring remote scoping, so that the
      // NgModule file will take care of setting the directives for the component.
      this.scopeRegistry.setComponentRemoteScope(
        node,
        eagerDeclarations.filter(isUsedDirective).map((dir) => dir.ref),
        eagerDeclarations.filter(isUsedPipe).map((pipe) => pipe.ref),
      );
      symbol.isRemotelyScoped = true;

      // If a semantic graph is being tracked, record the fact that this component is remotely
      // scoped with the declaring NgModule symbol as the NgModule's emit becomes dependent on
      // the directive/pipe usages of this component.
      if (
        this.semanticDepGraphUpdater !== null &&
        scope.kind === ComponentScopeKind.NgModule &&
        scope.ngModule !== null
      ) {
        const moduleSymbol = this.semanticDepGraphUpdater.getSymbol(scope.ngModule);
        if (!(moduleSymbol instanceof NgModuleSymbol)) {
          throw new Error(
            `AssertionError: Expected ${scope.ngModule.name} to be an NgModuleSymbol.`,
          );
        }

        moduleSymbol.addRemotelyScopedComponent(symbol, symbol.usedDirectives, symbol.usedPipes);
      }
    } else {
      // We are not able to handle this cycle so throw an error.
      const relatedMessages: ts.DiagnosticRelatedInformation[] = [];
      for (const [dir, cycle] of cyclesFromDirectives) {
        relatedMessages.push(
          makeCyclicImportInfo(dir.ref, dir.isComponent ? 'component' : 'directive', cycle),
        );
      }
      for (const [pipe, cycle] of cyclesFromPipes) {
        relatedMessages.push(makeCyclicImportInfo(pipe.ref, 'pipe', cycle));
      }
      throw new FatalDiagnosticError(
        ErrorCode.IMPORT_CYCLE_DETECTED,
        node,
        'One or more import cycles would need to be created to compile this component, ' +
          'which is not supported by the current compiler configuration.',
        relatedMessages,
      );
    }
  }

  /** Produces diagnostics that require more than local information. */
  private getNonLocalDiagnostics(
    node: ClassDeclaration,
    analysis: Readonly<ComponentAnalysisData>,
  ): ts.Diagnostic[] | null {
    // We shouldn't be able to hit this, but add an assertion just in case the call site changes.
    if (this.compilationMode === CompilationMode.LOCAL) {
      throw new Error('Method cannot be called in local compilation mode.');
    }

    let diagnostics: ts.Diagnostic[] | null = null;

    // Validate `@Component.imports` and `@Component.deferredImports` fields.
    if (analysis.resolvedImports !== null && analysis.rawImports !== null) {
      const importDiagnostics = validateStandaloneImports(
        analysis.resolvedImports,
        analysis.rawImports,
        this.metaReader,
        this.scopeReader,
        false /* isDeferredImport */,
      );
      diagnostics ??= [];
      diagnostics.push(...importDiagnostics);
    }
    if (analysis.resolvedDeferredImports !== null && analysis.rawDeferredImports !== null) {
      const importDiagnostics = validateStandaloneImports(
        analysis.resolvedDeferredImports,
        analysis.rawDeferredImports,
        this.metaReader,
        this.scopeReader,
        true /* isDeferredImport */,
      );
      diagnostics ??= [];
      diagnostics.push(...importDiagnostics);
    }

    if (
      analysis.providersRequiringFactory !== null &&
      analysis.meta.providers instanceof o.WrappedNodeExpr
    ) {
      const providerDiagnostics = getProviderDiagnostics(
        analysis.providersRequiringFactory,
        analysis.meta.providers!.node,
        this.injectableRegistry,
      );
      diagnostics ??= [];
      diagnostics.push(...providerDiagnostics);
    }

    if (
      analysis.viewProvidersRequiringFactory !== null &&
      analysis.meta.viewProviders instanceof o.WrappedNodeExpr
    ) {
      const viewProviderDiagnostics = getProviderDiagnostics(
        analysis.viewProvidersRequiringFactory,
        analysis.meta.viewProviders!.node,
        this.injectableRegistry,
      );
      diagnostics ??= [];
      diagnostics.push(...viewProviderDiagnostics);
    }

    const directiveDiagnostics = getDirectiveDiagnostics(
      node,
      this.injectableRegistry,
      this.evaluator,
      this.reflector,
      this.scopeRegistry,
      this.strictCtorDeps,
      'Component',
    );
    if (directiveDiagnostics !== null) {
      diagnostics ??= [];
      diagnostics.push(...directiveDiagnostics);
    }

    const hostDirectivesDiagnostics =
      analysis.hostDirectives && analysis.rawHostDirectives
        ? validateHostDirectives(
            analysis.rawHostDirectives,
            analysis.hostDirectives,
            this.metaReader,
          )
        : null;
    if (hostDirectivesDiagnostics !== null) {
      diagnostics ??= [];
      diagnostics.push(...hostDirectivesDiagnostics);
    }

    return diagnostics;
  }

  /**
   * Locates defer blocks in case scope information is not available.
   * For example, this happens in the local compilation mode.
   */
  private locateDeferBlocksWithoutScope(
    template: ComponentTemplate,
  ): Map<TmplAstDeferredBlock, DeferredComponentDependency[]> {
    const deferBlocks = new Map<TmplAstDeferredBlock, DeferredComponentDependency[]>();
    const directivelessBinder = new R3TargetBinder<DirectiveMeta>(null);
    const bound = directivelessBinder.bind({template: template.nodes});
    const deferredBlocks = bound.getDeferBlocks();

    for (const block of deferredBlocks) {
      // We can't determine the dependencies without a scope so we leave them empty.
      deferBlocks.set(block, []);
    }
    return deferBlocks;
  }

  /**
   * Computes a list of deferrable symbols based on dependencies from
   * the `@Component.imports` field and their usage in `@defer` blocks.
   */
  private resolveAllDeferredDependencies(
    resolution: Readonly<ComponentResolutionData>,
  ): R3DeferPerComponentDependency[] {
    const seenDeps = new Set<ClassDeclaration>();
    const deferrableTypes: R3DeferPerComponentDependency[] = [];
    // Go over all dependencies of all defer blocks and update the value of
    // the `isDeferrable` flag and the `importPath` to reflect the current
    // state after visiting all components during the `resolve` phase.
    for (const [_, deps] of resolution.deferPerBlockDependencies) {
      for (const deferBlockDep of deps) {
        const node = deferBlockDep.declaration.node;
        const importDecl = resolution.deferrableDeclToImportDecl.get(node) ?? null;
        if (importDecl !== null && this.deferredSymbolTracker.canDefer(importDecl)) {
          deferBlockDep.isDeferrable = true;
          deferBlockDep.importPath = (importDecl.moduleSpecifier as ts.StringLiteral).text;
          deferBlockDep.isDefaultImport = isDefaultImport(importDecl);

          // The same dependency may be used across multiple deferred blocks. De-duplicate it
          // because it can throw off other logic further down the compilation pipeline.
          // Note that the logic above needs to run even if the dependency is seen before,
          // because the object literals are different between each block.
          if (!seenDeps.has(node)) {
            seenDeps.add(node);
            deferrableTypes.push(deferBlockDep as R3DeferPerComponentDependency);
          }
        }
      }
    }

    return deferrableTypes;
  }

  /**
   * Collects deferrable symbols from the `@Component.deferredImports` field.
   */
  private collectExplicitlyDeferredSymbols(
    rawDeferredImports: ts.Expression,
  ): Map<ts.Identifier, Import> {
    const deferredTypes = new Map<ts.Identifier, Import>();
    if (!ts.isArrayLiteralExpression(rawDeferredImports)) {
      return deferredTypes;
    }

    for (const element of rawDeferredImports.elements) {
      const node = tryUnwrapForwardRef(element, this.reflector) || element;

      if (!ts.isIdentifier(node)) {
        // Can't defer-load non-literal references.
        continue;
      }

      const imp = this.reflector.getImportOfIdentifier(node);
      if (imp !== null) {
        deferredTypes.set(node, imp);
      }
    }
    return deferredTypes;
  }

  /**
   * Check whether adding an import from `origin` to the source-file corresponding to `expr` would
   * create a cyclic import.
   *
   * @returns a `Cycle` object if a cycle would be created, otherwise `null`.
   */
  private _checkForCyclicImport(
    importedFile: ImportedFile,
    expr: o.Expression,
    origin: ts.SourceFile,
  ): Cycle | null {
    const imported = resolveImportedFile(this.moduleResolver, importedFile, expr, origin);
    if (imported === null) {
      return null;
    }
    // Check whether the import is legal.
    return this.cycleAnalyzer.wouldCreateCycle(origin, imported);
  }

  private maybeRecordSyntheticImport(
    importedFile: ImportedFile,
    expr: o.Expression,
    origin: ts.SourceFile,
  ): void {
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
    componentClassDecl: ClassDeclaration,
    scope: ComponentScope,
    deferBlocks: Map<TmplAstDeferredBlock, BoundTarget<DirectiveMeta>>,
    deferrableDecls: Map<ClassDeclaration, AnyUsedType>,
    resolutionData: ComponentResolutionData,
    analysisData: Readonly<ComponentAnalysisData>,
    eagerlyUsedDecls: Set<ClassDeclaration>,
  ) {
    // Collect all deferred decls from all defer blocks from the entire template
    // to intersect with the information from the `imports` field of a particular
    // Component.
    const allDeferredDecls = new Set<ClassDeclaration>();

    for (const [deferBlock, bound] of deferBlocks) {
      const usedDirectives = new Set(bound.getEagerlyUsedDirectives().map((d) => d.ref.node));
      const usedPipes = new Set(bound.getEagerlyUsedPipes());
      let deps: DeferredComponentDependency[];

      if (resolutionData.deferPerBlockDependencies.has(deferBlock)) {
        deps = resolutionData.deferPerBlockDependencies.get(deferBlock)!;
      } else {
        deps = [];
        resolutionData.deferPerBlockDependencies.set(deferBlock, deps);
      }

      for (const decl of Array.from(deferrableDecls.values())) {
        if (decl.kind === R3TemplateDependencyKind.NgModule) {
          continue;
        }
        if (
          decl.kind === R3TemplateDependencyKind.Directive &&
          !usedDirectives.has(decl.ref.node)
        ) {
          continue;
        }
        if (decl.kind === R3TemplateDependencyKind.Pipe && !usedPipes.has(decl.name)) {
          continue;
        }
        // Collect initial information about this dependency.
        // `isDeferrable`, `importPath` and `isDefaultImport` will be
        // added later during the `compile` step.
        deps.push({
          typeReference: decl.type,
          symbolName: decl.ref.node.name.text,
          isDeferrable: false,
          importPath: null,
          isDefaultImport: false,
          declaration: decl.ref,
        });
        allDeferredDecls.add(decl.ref.node);
      }
    }

    if (analysisData.meta.isStandalone) {
      // For standalone components with the `imports` and `deferredImports` fields -
      // inspect the list of referenced symbols and mark the ones used in defer blocks
      // as potential candidates for defer loading.
      if (
        analysisData.rawImports !== null &&
        ts.isArrayLiteralExpression(analysisData.rawImports)
      ) {
        for (const element of analysisData.rawImports.elements) {
          this.registerDeferrableCandidate(
            componentClassDecl,
            element,
            false /* isDeferredImport */,
            allDeferredDecls,
            eagerlyUsedDecls,
            resolutionData,
          );
        }
      }
      if (
        analysisData.rawDeferredImports !== null &&
        ts.isArrayLiteralExpression(analysisData.rawDeferredImports)
      ) {
        for (const element of analysisData.rawDeferredImports.elements) {
          this.registerDeferrableCandidate(
            componentClassDecl,
            element,
            false /* isDeferredImport */,
            allDeferredDecls,
            eagerlyUsedDecls,
            resolutionData,
          );
        }
      }

      // Selectorless references dependencies directly so we register through the identifiers.
      if (scope.kind === ComponentScopeKind.Selectorless) {
        for (const identifier of scope.dependencyIdentifiers) {
          this.registerDeferrableCandidate(
            componentClassDecl,
            identifier,
            false /* isDeferredImport */,
            allDeferredDecls,
            eagerlyUsedDecls,
            resolutionData,
          );
        }
      }
    }
  }

  /**
   * Inspects provided imports expression (either `@Component.imports` or
   * `@Component.deferredImports`) and registers imported types as deferrable
   * candidates.
   */
  private registerDeferrableCandidate(
    componentClassDecl: ClassDeclaration,
    element: ts.Expression,
    isDeferredImport: boolean,
    allDeferredDecls: Set<ClassDeclaration>,
    eagerlyUsedDecls: Set<ClassDeclaration>,
    resolutionData: ComponentResolutionData,
  ) {
    const node = tryUnwrapForwardRef(element, this.reflector) || element;

    if (!ts.isIdentifier(node)) {
      // Can't defer-load non-literal references.
      return;
    }

    const imp = this.reflector.getImportOfIdentifier(node);
    if (imp === null) {
      // Can't defer-load symbols which aren't imported.
      return;
    }

    const decl = this.reflector.getDeclarationOfIdentifier(node);
    if (decl === null) {
      // Can't defer-load symbols which don't exist.
      return;
    }

    if (!isNamedClassDeclaration(decl.node)) {
      // Can't defer-load symbols which aren't classes.
      return;
    }

    // Are we even trying to defer-load this symbol?
    if (!allDeferredDecls.has(decl.node)) {
      return;
    }

    if (eagerlyUsedDecls.has(decl.node)) {
      // Can't defer-load symbols that are eagerly referenced as a dependency
      // in a template outside of a defer block.
      return;
    }

    // Is it a standalone directive/component?
    const dirMeta = this.metaReader.getDirectiveMetadata(new Reference(decl.node));
    if (dirMeta !== null && !dirMeta.isStandalone) {
      return;
    }

    // Is it a standalone pipe?
    const pipeMeta = this.metaReader.getPipeMetadata(new Reference(decl.node));
    if (pipeMeta !== null && !pipeMeta.isStandalone) {
      return;
    }

    if (dirMeta === null && pipeMeta === null) {
      // This is not a directive or a pipe.
      return;
    }

    // Keep track of how this class made it into the current source file
    // (which ts.ImportDeclaration was used for this symbol).
    resolutionData.deferrableDeclToImportDecl.set(decl.node, imp.node);

    this.deferredSymbolTracker.markAsDeferrableCandidate(
      node,
      imp.node,
      componentClassDecl,
      isDeferredImport,
    );
  }

  private compileDeferBlocks(
    resolution: Readonly<Partial<ComponentResolutionData>>,
  ): R3ComponentDeferMetadata {
    const {
      deferBlockDepsEmitMode: mode,
      deferPerBlockDependencies: perBlockDeps,
      deferPerComponentDependencies: perComponentDeps,
    } = resolution;

    if (mode === DeferBlockDepsEmitMode.PerBlock) {
      if (!perBlockDeps) {
        throw new Error(
          'Internal error: deferPerBlockDependencies must be present when compiling in PerBlock mode',
        );
      }

      const blocks = new Map<TmplAstDeferredBlock, o.Expression | null>();
      for (const [block, dependencies] of perBlockDeps) {
        blocks.set(
          block,
          dependencies.length === 0 ? null : compileDeferResolverFunction({mode, dependencies}),
        );
      }

      return {mode, blocks};
    }

    if (mode === DeferBlockDepsEmitMode.PerComponent) {
      if (!perComponentDeps) {
        throw new Error(
          'Internal error: deferPerComponentDependencies must be present in PerComponent mode',
        );
      }
      return {
        mode,
        dependenciesFn:
          perComponentDeps.length === 0
            ? null
            : compileDeferResolverFunction({mode, dependencies: perComponentDeps}),
      };
    }

    throw new Error(`Invalid deferBlockDepsEmitMode. Cannot compile deferred block metadata.`);
  }

  /** Creates a new binding parser. */
  private getNewBindingParser() {
    return makeBindingParser(undefined, this.enableSelectorless);
  }
}

function createMatcherFromScope(
  scope: ComponentScope,
  hostDirectivesResolver: HostDirectivesResolver,
): DirectiveMatcher<DirectiveMeta> {
  if (scope.kind === ComponentScopeKind.Selectorless) {
    const registry = new Map<string, DirectiveMeta[]>();

    for (const [name, dep] of scope.dependencies) {
      if (dep.kind === MetaKind.Directive) {
        registry.set(name, [dep, ...hostDirectivesResolver.resolve(dep)]);
      }
    }

    return new SelectorlessMatcher(registry);
  }

  const matcher = new SelectorMatcher();
  const dependencies =
    scope.kind === ComponentScopeKind.NgModule
      ? scope.compilation.dependencies
      : scope.dependencies;

  for (const dep of dependencies) {
    if (dep.kind === MetaKind.Directive && dep.selector !== null) {
      matcher.addSelectables(CssSelector.parse(dep.selector), [dep]);
    }
  }

  return matcher;
}

/**
 * Drop references to existing imports for deferrable symbols that should be present
 * in the `setClassMetadataAsync` call. Otherwise, an import declaration gets retained.
 */
function removeDeferrableTypesFromComponentDecorator(
  analysis: Readonly<ComponentAnalysisData>,
  deferrableTypes: R3DeferPerComponentDependency[],
) {
  if (analysis.classMetadata) {
    const deferrableSymbols = new Set(deferrableTypes.map((t) => t.symbolName));
    const rewrittenDecoratorsNode = removeIdentifierReferences(
      (analysis.classMetadata.decorators as o.WrappedNodeExpr<ts.Node>).node,
      deferrableSymbols,
    );
    analysis.classMetadata.decorators = new o.WrappedNodeExpr(rewrittenDecoratorsNode);
  }
}

/**
 * Validates that `@Component.imports` and `@Component.deferredImports` do not have
 * overlapping dependencies.
 */
function validateNoImportOverlap(
  eagerDeps: Array<PipeMeta | DirectiveMeta | NgModuleMeta>,
  deferredDeps: Array<PipeMeta | DirectiveMeta | NgModuleMeta>,
  rawDeferredImports: ts.Expression,
) {
  let diagnostic: ts.Diagnostic | null = null;
  const eagerDepsSet = new Set();
  for (const eagerDep of eagerDeps) {
    eagerDepsSet.add(eagerDep.ref.node);
  }
  for (const deferredDep of deferredDeps) {
    if (eagerDepsSet.has(deferredDep.ref.node)) {
      const classInfo = deferredDep.ref.debugName
        ? `The \`${deferredDep.ref.debugName}\``
        : 'One of the dependencies';
      diagnostic = makeDiagnostic(
        ErrorCode.DEFERRED_DEPENDENCY_IMPORTED_EAGERLY,
        getDiagnosticNode(deferredDep.ref, rawDeferredImports),
        `\`${classInfo}\` is imported via both \`@Component.imports\` and ` +
          `\`@Component.deferredImports\`. To fix this, make sure that ` +
          `dependencies are imported only once.`,
      );
      break;
    }
  }
  return diagnostic;
}

function validateStandaloneImports(
  importRefs: Reference<ClassDeclaration>[],
  importExpr: ts.Expression,
  metaReader: MetadataReader,
  scopeReader: ComponentScopeReader,
  isDeferredImport: boolean,
): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = [];
  for (const ref of importRefs) {
    const dirMeta = metaReader.getDirectiveMetadata(ref);
    if (dirMeta !== null) {
      if (!dirMeta.isStandalone) {
        // Directly importing a directive that's not standalone is an error.
        diagnostics.push(
          makeNotStandaloneDiagnostic(
            scopeReader,
            ref,
            importExpr,
            dirMeta.isComponent ? 'component' : 'directive',
          ),
        );
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
    if (!isDeferredImport && ngModuleMeta !== null) {
      // Importing NgModules is always legal in `@Component.imports`,
      // but not supported in `@Component.deferredImports`.
      continue;
    }

    // Make an error?
    const error = isDeferredImport
      ? makeUnknownComponentDeferredImportDiagnostic(ref, importExpr)
      : makeUnknownComponentImportDiagnostic(ref, importExpr);
    diagnostics.push(error);
  }

  return diagnostics;
}

/** Returns whether an ImportDeclaration is a default import. */
function isDefaultImport(node: ts.ImportDeclaration): boolean {
  return node.importClause !== undefined && node.importClause.namedBindings === undefined;
}
