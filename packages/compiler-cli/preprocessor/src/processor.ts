/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type * as nga from './types.js';
import * as path from 'path';
import * as fs from 'node:fs/promises';
import {
  OutOfBandDiagnosticCategory,
  ParsedTemplate,
  ParseTemplateOptions,
  parseTemplate,
  R3DependencyMetadata,
  R3DirectiveMetadata,
  R3Identifiers,
  R3InjectableMetadata,
  R3NgModuleMetadata,
  R3ServiceMetadata,
  compileComponentFromMetadata,
  compileDirectiveFromMetadata,
  compilePipeFromMetadata,
  compileInjectable,
  compileService,
  compileFactoryFunction,
  compileDeferResolverFunction,
  compileNgModule,
  compileInjector,
  makeBindingParser,
  type R3DeferPerBlockDependency,
  type R3DeferPerComponentDependency,
  ConstantPool,
  outputAst as o,
  FactoryTarget,
  ViewEncapsulation,
  CssSelector,
  SelectorMatcher,
  R3TargetBinder,
  TmplAstDeferredBlock as DeferredBlock,
  SchemaMetadata,
  R3ComponentMetadata,
  R3TemplateDependency,
  ChangeDetectionStrategy,
  compileComponentClassMetadata,
  R3ClassDebugInfo,
  R3ClassMetadataCtorParameter,
  compileClassDebugInfo,
} from '@angular/compiler';

interface HybridParseTemplateOptions extends ParseTemplateOptions {
  linkerJitMode?: boolean;
}
import {
  prepareTcbTargets,
  generateTcbCode,
  combineTcbContent,
  type TcbTargetInput,
  type TcbResult,
  type NgpTypeCheckingConfig,
} from './tcb.js';
import {
  buildInputsMap,
  buildOutputsMap,
  buildQueriesMap,
  metadataToDeclaration,
  createDummySourceSpan,
  createEmptySourceSpan,
  buildHostMetadata,
  createDirectiveMeta,
  buildDeps,
  type MinimalDirectiveMeta,
  parseDirectInlineTemplate,
  buildPipeRegistry,
  buildHostDirectives,
  stripIife,
  makeClassKey,
} from './compiler-utils.js';
import {ExpressionPrinter, RawSource} from './output_ast_printer.js';
import MagicString from 'magic-string';
import {analyzeTemplateForSelectorless} from './selectorless.js';
import {analyzeForeignComponentFeatures} from './foreign_component.js';
import {lineNumberAtOffset} from './tcb_util.js';
import type {IAnalyzer} from './hybrid_compiler.js';
import {FileAnalysis, getOrCreateFileAnalysis, ChunkContext} from './file_analysis.js';

interface HybridCompilerContext {
  analyzer: IAnalyzer;
  tcbConfig: NgpTypeCheckingConfig;
  optimize: boolean;
  fileCache: Map<string, FileAnalysis>;
  templateParseOptions?: Partial<HybridParseTemplateOptions>;
  legacyOptionalChaining: boolean;
  isClosureCompilerEnabled: boolean;
  emitDeclarationOnly?: boolean;
  externalRuntimeStyles?: boolean;
  onlyExplicitDeferDependencyImports?: boolean;
  enableTemplateSourceLocations?: boolean;
  onlyPublishPublicTypingsForNgModules?: boolean;
  forbidOrphanComponents?: boolean;
  supportTestBed?: boolean;
  i18nUseExternalIds?: boolean;
  remoteScopedClasses?: Set<string>;
  metadataMap?: Map<string, nga.AnalysisResult>;
  /** Keyed `filePath#ClassName`; see `ChunkContext.eagerlyUsedDeclarations`. */
  eagerlyUsedDeclarations?: Map<string, nga.DeclarationMetadata[]>;
  rootDir?: string;
  complianceMode?: boolean;
  workspaceName?: string;
  rootDirs?: string[];
}

// These are const enums, so they're not available at runtime - use literal values
const ForwardRefHandling = {None: 0, Wrapped: 1, Unwrapped: 2} as const;
const DeclarationListEmitMode = {
  Direct: 0,
  Closure: 1,
  ClosureResolved: 2,
  RuntimeResolved: 3,
} as const;
const DeferBlockDepsEmitMode = {PerBlock: 0, PerComponent: 1} as const;
const R3NgModuleMetadataKind = {Global: 0, Local: 1, Isolated: 2} as const;
const R3SelectorScopeMode = {Inline: 0, SideEffect: 1, Omit: 2} as const;

/**
 * Shape of the namespace aliases this compiler generates (`i0`, `i1`, … and the `ɵ`-prefixed
 * variants). Matching one in an already-processed file lets its alias be reused rather than a
 * second one minted for the same module.
 */
const GENERATED_NAMESPACE_ALIAS = /^(ɵ?i\d+|ɵng)$/;

export interface ProcessedFile {
  magicString: MagicString;
  tcb?: TcbResult | null;
  diagnostics?: nga.NgDiagnostic[];
}

export function buildTcbTargets(
  filePath: string,
  content: string,
  classes: nga.ClassMetadata[],
  templatesByClass: Map<string, any>,
  options: Partial<ParseTemplateOptions> = {},
  tcbConfig: NgpTypeCheckingConfig,
): TcbTargetInput[] {
  const tcbTargets: TcbTargetInput[] = [];

  for (const cls of classes) {
    const {className, component, directive, hostBindings, hostListeners} = cls;
    if (!className) continue;

    if (component) {
      if (component.isJit) continue;
      // 1. Parse template (or reuse if already parsed in processFile)
      const classKey = makeClassKey(cls.className, cls.span.start);
      let parsed = templatesByClass.get(classKey);
      if (!parsed) {
        parsed = parseComponentTemplate(component, filePath, content, options);
        templatesByClass.set(classKey, parsed);
      }

      const parsedSchemas: SchemaMetadata[] = [];
      if (component.schemas) {
        for (const schema of component.schemas) {
          if (schema === 'CUSTOM_ELEMENTS_SCHEMA') {
            parsedSchemas.push({name: 'custom-elements'});
          } else if (schema === 'NO_ERRORS_SCHEMA') {
            parsedSchemas.push({name: 'no-errors-schema'});
          }
        }
      }

      let selectorlessEnabled = false;
      if (options.enableSelectorless) {
        const analysis = analyzeTemplateForSelectorless(parsed.nodes);
        selectorlessEnabled = analysis.isSelectorless;
      }

      // 9. Collect component for TCB generation (optimize mode only)
      tcbTargets.push({
        // TODO: maybe remove duplicated info from tcbTargets and have downstream access through classMeta
        classMeta: cls,
        className,
        template: component.template || '',
        templateNodes: parsed.nodes,
        declarations: component.resolvedDeclarations ?? [],
        enableSelectorless: options.enableSelectorless ?? false,
        selectorlessEnabled,
        ownDeclaration: metadataToDeclaration(
          component,
          cls,
          'component',
          parsed.ngContentSelectors,
        ),
        hostProperties:
          tcbConfig.typeCheckHostBindings === false ? [] : (component.hostProperties ?? []),
        hostBindings: tcbConfig.typeCheckHostBindings === false ? [] : (hostBindings ?? []),
        hostListeners: tcbConfig.typeCheckHostBindings === false ? [] : (hostListeners ?? []),
        isStandalone: component.standalone,
        preserveWhitespaces: parsed.preserveWhitespaces,
        schemas: parsedSchemas,
        typeParameters: cls.typeParameters ?? null,
        pipeRegistry: buildPipeRegistry(component.resolvedDeclarations ?? []),
      });
    } else if (directive) {
      if (directive.isJit) continue;
      if (tcbConfig.typeCheckHostBindings === false) continue;
      const {hostProperties, standalone} = directive;
      const hasHostBindings =
        hostProperties.length > 0 || hostBindings.length > 0 || hostListeners.length > 0;

      if (hasHostBindings) {
        tcbTargets.push({
          classMeta: cls,
          className,
          template: '',
          templateNodes: [],
          declarations: [],
          ownDeclaration: metadataToDeclaration(directive, cls, 'directive', null),
          hostProperties,
          hostBindings: hostBindings ?? [],
          hostListeners: hostListeners ?? [],
          isStandalone: standalone,
          schemas: [],
          typeParameters: cls.typeParameters ?? null,
          pipeRegistry: null,
        });
      }
    }
  }

  return tcbTargets;
}

function mapDeps(
  deps: nga.DependencyMetadata[],
  content: string,
  guards: nga.SpanMetadata[] = [],
): R3DependencyMetadata[] {
  return deps.map((dep) => {
    let token: o.Expression | null = null;
    if (dep.tokenSpan) {
      token = new o.WrappedNodeExpr(new RawSource(sliceGuarded(content, dep.tokenSpan, guards)));
    }
    return {
      token,
      attributeNameType: null,
      host: dep.host,
      optional: dep.optional,
      self: dep.self,
      skipSelf: dep.skipSelf,
    };
  });
}

export async function processFile(
  rawCtx: HybridCompilerContext,
  filePath: string,
  content: string,
  readResource?: (file: string) => string | undefined,
  metadata?: nga.AnalysisResult,
  chunkContext?: ChunkContext,
): Promise<ProcessedFile> {
  const ctx: HybridCompilerContext & {
    remoteScopedClasses: Set<string>;
    metadataMap: Map<string, nga.AnalysisResult>;
    eagerlyUsedDeclarations: Map<string, nga.DeclarationMetadata[]>;
  } = {
    ...rawCtx,
    remoteScopedClasses:
      chunkContext?.remoteScopedClasses || rawCtx.remoteScopedClasses || new Set(),
    metadataMap: chunkContext?.metadataMap || rawCtx.metadataMap || new Map(),
    eagerlyUsedDeclarations: chunkContext?.eagerlyUsedDeclarations || new Map(),
  };
  const s = new MagicString(content);
  const printer = new ExpressionPrinter(filePath);
  const fileDiagnostics: nga.NgDiagnostic[] = [];

  const result = metadata || (await ctx.analyzer.getMetadataForFile(filePath));
  if (!result) {
    return {magicString: s};
  }
  const {classes, importsEnd, imports: importDeclarations} = result;

  if (!ctx.emitDeclarationOnly) {
    insertSignalDebugNames(s, result.signalDebugNames, printer.emitTypes);
  }

  // Reuse namespace aliases the file already has, so re-processing an already-processed file
  // doesn't mint a second `i0` for `@angular/core`.
  for (const decl of importDeclarations) {
    for (const binding of decl.bindings) {
      // `imported` is absent exactly for `import * as ns from '...'`.
      if (binding.imported == null && GENERATED_NAMESPACE_ALIAS.test(binding.local)) {
        printer.addNamespaceImport(decl.specifier, binding.local);
      }
    }
  }

  let fileAnalysis = getOrCreateFileAnalysis(ctx.fileCache, filePath);
  let templatesByClass = fileAnalysis.parsedTemplates;
  if (!templatesByClass) {
    templatesByClass = new Map<string, any>();
    fileAnalysis.parsedTemplates = templatesByClass;
  }

  // Shared pool for all components and directives in the file.
  // This mirrors Angular's behavior:
  const sharedPool = new ConstantPool(ctx.isClosureCompilerEnabled);

  // Local bindings each component in this file reaches only from inside a `@defer` block, and
  // those any component still needs eagerly. Accumulated across every class and reconciled once
  // the loop ends — see `removeDeferredImports`.
  const deferredOnlyNames = new Set<string>();
  const eagerlyBoundNames = new Set<string>();
  // Locals a component names in `imports: [...]` without deferring them itself, so its emitted
  // dependencies still reference them and the static import has to survive.
  //
  // Kept apart from `eagerlyBoundNames` and folded in only after the loop: it is a fact about
  // the *file*, and letting one class's entry steer a later class's per-component decisions
  // would make the output depend on declaration order.
  const eagerDependencyNames = new Set<string>();
  // Which declaration introduced each local binding. Deferrability is a property of the whole
  // `import` statement, so a symbol can only be deferred once its co-bindings are accounted for.
  const importsByBinding = new Map<string, nga.ImportDeclarationMetadata>();
  for (const decl of importDeclarations) {
    for (const binding of decl.bindings) {
      importsByBinding.set(binding.local, decl);
    }
  }

  for (const classMeta of classes) {
    const {
      span,
      className,
      constructorParams,
      injectable,
      service,
      component,
      directive,
      pipe,
      hostBindings,
      hostListeners,
      ngModule,
    } = classMeta;

    // Pre-derived by `prepare_members` in ng-analyze/src/analyzer/class_data.rs: model()
    // expansion, coercion marking, and query ordering.
    const {inputs, outputs, queries, viewQueries} = classMeta;

    for (const span of classMeta.removalSpans) {
      s.remove(span.start, span.end);
    }

    // Stripping the decorators stops tsickle from tagging statics `@nocollapse`; add it back.
    if (ctx.isClosureCompilerEnabled) {
      for (const insertion of classMeta.nocollapseInsertions) {
        s.appendLeft(insertion.position, insertion.text);
      }
    }

    if (!className) continue;

    if (component?.isJit || directive?.isJit) {
      const coreNamespace = printer.getOrCreateNamespace('@angular/core');
      for (const input of inputs) {
        if (input.isSignal && input.propertySpan) {
          const inputArgsObj: string[] = [
            'isSignal: true',
            `alias: ${JSON.stringify(input.alias ?? input.name)}`,
            `required: ${input.required ? 'true' : 'false'}`,
          ];
          const inputArgs = `({${inputArgsObj.join(', ')}} as any)`;
          s.appendLeft(input.propertySpan.start, `@${coreNamespace}.Input(${inputArgs}) `);
        }
      }

      for (const output of outputs) {
        if (output.isSignal && output.propertySpan) {
          const outputArg = JSON.stringify(output.alias ?? output.name);
          s.appendLeft(output.propertySpan.start, `@${coreNamespace}.Output(${outputArg}) `);
        }
      }

      const allSignalQueries = [...(queries ?? []), ...(viewQueries ?? [])].filter(
        (q) => q.isSignal && q.propertySpan,
      );
      for (const query of allSignalQueries) {
        const decoratorName = query.isView
          ? query.first
            ? 'ViewChild'
            : 'ViewChildren'
          : query.first
            ? 'ContentChild'
            : 'ContentChildren';
        const rawPred = s.original.slice(query.predicateSpan.start, query.predicateSpan.end);
        // A signal query has selectors exactly when its locator is string-literal-like.
        const predicateStr = query.predicateSelectors
          ? rawPred
          : `${coreNamespace}.forwardRef(() => ${rawPred})`;
        const optionsObj: string[] = ['isSignal: true'];
        if (query.readSpan) {
          const readStr = s.original.slice(query.readSpan.start, query.readSpan.end);
          optionsObj.push(`read: ${readStr}`);
        }
        if (!query.isView && query.descendants) {
          optionsObj.push('descendants: true');
        }
        const optionsStr = `({${optionsObj.join(', ')}} as any)`;
        s.appendLeft(
          query.propertySpan!.start,
          `@${coreNamespace}.${decoratorName}(${predicateStr}, ${optionsStr}) `,
        );
      }

      continue;
    }

    // Build deps from constructor params
    // Use empty array for no-arg constructors (null means "inherit from parent")
    const deps = buildDeps(constructorParams, classMeta.usesInheritance, o, s);

    // Track if a factory has already been generated for the current class.
    // This is necessary to avoid duplicate ɵfac generation when a class has multiple decorators.
    // Angular handles this generically by checking if a result with the same name already exists
    // in the compiled results array.
    // See: https://github.com/angular/angular/blob/d27e2c24e1aa6eaf60cfdf61ba812ff9c7f933c2/packages/compiler-cli/src/ngtsc/transform/src/compilation.ts#L716
    let factoryGenerated = false;

    // NgModule side-effect statements, emitted after `ɵsetClassMetadata` (see below).
    let ngModuleStatements = '';

    const decoratorsToEmit: DecoratorMetadata[] = [];
    const guards = ctx.complianceMode ? [] : classMeta.laterDeclarationReferences;

    // Deferrable dependencies aggregated across all of a component's `@defer` blocks, emitted in
    // the `ɵsetClassMetadataAsync` loader and, under per-component emit, in the `_DeferFn`.
    // Mirrors the reference's `resolveAllDeferredDependencies`: only deferrable
    // (externally-imported) deps are included, de-duplicated across blocks, in template order.
    // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L2253
    const perComponentDeferredDeps: R3DeferPerComponentDependency[] = [];
    const seenDeferredDeps = new Set<string>();

    if (pipe) {
      decoratorsToEmit.push({
        decoratorName: pipe.decoratorName ?? 'Pipe',
        argsSpan: pipe.argsSpan ?? undefined,
      });
      factoryGenerated = true;
      // 1. Generate ɵfac (Factory)
      const factoryRes = compileFactoryFunction({
        name: className,
        type: {
          value: o.variable(className),
          type: o.variable(className),
        },
        typeArgumentCount: classMeta?.typeParameters?.length ?? 0,
        deps: deps,
        target: FactoryTarget.Pipe,
      });

      const compiledFactory = compileFactoryField(factoryRes, printer, ctx);

      // 2. Generate ɵpipe (PipeDef)
      const def = compilePipeFromMetadata({
        name: className,
        type: {
          value: o.variable(className),
          type: o.variable(className),
        },
        pipeName: pipe.name,
        pure: pipe.pure ?? true,
        isStandalone: pipe.standalone ?? true,
        typeArgumentCount: classMeta?.typeParameters?.length ?? 0,
        deps: null,
      });
      const compiledPipe = createStaticField(
        'ɵpipe',
        printer.print(def.expression),
        printer.emitTypes ? printer.printType(def.type) : null,
        true,
        ctx.isClosureCompilerEnabled,
      );

      // Insert at classEnd - 1 (before the closing brace)
      s.appendLeft(span.end - 1, compiledFactory + compiledPipe);
    }

    if (component) {
      factoryGenerated = true;
      const {
        selector,
        template,
        styles,
        standalone,
        schemas,
        resolvedDeclarations,
        hostDirectives,
        preserveWhitespaces,
      } = component;
      const hostMetadata = component.hostMetadata ?? [];

      // Non-string `template` values report NG1010 in `ClassData::validate_template_declaration`
      // and fall back to an empty template (matching ngtsc's `createEmptyTemplate`).
      // `templateUrl` takes precedence over `template`:
      // https://github.com/angular/angular/blob/c1829f6/packages/compiler-cli/src/ngtsc/annotations/component/src/resources.ts#L392-L431

      const rawImports = component.rawImportsSpan
        ? sliceGuarded(s, component.rawImportsSpan, guards)
        : undefined;
      const importsFactory = component.importsFactorySpan
        ? sliceGuarded(s, component.importsFactorySpan, guards)
        : undefined;
      const providers = component.providersSpan
        ? sliceGuarded(s, component.providersSpan, guards)
        : undefined;
      const viewProviders = component.viewProvidersSpan
        ? sliceGuarded(s, component.viewProvidersSpan, guards)
        : undefined;
      const animations = component.animationsSpan
        ? sliceGuarded(s, component.animationsSpan, guards)
        : undefined;

      // Encapsulation arrives pre-resolved to its numeric enum member value; apply the same
      // default ngtsc does when the analyzer left it unresolved.
      const encapsulationValue = component.encapsulation ?? ViewEncapsulation.Emulated;
      const changeDetectionValue = component.changeDetection
        ? new o.WrappedNodeExpr(new RawSource(component.changeDetection))
        : null;

      // When `externalRuntimeStyles` is enabled, styleUrls are not loaded from disk; instead
      // the resolved resource URLs are emitted via the `ɵɵExternalStylesFeature(...)` so the
      // runtime can fetch them. Inline styles are likewise treated as external URLs. Mirrors
      // the reference component handler.
      // https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L888-L964
      const externalRuntimeStyles = !!ctx.externalRuntimeStyles;

      // Collect styles in precedence order (least to greatest priority => array start to end):
      // 1. styleUrls from @Component (component.stylesFromUrls)
      // 2. <link> from template (parsed.styleUrls)
      // 3. styles from @Component (component.styles)
      // 4. <style> from template (parsed.styles)
      // https://github.com/angular/angular/blob/0eeb1b5f03/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L837-L839
      const allStyles: string[] = [];
      const externalStyles: string[] = [];
      if (externalRuntimeStyles) {
        for (const styleUrl of component.styleUrls ?? []) {
          externalStyles.push(styleUrl.resolvedPath);
        }
      } else if (component.stylesFromUrls) {
        allStyles.push(...component.stylesFromUrls);
      }

      // 1. Parse template (or reuse if already parsed)
      const classKey = makeClassKey(classMeta.className, classMeta.span.start);
      let parsed = templatesByClass.get(classKey);
      if (!parsed) {
        parsed = parseComponentTemplate(component, filePath, content, ctx.templateParseOptions);
        templatesByClass.set(classKey, parsed);
      }

      if (parsed.errors && parsed.errors.length > 0) {
        for (const error of parsed.errors) {
          const span = error.span;
          let start = span.start.offset;
          let end = span.end.offset;
          if (start === end) {
            end++;
          }
          fileDiagnostics.push({
            category: 1,
            code: 5002,
            messageText: error.msg,
            ...templateDiagnosticLocation(component, filePath, {start, end}),
          });
        }
        continue;
      }

      // Foreign component template feature analysis (NG8025-NG8029), mirroring the
      // reference's analyzeForeignComponentFeatures call during component analysis. It runs
      // for every component template: with no foreignImports the matcher is empty, so the
      // only reportable problem is a misplaced @content block. Any finding poisons the
      // component in ngtsc, so — like the template parse error path above — the component
      // is not compiled further.
      // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L857-L863
      const foreignComponentNames = new Set(
        (component.foreignImports ?? []).map((foreign) => foreign.name),
      );
      const foreignComponentDiagnostics = analyzeForeignComponentFeatures(
        parsed.nodes,
        foreignComponentNames,
        component.templateUrl?.resolvedPath ?? filePath,
      );
      if (foreignComponentDiagnostics.length > 0) {
        for (const diagnostic of foreignComponentDiagnostics) {
          fileDiagnostics.push(
            diagnostic.span
              ? {...diagnostic, ...templateDiagnosticLocation(component, filePath, diagnostic.span)}
              : diagnostic,
          );
        }
        continue;
      }

      for (const styleUrl of parsed.styleUrls) {
        const resolvedPath = path.resolve(path.dirname(filePath), styleUrl);
        if (externalRuntimeStyles) {
          externalStyles.push(resolvedPath);
          continue;
        }
        const resolvedContent = readResource
          ? readResource(resolvedPath)
          : await fs.readFile(resolvedPath, 'utf8').catch(() => undefined);

        if (resolvedContent !== undefined) {
          allStyles.push(resolvedContent);
        } else {
          // NG2008 (COMPONENT_RESOURCE_NOT_FOUND), anchored where ngtsc anchors
          // template-sourced stylesheet failures: the template declaration node
          // (`templateUrl`'s expression for external templates, `template`'s for inline).
          // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/resources.ts#L750-L761
          const span = component.templateUrl?.stringLiteralSpan ?? component.templateSpan;
          fileDiagnostics.push({
            category: 1,
            code: 2008,
            messageText: `Could not find stylesheet file '${styleUrl}' linked from the template.`,
            filePath,
            span: span ? {start: span.start, end: span.end} : undefined,
          });
        }
      }

      // Inline styles (`styles` and `<style>`) are always bundled into `allStyles`, even under
      // `externalRuntimeStyles`, matching `ngtsc` synchronous compilation behavior.
      if (component.styles) {
        allStyles.push(...component.styles);
      }
      allStyles.push(...parsed.styles);

      // Loose `!= null` treats both `null` (JSON sidecar wire) and `undefined` (Napi) as absent.
      const hasStyleField = component.styleUrls != null || component.styles != null;
      const hasTemplateUrl = component.templateUrl != null;
      decoratorsToEmit.push({
        decoratorName: component.decoratorName ?? 'Component',
        argsSpan: component.argsSpan ?? undefined,
        preservedDecoratorProperties: component.preservedDecoratorProperties ?? undefined,
        resourceOverride:
          hasStyleField || hasTemplateUrl
            ? {
                inlineStyles: allStyles,
                inlineTemplate: hasTemplateUrl ? (template ?? '') : null,
                stripStyleFields: hasStyleField,
              }
            : undefined,
      });

      // 2. Filter declarations to only those used in template (optimize mode)
      let filteredDeclarations: nga.DeclarationMetadata[] = [...(resolvedDeclarations || [])];

      // Calculate hasUnresolvedImports BEFORE adding self-reference, so a self-reference alone
      // doesn't trigger "resolved mode" and wipe out rawImports.
      const hasUnresolvedImports = rawImports !== undefined;

      // The non-optimized pipeline (and declaration-only emission) backs Angular's local
      // compilation mode (`CompilationMode.LOCAL`, see `ngtsc/core/src/compiler.ts:1328-1330`).
      const isLocalCompilation = !ctx.optimize || !!ctx.emitDeclarationOnly;

      if (standalone) {
        const isAlreadyImported = filteredDeclarations.some((d) => d.name === className);

        if (!isAlreadyImported) {
          filteredDeclarations.push(
            metadataToDeclaration(component, classMeta, 'component', parsed.ngContentSelectors),
          );
        }
      }

      // Track declarations by object identity (MinimalDirectiveMeta -> DeclarationMetadata)
      // rather than class name so distinct modules exporting same-named classes don't collide.
      const matcher = new SelectorMatcher<MinimalDirectiveMeta[]>();
      const metaToDecl = new Map<MinimalDirectiveMeta, nga.DeclarationMetadata>();
      const registerSelectable = (decl: nga.DeclarationMetadata, selector: string): void => {
        const meta = createDirectiveMeta(decl, undefined, undefined, filePath);
        metaToDecl.set(meta, decl);
        matcher.addSelectables(CssSelector.parse(selector), [meta]);
      };
      for (const decl of filteredDeclarations) {
        // The analyzer has already applied ngtsc's default selector (`ng-component`) to
        // components. A declaration still without one — a directive without a selector, or a
        // selector that did not evaluate — is left out of the matcher, as ngtsc leaves out a
        // directive whose selector is `null`.
        if (decl.selector) {
          registerSelectable(decl, decl.selector);
        }
      }

      // Bind template to find used directives
      const binder = new R3TargetBinder(matcher);
      const bound = binder.bind({template: parsed.nodes});

      /** Resolves binder matches back to the declarations they were registered from. */
      const toDecls = (metas: MinimalDirectiveMeta[]): nga.DeclarationMetadata[] =>
        metas
          .map((meta) => metaToDecl.get(meta))
          .filter((decl): decl is nga.DeclarationMetadata => decl !== undefined);

      // Map pipe name -> declaration. Pipes stay keyed by their template-visible name because
      // that is the only handle a template has on them; two declarations claiming the same pipe
      // name are in conflict, and last-one-wins matches how ngtsc resolves them (later imports
      // override earlier imports, and locally declared pipes override imported declarations).
      const pipeNameToDecl = new Map<string, nga.DeclarationMetadata>();
      for (const decl of filteredDeclarations) {
        if (decl.declarationType === 'pipe' && decl.pipeName) {
          pipeNameToDecl.set(decl.pipeName, decl);
        }
      }

      const deferBlocksMap = new Map<DeferredBlock, o.Expression | null>();
      const usedDirectiveDecls = new Set(toDecls(bound.getUsedDirectives()));
      const usedPipes = new Set(bound.getUsedPipes());
      const eagerlyUsedDirectiveDecls = new Set(toDecls(bound.getEagerlyUsedDirectives()));
      const eagerlyUsedPipes = new Set(bound.getEagerlyUsedPipes());

      const usedDeclarations = filteredDeclarations.filter((d) => {
        if (d.declarationType === 'ngmodule') {
          return true; // Eagerly preserve NgModules!
        }
        if (d.declarationType === 'pipe') {
          return d.pipeName && usedPipes.has(d.pipeName) && pipeNameToDecl.get(d.pipeName) === d;
        }
        return usedDirectiveDecls.has(d);
      });

      const hasBlockSpecificImports = component?.deferredImportsByBlock != null;
      const hasDeferredImportsField = hasBlockSpecificImports || component?.deferredImports != null;

      // Validate named defer blocks and extract allowed deferred dependencies per block
      const deferBlocks = bound.getDeferBlocks();
      for (const block of deferBlocks) {
        const blockName = (block as any).definedName ?? null;
        if (hasBlockSpecificImports) {
          if (blockName === null) {
            fileDiagnostics.push({
              category: 1, // Error
              code: 11100,
              messageText: `@defer block must specify a 'name' parameter (e.g. '@defer (name blockName)') when 'deferredImports' is defined.`,
              filePath,
              span: block.sourceSpan
                ? {start: block.sourceSpan.start.offset, end: block.sourceSpan.end.offset}
                : (component?.deferredImportsSpan ?? span),
            });
          } else if (!component?.deferredImportsByBlock?.[blockName]) {
            fileDiagnostics.push({
              category: 1, // Error
              code: 11101,
              messageText: `The 'name' parameter references block '${blockName}' which is missing from '@Component.deferredImports'.`,
              filePath,
              span: block.sourceSpan
                ? {start: block.sourceSpan.start.offset, end: block.sourceSpan.end.offset}
                : (component?.deferredImportsSpan ?? span),
            });
          }
        } else {
          if (blockName !== null) {
            fileDiagnostics.push({
              category: 1, // Error
              code: 11102,
              messageText: `The 'name' parameter can only be used when '@Component.deferredImports' is defined.`,
              filePath,
              span: block.sourceSpan
                ? {start: block.sourceSpan.start.offset, end: block.sourceSpan.end.offset}
                : (component?.deferredImportsSpan ?? span),
            });
          }
        }
      }

      // Track declarations that are actually deferred across all defer blocks
      const allDeferredDecls = new Set<nga.DeclarationMetadata>();
      if (hasDeferredImportsField) {
        for (const block of deferBlocks) {
          const blockName = (block as any).definedName ?? null;
          // TODO(parity): unlike the sets above, the allow-list a `deferredImports` entry
          // contributes to is still matched by class name. It mixes two vocabularies that
          // cannot be reconciled here — local aliases from the unresolved refs and exported
          // names from the resolved declarations — and the resolved declarations arrive as a
          // separate array from the analyzer, so they are not the objects `metaToDecl` holds.
          // Two same-named classes where only one is listed therefore both pass the filter.
          // Fixing it needs the analyzer to carry a declaration identity across both arrays.
          let allowedNames: Set<string> | null = null;
          if (hasBlockSpecificImports) {
            if (blockName !== null && component?.deferredImportsByBlock?.[blockName]) {
              allowedNames = new Set(
                component.deferredImportsByBlock[blockName]
                  .map((r) => r.localAlias || r.typecheckImport?.symbol)
                  .filter((s): s is string => typeof s === 'string'),
              );
              for (const d of component.resolvedDeferredDeclarationsByBlock?.[blockName] ?? []) {
                allowedNames.add(d.name);
              }
            } else {
              allowedNames = new Set<string>();
            }
          } else if (component?.deferredImports != null) {
            allowedNames = new Set(
              component.deferredImports
                .map((r) => r.localAlias || r.typecheckImport?.symbol)
                .filter((s): s is string => typeof s === 'string'),
            );
            for (const d of component.resolvedDeferredDeclarations ?? []) {
              allowedNames.add(d.name);
            }
          }

          const blockBound = binder.bind({template: block.children});
          for (const decl of toDecls(blockBound.getEagerlyUsedDirectives())) {
            if (eagerlyUsedDirectiveDecls.has(decl)) continue;
            if (allowedNames === null || allowedNames.has(decl.name)) {
              allDeferredDecls.add(decl);
            }
          }
          for (const pipeName of blockBound.getEagerlyUsedPipes()) {
            if (eagerlyUsedPipes.has(pipeName)) continue;
            const decl = pipeNameToDecl.get(pipeName);
            if (decl && (allowedNames === null || allowedNames.has(decl.name))) {
              allDeferredDecls.add(decl);
            }
          }
        }
      }

      const eagerDirectiveDecls = new Set(eagerlyUsedDirectiveDecls);
      const eagerPipes = new Set(eagerlyUsedPipes);

      // Filter to only eager declarations (exclude deferred-only)
      filteredDeclarations = usedDeclarations.filter((d) => {
        if (d.declarationType === 'ngmodule') {
          return true; // Keep NgModules eager!
        }
        if (hasDeferredImportsField) {
          // If explicit deferredImports is used, anything not deferred in any defer block remains eager (commit 443104adb4)
          if (!allDeferredDecls.has(d)) {
            return true;
          }
        }
        if (d.declarationType === 'pipe') {
          return d.pipeName && eagerPipes.has(d.pipeName);
        }
        return eagerDirectiveDecls.has(d);
      });

      for (const d of filteredDeclarations) {
        if (d.declarationType === 'pipe' && d.pipeName) {
          eagerPipes.add(d.pipeName);
        } else {
          eagerDirectiveDecls.add(d);
        }
      }

      if (isLocalCompilation && component.localCompilationExtraImports) {
        for (const spec of component.localCompilationExtraImports) {
          printer.addSideEffectImport(spec);
        }

        const isRemotelyScoped = ctx.remoteScopedClasses?.has(`${filePath}#${className}`) ?? false;
        const hasCycle = isRemotelyScoped || filteredDeclarations.some((d) => d.cycleProne);
        if (!hasCycle) {
          for (const decl of filteredDeclarations) {
            const spec = decl.ref.consumerImport?.specifier;
            if (spec) {
              printer.addSideEffectImport(spec);
            }
          }
        }

        if (!standalone) {
          filteredDeclarations = [];
          usedDeclarations.length = 0;
          metaToDecl.clear();
          pipeNameToDecl.clear();
        }
      }

      // Local bindings this component reaches only from inside a `@defer` block. Needed before
      // the blocks are compiled: a dependency is emitted as a dynamic `import()` only if its
      // static import can actually go away, and that is decided per import *declaration*.
      const deferredHere = new Set<string>();
      if (isLocalCompilation && standalone && hasDeferredImportsField) {
        // Scoped to this component rather than read off the file-level set: a symbol another
        // component imports eagerly still blocks *removal* of the declaration, but it must not
        // change what this component emits, or the output would turn on declaration order.
        const importedHere = new Set<string>();
        for (const ref of component.imports ?? []) {
          if (ref.localAlias !== undefined) {
            importedHere.add(ref.localAlias);
            eagerDependencyNames.add(ref.localAlias);
          }
        }
        for (const ref of component.deferredImports ?? []) {
          const local = ref.localAlias;
          if (local === undefined) continue;
          if (!importedHere.has(local)) {
            deferredHere.add(local);
          }
        }
      } else {
        for (const decl of usedDeclarations) {
          const local = decl.ref.localAlias;
          if (local === undefined) continue;
          if (filteredDeclarations.includes(decl)) {
            eagerlyBoundNames.add(local);
            continue;
          }
          if (ctx.onlyExplicitDeferDependencyImports && !decl.isExplicitlyDeferred) {
            continue;
          }
          deferredHere.add(local);
        }
        // ngtsc's `DeferredSymbolTracker.markAsDeferrableCandidate` excuses the one identifier
        // it was handed, not every occurrence of the symbol in the file, so only the component
        // that actually defers a dependency gets its `imports` entry forgiven. Every other
        // component listing the same symbol still references it eagerly — including one whose
        // dependencies this compiler could not resolve, which is every component under local
        // compilation.
        // https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/imports/src/deferred_symbol_tracker.ts
        for (const ref of component?.imports ?? []) {
          const local = ref.localAlias;
          if (local === undefined || deferredHere.has(local)) continue;
          eagerDependencyNames.add(local);
        }
      }
      for (const local of deferredHere) {
        deferredOnlyNames.add(local);
      }

      /**
       * Whether `decl` may be reached through a dynamic import instead of the static one it
       * has now. ngtsc gates `isDeferrable` on `DeferredSymbolTracker.canDefer` for the same
       * reason: emitting a dynamic import while the static one survives would pull the module
       * into the eager graph anyway, so the reference is left as a plain identifier instead.
       *
       * Decided per component, so it can disagree with the file-level removal below when a
       * *different* component in this file needs the same symbol eagerly. Removal is then the
       * more conservative of the two, which is the safe direction: an import that stays costs
       * a redundant static reference, an import wrongly dropped leaves a dangling one.
       */
      const isRefDeferrable = (ref: nga.ReferenceMetadata): boolean => {
        const local = ref.localAlias;
        if (local === undefined || !ref.typecheckImport) return false;
        const owner = importsByBinding.get(local);
        if (owner === undefined) return false;
        return owner.bindings.every(
          (b) => b.isType || (deferredHere.has(b.local) && !b.valueReferenced),
        );
      };

      const isDeferrable = (decl: nga.DeclarationMetadata): boolean => isRefDeferrable(decl.ref);

      if (isLocalCompilation && standalone && hasDeferredImportsField) {
        for (const ref of component.deferredImports ?? []) {
          const imported = isRefDeferrable(ref) ? deferredImportOf(ref, importsByBinding) : null;
          if (imported === null) {
            if (ref.localAlias) {
              eagerlyBoundNames.add(ref.localAlias);
              deferredOnlyNames.delete(ref.localAlias);
            }
            continue;
          }
          const key = deferredDepKey(imported.importPath, imported.symbolName);
          if (!seenDeferredDeps.has(key)) {
            seenDeferredDeps.add(key);
            perComponentDeferredDeps.push(imported);
          }
        }
      }

      for (const block of deferBlocks) {
        const blockName = (block as any).definedName ?? null;
        if (isLocalCompilation && standalone && hasBlockSpecificImports) {
          const blockRefs =
            blockName !== null ? (component.deferredImportsByBlock?.[blockName] ?? []) : [];
          const dependencies: R3DeferPerBlockDependency[] = [];
          for (const ref of blockRefs) {
            const imported = isRefDeferrable(ref) ? deferredImportOf(ref, importsByBinding) : null;
            dependencies.push({
              typeReference: refToExpression(ref),
              // Read only when `isDeferrable`: `compileDeferResolverFunction` emits the
              // `typeReference` for the rest and never looks at their name. ngtsc names those
              // after the resolved declaration, which local compilation cannot see.
              symbolName: imported?.symbolName ?? ref.localAlias ?? '',
              isDeferrable: imported !== null,
              importPath: imported?.importPath ?? null,
              isDefaultImport: imported?.isDefaultImport ?? false,
            });
          }
          deferBlocksMap.set(
            block,
            dependencies.length === 0
              ? null
              : compileDeferResolverFunction({
                  mode: DeferBlockDepsEmitMode.PerBlock,
                  dependencies,
                }),
          );
          continue;
        }

        let allowedNames: Set<string> | null = null;
        if (hasBlockSpecificImports) {
          if (blockName !== null && component?.deferredImportsByBlock?.[blockName]) {
            allowedNames = new Set(
              component.deferredImportsByBlock[blockName]
                .map((r) => r.localAlias || r.typecheckImport?.symbol)
                .filter((s): s is string => typeof s === 'string'),
            );
            for (const d of component.resolvedDeferredDeclarationsByBlock?.[blockName] ?? []) {
              allowedNames.add(d.name);
            }
          } else {
            allowedNames = new Set<string>();
          }
        } else if (component?.deferredImports != null) {
          allowedNames = new Set(
            component.deferredImports
              .map((r) => r.localAlias || r.typecheckImport?.symbol)
              .filter((s): s is string => typeof s === 'string'),
          );
          for (const d of component.resolvedDeferredDeclarations ?? []) {
            allowedNames.add(d.name);
          }
        }

        const blockBound = binder.bind({template: block.children});
        const dependencies: R3DeferPerBlockDependency[] = [];

        // Add deferred directives
        for (const decl of toDecls(blockBound.getEagerlyUsedDirectives())) {
          if (eagerDirectiveDecls.has(decl)) continue;
          if (allowedNames !== null && !allowedNames.has(decl.name)) continue;

          const imported = isDeferrable(decl) ? deferredImportOf(decl.ref, importsByBinding) : null;
          if (imported === null && decl.ref.localAlias) {
            eagerlyBoundNames.add(decl.ref.localAlias);
            deferredOnlyNames.delete(decl.ref.localAlias);
          }
          dependencies.push({
            typeReference: refToExpression(decl.ref),
            symbolName: imported?.symbolName ?? decl.name,
            isDeferrable: imported !== null,
            importPath: imported?.importPath ?? null,
            isDefaultImport: imported?.isDefaultImport ?? false,
          });
        }

        // Add deferred pipes
        for (const pipeName of blockBound.getEagerlyUsedPipes()) {
          // Check if it's eager; if so, skip (it's in the component's dependencies)
          if (eagerPipes.has(pipeName)) continue;

          const decl = pipeNameToDecl.get(pipeName);
          if (!decl) continue;
          if (allowedNames !== null && !allowedNames.has(decl.name)) continue;

          const imported = isDeferrable(decl) ? deferredImportOf(decl.ref, importsByBinding) : null;
          if (imported === null && decl.ref.localAlias) {
            eagerlyBoundNames.add(decl.ref.localAlias);
            deferredOnlyNames.delete(decl.ref.localAlias);
          }
          dependencies.push({
            typeReference: refToExpression(decl.ref),
            symbolName: imported?.symbolName ?? decl.name,
            isDeferrable: imported !== null,
            importPath: imported?.importPath ?? null,
            isDefaultImport: imported?.isDefaultImport ?? false,
          });
        }

        // Aggregate this block's deferrable deps for the component-wide async metadata loader,
        // de-duplicating since the same dependency may appear in multiple blocks.
        for (const dep of dependencies) {
          if (!dep.isDeferrable || !dep.importPath) continue;
          const key = deferredDepKey(dep.importPath, dep.symbolName);
          if (seenDeferredDeps.has(key)) continue;
          seenDeferredDeps.add(key);
          perComponentDeferredDeps.push({
            symbolName: dep.symbolName,
            importPath: dep.importPath,
            isDefaultImport: dep.isDefaultImport,
          });
        }

        if (dependencies.length > 0) {
          deferBlocksMap.set(
            block,
            compileDeferResolverFunction({
              mode: DeferBlockDepsEmitMode.PerBlock,
              dependencies,
            }),
          );
        } else {
          deferBlocksMap.set(block, null);
        }
      }

      // 3. Build declarations from filtered declarations.
      //
      // ngtsc emits the dependency list in a specific order: directives and NgModules first (in
      // scope order), then all pipes (see `componentDependenciesToDeclarations`, where directives
      // and NgModules are produced while iterating `allDependencies` and pipes are appended from a
      // separate map afterwards). Preserve that ordering here so the `dependencies` array matches.
      const directivesAndModules = filteredDeclarations.filter((d) => d.declarationType !== 'pipe');
      const eagerPipeSet = new Set(
        filteredDeclarations.filter((d) => d.declarationType === 'pipe'),
      );
      const pipeDecls = Array.from(pipeNameToDecl.values()).filter((d) => eagerPipeSet.has(d));
      const orderedDeclarations = [...directivesAndModules, ...pipeDecls];

      const declarations = !hasUnresolvedImports
        ? orderedDeclarations.map((decl) =>
            decl.declarationType === 'ngmodule'
              ? {
                  kind: 2, // R3TemplateDependencyKind.NgModule
                  type: refToExpression(decl.ref),
                }
              : {
                  kind: decl.declarationType === 'pipe' ? 1 : 0, // 1: Pipe, 0: Directive
                  type: refToExpression(decl.ref),
                  selector: decl.selector || '',
                  inputs: [],
                  outputs: [],
                  exportAs: decl.exportAs || null,
                  isComponent: decl.declarationType === 'component',
                },
          )
        : [];

      // Decide whether the `dependencies` list is emitted directly or wrapped in a closure,
      // mirroring the reference compiler's naming and conditions.
      // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L2040
      // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L286
      const isExpressionForwardReference = (d: nga.DeclarationMetadata): boolean => {
        if (className && d.name === className) return false;
        return !!d.isForwardRef;
      };

      const hasForwardRef = filteredDeclarations.some((d) => isExpressionForwardReference(d));

      // Whether the template uses any directive/component (pipes don't count). When there are
      // unresolved runtime imports, we conservatively assume true because those imports may
      // contain matching directives.
      // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L1395-L1404
      const templateUsesDirectives = hasUnresolvedImports ? true : usedDirectiveDecls.size > 0;

      // 4. Build R3ComponentMetadata
      // Use a valid source span when there are host bindings (required by Angular's binding parser)
      const typeSourceSpan = createDummySourceSpan(filePath);

      // https://github.com/angular/angular/blob/c1829f6/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L1308-L1311
      const localRuntimeResolved =
        isLocalCompilation && (!standalone || importsFactory !== undefined);

      const depMeta = computeComponentDependencyMetadata(
        isLocalCompilation,
        localRuntimeResolved,
        ctx.remoteScopedClasses?.has(`${filePath}#${className}`) ?? false,
        hasUnresolvedImports,
        hasForwardRef,
        standalone,
        declarations,
        rawImports,
        importsFactory,
      );

      const deferMeta: R3ComponentMetadata<R3TemplateDependency>['defer'] =
        isLocalCompilation && standalone && !hasBlockSpecificImports
          ? {
              mode: DeferBlockDepsEmitMode.PerComponent,
              dependenciesFn:
                perComponentDeferredDeps.length === 0
                  ? null
                  : compileDeferResolverFunction({
                      mode: DeferBlockDepsEmitMode.PerComponent,
                      dependencies: perComponentDeferredDeps,
                    }),
            }
          : {mode: DeferBlockDepsEmitMode.PerBlock, blocks: deferBlocksMap};

      const componentMeta: R3ComponentMetadata<R3TemplateDependency> = {
        name: className,
        type: {
          value: o.variable(className),
          type: o.variable(className),
        },
        typeArgumentCount: classMeta?.typeParameters?.length ?? 0,
        typeSourceSpan,
        // The analyzer already applies ngtsc's default `ng-component` to a component without a
        // selector. One is missing here only when `selector` did not evaluate to a string, which
        // is reported as an error; the component is still compiled, with the default.
        selector: selector ?? 'ng-component',
        deps: deps,
        queries: buildQueriesMap(queries, content),
        viewQueries: buildQueriesMap(viewQueries, content),
        host: buildHostMetadata(hostMetadata, hostBindings, hostListeners, className, {
          filePath,
          hostSpan: component.hostSpan,
          hostProperties: component.hostProperties,
          diagnostics: fileDiagnostics,
        }),
        lifecycle: {usesOnChanges: classMeta.usesOnChanges},
        inputs: buildInputsMap(inputs, content),
        outputs: buildOutputsMap(outputs),
        usesInheritance: classMeta.usesInheritance,
        controlCreate: null,
        exportAs: component.exportAs || null,
        providers: providers ? new o.WrappedNodeExpr(new RawSource(providers)) : null,
        viewProviders: viewProviders ? new o.WrappedNodeExpr(new RawSource(viewProviders)) : null,
        isStandalone: standalone,
        isSignal: component.signals,
        hostDirectives: buildHostDirectives(hostDirectives),

        // Component-specific
        template: {
          nodes: parsed.nodes,
          ngContentSelectors: parsed.ngContentSelectors || [],
        },
        // Local compilation cannot inspect dependencies, so it always assumes directive
        // dependencies exist (avoiding the DOM-only fast path). In global compilation, a
        // standalone component only has dependencies when its template uses a directive:
        // https://github.com/angular/angular/blob/e3ac727dfc/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L1380-L1393
        hasDirectiveDependencies: isLocalCompilation ? true : !standalone || templateUsesDirectives,
        declarations: depMeta.declarations,
        defer: deferMeta,
        declarationListEmitMode: depMeta.declarationListEmitMode,
        rawImports: depMeta.rawImports,
        styles: allStyles,
        externalStyles: externalStyles.length > 0 ? externalStyles : undefined,
        encapsulation: encapsulationValue,
        animations: animations ? new o.WrappedNodeExpr(new RawSource(animations)) : null,
        changeDetection: changeDetectionValue,
        relativeContextFilePath: filePath,
        i18nUseExternalIds: ctx.i18nUseExternalIds ?? true,
        // Project-relative path of the file the template's text lives in: the `templateUrl`
        // resource, or this file for an inline template. Only `ɵɵattachSourceLocations` reads it,
        // and only under `enableTemplateSourceLocations`.
        // https://github.com/angular/angular/blob/b3b9f39/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L815-L825
        relativeTemplatePath: getProjectRelativePath(
          component.templateUrl?.resolvedPath ?? filePath,
          ctx.rootDir,
        ),
        enableTemplateSourceLocations: ctx.enableTemplateSourceLocations ?? false,
        foreignImports:
          component.foreignImports?.map((fi) => ({
            name: fi.name,
            component: new o.WrappedNodeExpr(new RawSource(sliceGuarded(s, fi.span, guards))),
          })) ?? [],
        legacyOptionalChaining: ctx.legacyOptionalChaining,
      };

      // 5. Compile
      const bindingParser = makeBindingParser(
        ctx.templateParseOptions?.enableSelectorless ?? false,
      );
      const compileResult = compileComponentFromMetadata(componentMeta, sharedPool, bindingParser);

      // 7. Generate factory (same as injectable)
      const factoryRes = compileFactoryFunction({
        name: className,
        type: {value: o.variable(className), type: o.variable(className)},
        typeArgumentCount: classMeta?.typeParameters?.length ?? 0,
        deps: deps,
        target: FactoryTarget.Component,
      });

      // 8. Insert static fields
      const compiledFac = compileFactoryField(factoryRes, printer, ctx);
      const compiledCmp = createStaticField(
        'ɵcmp',
        printer.print(compileResult.expression),
        printer.emitTypes ? printer.printType(compileResult.type) : null,
        true,
        ctx.isClosureCompilerEnabled,
      );
      s.appendLeft(span.end - 1, compiledFac + compiledCmp + classMeta.coercionMembers);
    }

    if (directive) {
      decoratorsToEmit.push({
        decoratorName: directive.decoratorName ?? 'Directive',
        argsSpan: directive.argsSpan ?? undefined,
      });
      factoryGenerated = true;
      const {selector, standalone, hostDirectives} = directive;
      const hostMetadata = directive.hostMetadata ?? [];
      const providers = directive.providersSpan
        ? sliceGuarded(s, directive.providersSpan, guards)
        : undefined;

      // Build R3DirectiveMetadata for directive
      // Use a valid source span when there are host bindings (required by Angular's binding parser)
      const hasHostBindings =
        hostMetadata.length > 0 || hostBindings.length > 0 || hostListeners.length > 0;
      const typeSourceSpan = hasHostBindings
        ? createDummySourceSpan(filePath)
        : createEmptySourceSpan();

      const directiveMeta: R3DirectiveMetadata = {
        name: className,
        type: {
          value: o.variable(className),
          type: o.variable(className),
        },
        typeArgumentCount: classMeta?.typeParameters?.length ?? 0,
        typeSourceSpan,
        selector: selector || null,
        deps: deps,
        queries: buildQueriesMap(queries, content),
        viewQueries: buildQueriesMap(viewQueries, content),
        host: buildHostMetadata(hostMetadata, hostBindings, hostListeners, className, {
          filePath,
          hostSpan: directive.hostSpan,
          hostProperties: directive.hostProperties,
          diagnostics: fileDiagnostics,
        }),
        lifecycle: {usesOnChanges: classMeta.usesOnChanges},
        inputs: buildInputsMap(inputs, content),
        outputs: buildOutputsMap(outputs),
        usesInheritance: classMeta.usesInheritance,
        controlCreate: null,
        exportAs: directive.exportAs || null,
        providers: providers ? new o.WrappedNodeExpr(new RawSource(providers)) : null,
        isStandalone: standalone,
        isSignal: directive.signals,
        hostDirectives: buildHostDirectives(hostDirectives),
        legacyOptionalChaining: ctx.legacyOptionalChaining,
      };

      // Compile directive
      const bindingParser = makeBindingParser(
        ctx.templateParseOptions?.enableSelectorless ?? false,
      );
      const compileResult = compileDirectiveFromMetadata(directiveMeta, sharedPool, bindingParser);

      // Generate factory
      const factoryRes = compileFactoryFunction({
        name: className,
        type: {value: o.variable(className), type: o.variable(className)},
        typeArgumentCount: classMeta?.typeParameters?.length ?? 0,
        deps: deps,
        target: FactoryTarget.Directive,
      });

      // Insert static fields
      const compiledFac = compileFactoryField(factoryRes, printer, ctx);
      const compiledDir = createStaticField(
        'ɵdir',
        printer.print(compileResult.expression),
        printer.emitTypes ? printer.printType(compileResult.type) : null,
        true,
        ctx.isClosureCompilerEnabled,
      );
      s.appendLeft(span.end - 1, compiledFac + compiledDir + classMeta.coercionMembers);
    }
    if (ngModule) {
      if (!ctx.emitDeclarationOnly) {
        decoratorsToEmit.push({
          decoratorName: ngModule.decoratorName ?? 'NgModule',
          argsSpan: ngModule.argsSpan ?? undefined,
        });
      }
      factoryGenerated = true;
      const {compiledFac, compiledMod, compiledInj, statements} = compileNgModuleDef(
        className,
        ngModule,
        deps,
        printer,
        ctx,
        classes,
        classMeta,
        content,
        filePath,
        fileDiagnostics,
      );

      s.appendLeft(span.end - 1, compiledFac + compiledMod + compiledInj);
      // The NgModule side-effect statements (`ɵɵsetNgModuleScope`, `ɵɵregisterNgModuleType`)
      // must be emitted AFTER `ɵsetClassMetadata`. The reference compiler unshifts the class
      // metadata statement to the front of these statements before emission.
      // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L1007-L1014
      ngModuleStatements = statements;
    }

    if (injectable) {
      decoratorsToEmit.push({
        decoratorName: injectable.decoratorName ?? 'Injectable',
        argsSpan: injectable.argsSpan ?? undefined,
      });
      // 1. Generate ɵfac (Factory) if not already generated by another decorator
      let compiledFactory = '';
      if (!factoryGenerated) {
        const factoryRes = compileFactoryFunction({
          name: className,
          type: {
            value: o.variable(className),
            type: o.variable(className),
          },
          typeArgumentCount: classMeta?.typeParameters?.length ?? 0,
          deps: deps,
          target: FactoryTarget.Injectable,
        });

        compiledFactory = compileFactoryField(factoryRes, printer, ctx);
      }

      const wrapProviderField = (field: nga.ProviderField) => ({
        expression: new o.WrappedNodeExpr(new RawSource(sliceGuarded(s, field.span, guards))),
        forwardRef: field.isForwardRef ? ForwardRefHandling.Unwrapped : ForwardRefHandling.None,
      });

      // 2. Generate ɵprov (InjectableDef)
      const parsedDeps =
        injectable.deps && (injectable.useClass || injectable.useFactory)
          ? mapDeps(injectable.deps, content, guards)
          : undefined;

      const injectableMeta: R3InjectableMetadata = {
        name: className,
        type: {
          value: o.variable(className),
          type: o.variable(className),
        },
        typeArgumentCount: classMeta?.typeParameters?.length ?? 0,
        providedIn: injectable.providedIn
          ? wrapProviderField(injectable.providedIn)
          : {
              expression: o.literal(null),
              forwardRef: ForwardRefHandling.None,
            },
        deps: parsedDeps,
      };

      // Angular's `@Injectable` decorator evaluates arguments with a strict precedence order.
      // We mirror the `ngtsc` else-if chain here so `compileInjectable` picks the correct one.
      // See: https://github.com/angular/angular/blob/dea3241be626c3779df1b1f3f120024114631b79/packages/compiler-cli/src/ngtsc/annotations/src/injectable.ts#L328-L338
      if (injectable.useValue) {
        injectableMeta.useValue = wrapProviderField(injectable.useValue);
      } else if (injectable.useExisting) {
        injectableMeta.useExisting = wrapProviderField(injectable.useExisting);
      } else if (injectable.useClass) {
        injectableMeta.useClass = wrapProviderField(injectable.useClass);
      } else if (injectable.useFactory) {
        injectableMeta.useFactory = new o.WrappedNodeExpr(
          new RawSource(sliceGuarded(s, injectable.useFactory.span, guards)),
        );
      }

      const def = compileInjectable(injectableMeta, false);
      const compiledProv = createStaticField(
        'ɵprov',
        printer.print(def.expression),
        printer.emitTypes ? printer.printType(def.type) : null,
        true,
        ctx.isClosureCompilerEnabled,
      );

      // Insert at classEnd - 1 (before the closing brace)
      s.appendLeft(span.end - 1, compiledFactory + compiledProv);
    }

    if (service) {
      decoratorsToEmit.push({
        decoratorName: service.decoratorName ?? 'Service',
        argsSpan: service.argsSpan ?? undefined,
      });

      let compiledFactory = '';

      const factoryRes = compileFactoryFunction({
        name: className,
        type: {
          value: o.variable(className),
          type: o.variable(className),
        },
        typeArgumentCount: classMeta?.typeParameters?.length ?? 0,
        deps: [], // Intentional since services don't allow constructor DI.
        target: FactoryTarget.Service,
      });

      compiledFactory = compileFactoryField(factoryRes, printer, ctx);

      const serviceMeta: R3ServiceMetadata = {
        name: className,
        type: {
          value: o.variable(className),
          type: o.variable(className),
        },
        typeArgumentCount: classMeta?.typeParameters?.length ?? 0,
        autoProvided: service.autoProvided,
        factory: service.factory
          ? new o.WrappedNodeExpr(new RawSource(sliceGuarded(s, service.factory.span, guards)))
          : undefined,
      };

      const def = compileService(serviceMeta, false);
      const compiledProv = createStaticField(
        'ɵprov',
        printer.print(def.expression),
        printer.emitTypes ? printer.printType(def.type) : null,
        true,
        ctx.isClosureCompilerEnabled,
      );
      s.appendLeft(span.end - 1, compiledFactory + compiledProv);
    }

    if (decoratorsToEmit.length > 0 && ctx.supportTestBed !== false) {
      const metadata = generateSetClassMetadata(
        className,
        decoratorsToEmit,
        classMeta,
        printer,
        s,
        perComponentDeferredDeps,
        ctx.complianceMode ?? false,
      );
      if (ctx.complianceMode) {
        s.appendRight(span.end, '\n' + metadata);
      } else {
        s.appendLeft(span.end - 1, metadata);
      }
    }

    if (component) {
      const debugInfoCall = generateSetClassDebugInfo(
        className,
        getProjectRelativePath(filePath, ctx.rootDir),
        content,
        classMeta.nameSpan?.start ?? span.start,
        ctx.forbidOrphanComponents ?? false,
        printer,
      );
      s.appendRight(span.end, '\n' + debugInfoCall);
    }

    // Emit NgModule side-effect statements after `ɵsetClassMetadata` to match the reference order.
    if (ngModuleStatements) {
      s.appendRight(span.end, '\n' + ngModuleStatements + '\n');
    }
  }

  for (const local of eagerDependencyNames) {
    eagerlyBoundNames.add(local);
    deferredOnlyNames.delete(local);
  }

  reportEagerlyImportedDeferredDependencies(
    fileDiagnostics,
    filePath,
    importDeclarations,
    classes,
    deferredOnlyNames,
    eagerlyBoundNames,
  );
  const removedDecls = removeDeferredImports(
    s,
    content,
    importDeclarations,
    deferredOnlyNames,
    eagerlyBoundNames,
  );

  // Hoist any `import` declarations written after a non-import statement to `importsEnd` so that
  // downstream CommonJS / Closure downleveling never emits a lexical `const ... = require(...)`
  // below a top-level statement that references it.
  const hoistedImports: string[] = [];
  if (!filePath.endsWith('.d.ts')) {
    for (const decl of importDeclarations) {
      if (decl.span.start > importsEnd && !removedDecls.has(decl)) {
        hoistedImports.push(s.slice(decl.span.start, decl.span.end));
        s.remove(decl.removalSpan.start, decl.removalSpan.end);
      }
    }
  }

  const poolStatements =
    sharedPool.statements.length > 0
      ? '\n' + sharedPool.statements.map((stmt) => printer.printStatement(stmt)).join('\n') + '\n'
      : '';

  const topOfFileStatements = [...hoistedImports, printer.getImportStatements(), poolStatements]
    .filter(Boolean)
    .join('\n');
  if (topOfFileStatements) {
    const prefix = importsEnd === 0 || content[importsEnd - 1] === '\n' ? '' : '\n';
    s.appendRight(importsEnd, prefix + topOfFileStatements + '\n');
  }

  const tcbTargets =
    ctx.optimize && !ctx.emitDeclarationOnly
      ? buildTcbTargets(
          filePath,
          content,
          classes,
          templatesByClass,
          ctx.templateParseOptions,
          ctx.tcbConfig,
        )
      : [];
  const prepared =
    ctx.optimize && tcbTargets.length > 0
      ? prepareTcbTargets(
          filePath,
          tcbTargets,
          content,
          ctx.tcbConfig,
          classes,
          ctx.workspaceName,
          ctx.rootDirs,
        )
      : null;
  const tcb = prepared
    ? (generateTcbCode(filePath, prepared, ctx.tcbConfig) ?? undefined)
    : undefined;

  const returnTcb = tcb
    ? {...tcb, code: combineTcbContent(tcb, filePath, {sourceContent: content, classes})}
    : undefined;
  if (returnTcb) {
    const analysis = getOrCreateFileAnalysis(ctx.fileCache, filePath);
    analysis.tcb = returnTcb.code;
    if (prepared) {
      analysis.preparedTcbData = prepared;
    }
  }

  if (tcb?.diagnostics && tcb.diagnostics.length > 0) {
    for (const diag of tcb.diagnostics) {
      let component: nga.ComponentMetadata | undefined;
      if (prepared?.typeCheckIdMap) {
        for (const [classKey, id] of prepared.typeCheckIdMap.entries()) {
          if (id === diag.typeCheckId) {
            const cls = classes.find((c) => makeClassKey(c.className, c.span.start) === classKey);
            component = cls?.component ?? undefined;
            break;
          }
        }
      }

      const span = {start: diag.start, end: diag.end};
      fileDiagnostics.push({
        category: diag.category === OutOfBandDiagnosticCategory.Warning ? 0 : 1,
        code: diag.code ?? 8000,
        messageText: diag.message,
        ...(component ? templateDiagnosticLocation(component, filePath, span) : {filePath, span}),
      });
    }
  }

  return {
    magicString: s,
    tcb: returnTcb,
    diagnostics: fileDiagnostics,
  };
}

interface DecoratorMetadata {
  decoratorName: string;
  argsSpan?: nga.SpanMetadata;
  preservedDecoratorProperties?: nga.SpanMetadata[];
  resourceOverride?: {
    inlineStyles: string[];
    inlineTemplate: string | null;
    stripStyleFields: boolean;
  };
}

/**
 * Rebuild a `@Component({...})` decorator's argument object with external resources inlined, so
 * `ɵsetClassMetadata` records the loaded `template`/`styles` rather than
 * `templateUrl`/`styleUrls`/`styleUrl`/`styles`. Mirrors the reference's `transformDecoratorResources`:
 * https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/component/src/resources.ts#L587
 *
 * Non-resource properties are sliced verbatim from the original source (via spans recorded in Rust,
 * avoiding a TS re-parse); the regenerated `template` then `styles` are appended at the end — matching
 * the reference's `Map.delete`/`Map.set` field ordering.
 */
function inlineDecoratorResources(
  preservedProperties: nga.SpanMetadata[],
  override: NonNullable<DecoratorMetadata['resourceOverride']>,
  s: MagicString,
  guards: nga.SpanMetadata[],
): string {
  const props = preservedProperties.map((span) => sliceGuarded(s, span, guards));
  if (override.inlineTemplate !== null) {
    props.push(`template: ${JSON.stringify(override.inlineTemplate)}`);
  }
  if (override.stripStyleFields) {
    const styles = override.inlineStyles.filter((style) => style.trim().length > 0);
    if (styles.length > 0) {
      props.push(`styles: [${styles.map((style) => JSON.stringify(style)).join(', ')}]`);
    }
  }
  return `{\n  ${props.join(',\n  ')}\n}`;
}

/** Mirrors `FORWARD_REFERENCE_GUARD` in `ng-analyze/src/analyzer/mod.rs`. */
const FORWARD_REFERENCE_GUARD = '// @ts-ignore\n';

/**
 * Give each signal-creating call the analyzer found its implicit `debugName`.
 */
function insertSignalDebugNames(
  s: MagicString,
  insertions: nga.SignalDebugNameMetadata[],
  emitTypes: boolean,
): void {
  // Note: we diverge from ngtsc with the `as []` as opposed to adding a `@ts-ignore`.
  for (const insertion of insertions) {
    const debugName = `{ debugName: ${JSON.stringify(insertion.debugName)} }`;
    const separator = insertion.needsSeparator ? ', ' : '';
    if (insertion.intoOptions) {
      s.appendLeft(
        insertion.position,
        `...(ngDevMode ? ${debugName} : /* istanbul ignore next */ {})${separator}`,
      );
      continue;
    }
    const devArgs = insertion.prependUndefined ? `undefined, ${debugName}` : debugName;
    const spread = `...(ngDevMode ? [${devArgs}] : /* istanbul ignore next */ [])`;
    s.appendLeft(
      insertion.position,
      emitTypes ? `${separator}${spread} as []` : `${separator}/* @ts-ignore */ ${spread}`,
    );
  }
}

/**
 * Slice `span` from the original source, with a `// @ts-ignore` line right before each identifier
 * in `guards` (`ClassMetadata.laterDeclarationReferences`) that falls inside it.
 */
function sliceGuarded(
  s: MagicString | string,
  span: nga.SpanMetadata,
  guards: nga.SpanMetadata[],
): string {
  const source = typeof s === 'string' ? s : s.original;
  const inside = [
    ...new Set(
      guards.map((guard) => guard.start).filter((start) => start >= span.start && start < span.end),
    ),
  ].sort((a, b) => a - b);
  let result = '';
  let cursor = span.start;
  for (const start of inside) {
    result += source.slice(cursor, start) + FORWARD_REFERENCE_GUARD;
    cursor = start;
  }
  return result + source.slice(cursor, span.end);
}

/**
 * Build the `{ type: <Identifier>, args: [...] }` metadata object for a single decorator, slicing
 * the decorator's argument list verbatim from the original source (mirroring ngtsc, which re-emits
 * the original argument nodes), or using pre-rendered argsString when generic type arguments are stripped.
 * https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/metadata.ts#L196-L220
 */
function buildDecoratorMetadataExpr(
  name: string,
  argsSpan: nga.SpanMetadata | undefined,
  argsString: string | undefined,
  s: MagicString,
  guards: nga.SpanMetadata[],
): o.Expression {
  const props: {key: string; value: o.Expression; quoted: boolean}[] = [
    {key: 'type', value: o.variable(name), quoted: false},
  ];
  const argsStr = argsString ?? (argsSpan != null ? sliceGuarded(s, argsSpan, guards) : null);
  if (argsStr != null) {
    // Wrap the raw multi-argument string (e.g. `'alias', { transform }`) inside a single RawSource
    // element. When printed inside literalArr, this directly emits a valid multi-element JS array.
    props.push({
      key: 'args',
      value: o.literalArr([new o.WrappedNodeExpr(new RawSource(argsStr))]),
      quoted: false,
    });
  }
  return o.literalMap(props);
}

/**
 * Build the structured constructor-parameter metadata (3rd `ɵsetClassMetadata` argument), or
 * `null` when the class has no constructor. `@angular/compiler` turns this into the `() => [...]`
 * arrow function, emitting `type: undefined` for a `null` type and omitting the `decorators` key
 * for a `null` decorator list.
 * https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/metadata.ts#L81-L89
 */
function buildCtorParametersExpr(
  constructorParams: nga.ConstructorParamMetadata[] | undefined,
  s: MagicString,
): R3ClassMetadataCtorParameter[] | null {
  if (constructorParams == null) {
    return null;
  }
  return constructorParams.map((param) => {
    const typeName = param.isTypeOnly ? undefined : param.typeName;
    let decorators: o.Expression | null = null;
    if (param.decorators.length > 0) {
      const ngDecorators = param.decorators
        .filter((d) => d.isAngular)
        .map((d) => buildDecoratorMetadataExpr(d.name, d.argsSpan, d.argsString, s, []));
      decorators = o.literalArr(ngDecorators);
    }
    return {
      type: typeName == null ? null : o.variable(typeName),
      decorators,
      // Ask the compiler for a `@ts-ignore` only when the analyzer emitted a reference it could
      // not resolve to a value declaration. Those are the references that make `tsc` fail on the
      // emitted metadata (TS2339/TS2693/TS2708) even though they are fine at runtime.
      suppressTypeErrors: typeName != null && !param.isValueVerified,
    };
  });
}

/**
 * Construct the property-decorator map (4th `ɵsetClassMetadata` argument), or `null` when no member
 * carries a decorator. Members with only non-Angular decorators still appear with an empty array.
 * https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/metadata.ts#L91-L147
 */
function buildPropDecoratorsExpr(
  classMeta: nga.ClassMetadata,
  s: MagicString,
  className: string,
  guards: nga.SpanMetadata[],
): o.Expression | null {
  const {memberDecorators, inputs, outputs, queries, viewQueries} = classMeta;
  const propMap = new Map<string, {key: string; quoted: boolean; decorators: o.Expression[]}>();

  function getOrCreateEntry(key: string, quoted: boolean) {
    let entry = propMap.get(key);
    if (!entry) {
      entry = {key, quoted, decorators: []};
      propMap.set(key, entry);
    }
    return entry;
  }

  // 1. Decorator-based members from AST
  const seenMemberNames =
    memberDecorators && memberDecorators.length > 1 ? new Set<string>() : null;
  const duplicateNames: string[] = [];
  if (memberDecorators) {
    for (const member of memberDecorators) {
      if (seenMemberNames !== null) {
        if (seenMemberNames.has(member.propertyName)) {
          duplicateNames.push(member.propertyName);
          continue;
        }
        seenMemberNames.add(member.propertyName);
      }
      const entry = getOrCreateEntry(member.propertyName, member.isStringLiteral);
      const ngDecorators = member.decorators
        .filter((d) => d.isAngular)
        .map((d) => buildDecoratorMetadataExpr(d.name, d.argsSpan, d.argsString, s, guards));
      entry.decorators.push(...ngDecorators);
    }
  }

  if (duplicateNames.length > 0) {
    // This should theoretically never happen, because the only way to have duplicate instance
    // member names is getter/setter pairs and decorators cannot appear in both a getter and the
    // corresponding setter.
    // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/metadata.ts#L133-L143
    throw new Error(
      `Duplicate decorated properties found on class '${className}': ` + duplicateNames.join(', '),
    );
  }

  // 2. Signal inputs (including model() inputs)
  for (const input of inputs) {
    if (!input.isSignal) continue;
    const entry = getOrCreateEntry(input.name, input.isLiteral);
    const inputOptionsProps: {key: string; value: o.Expression; quoted: boolean}[] = [
      {key: 'isSignal', value: o.literal(true), quoted: false},
      {key: 'alias', value: o.literal(input.alias ?? input.name), quoted: false},
      {key: 'required', value: o.literal(input.required), quoted: false},
    ];
    entry.decorators.push(
      o.literalMap([
        {key: 'type', value: new o.ExternalExpr(R3Identifiers.inputDecorator), quoted: false},
        {key: 'args', value: o.literalArr([o.literalMap(inputOptionsProps)]), quoted: false},
      ]),
    );
  }

  // 3. Signal outputs and model() outputs
  for (const output of outputs) {
    if (!output.isSignal) continue;
    const entry = getOrCreateEntry(output.name, false);
    entry.decorators.push(
      o.literalMap([
        {key: 'type', value: new o.ExternalExpr(R3Identifiers.outputDecorator), quoted: false},
        {key: 'args', value: o.literalArr([o.literal(output.alias ?? output.name)]), quoted: false},
      ]),
    );
  }

  // 4. Signal queries and view queries
  const allSignalQueries = [...(queries ?? []), ...(viewQueries ?? [])].filter((q) => q.isSignal);
  for (const query of allSignalQueries) {
    const entry = getOrCreateEntry(query.propertyName, false);
    const queryIdentifier = query.isView
      ? query.first
        ? R3Identifiers.viewChildDecorator
        : R3Identifiers.viewChildrenDecorator
      : query.first
        ? R3Identifiers.contentChildDecorator
        : R3Identifiers.contentChildrenDecorator;

    const predicateStr = s.original.slice(query.predicateSpan.start, query.predicateSpan.end);
    let predicateExpr: o.Expression = new o.WrappedNodeExpr(new RawSource(predicateStr));
    // `memberMetadataFromSignalQuery`: a locator that is not string-literal-like (the only case
    // in which a signal query has no selectors) is wrapped in `forwardRef`.
    if (!query.predicateSelectors) {
      predicateExpr = new o.ExternalExpr(R3Identifiers.forwardRef).callFn([
        new o.ArrowFunctionExpr([], predicateExpr),
      ]);
    }

    const queryOptionsProps: {key: string; value: o.Expression; quoted: boolean}[] = [
      {key: 'isSignal', value: o.literal(true), quoted: false},
    ];
    if (query.readSpan) {
      // TODO: `laterDeclarationReferences` only covers decorator arguments, so a `read` that names
      // a later declaration is not guarded and fails `tsc` inside the static block.
      const readStr = s.original.slice(query.readSpan.start, query.readSpan.end);
      queryOptionsProps.push({
        key: 'read',
        value: new o.WrappedNodeExpr(new RawSource(readStr)),
        quoted: false,
      });
    }
    if (!query.isView && query.descendants) {
      queryOptionsProps.push({
        key: 'descendants',
        value: o.literal(true),
        quoted: false,
      });
    }

    entry.decorators.push(
      o.literalMap([
        {key: 'type', value: new o.ExternalExpr(queryIdentifier), quoted: false},
        {
          key: 'args',
          value: o.literalArr([predicateExpr, o.literalMap(queryOptionsProps)]),
          quoted: false,
        },
      ]),
    );
  }

  if (propMap.size === 0) {
    return null;
  }

  const entries: {key: string; quoted: boolean; value: o.Expression}[] = [];
  for (const [, entry] of propMap) {
    entries.push({
      key: entry.key,
      quoted: entry.quoted,
      value: o.literalArr(entry.decorators),
    });
  }

  return o.literalMap(entries);
}

function generateSetClassMetadata(
  className: string,
  decorators: DecoratorMetadata[],
  classMeta: nga.ClassMetadata,
  printer: ExpressionPrinter,
  s: MagicString,
  deferredDeps: R3DeferPerComponentDependency[] = [],
  complianceMode: boolean = false,
): string {
  const guards = complianceMode ? [] : classMeta.laterDeclarationReferences;
  const decoratorObjs = decorators.map(
    ({decoratorName, argsSpan, preservedDecoratorProperties, resourceOverride}) => {
      const props: {key: string; value: o.Expression; quoted: boolean}[] = [
        {key: 'type', value: o.variable(decoratorName), quoted: false},
      ];

      if (argsSpan != null) {
        let argsStr =
          resourceOverride && preservedDecoratorProperties
            ? inlineDecoratorResources(preservedDecoratorProperties, resourceOverride, s, guards)
            : sliceGuarded(s, argsSpan, guards);
        if (complianceMode) {
          // Match Angular compliance test formatting for single-line decorator object literals.
          argsStr = argsStr
            .replace(/^(\s*)\{([^\s])/, '$1{ $2')
            .replace(/([^\s])\}(\s*)$/, '$1 }$2');
        }
        props.push({
          key: 'args',
          value: o.literalArr([new o.WrappedNodeExpr(new RawSource(argsStr))]),
          quoted: false,
        });
      }

      return o.literalMap(props);
    },
  );

  const classMetadata = {
    type: o.variable(className),
    decorators: o.literalArr(decoratorObjs),
    ctorParameters: buildCtorParametersExpr(classMeta.constructorParams, s),
    propDecorators: buildPropDecoratorsExpr(classMeta, s, className, guards),
  };
  const metadataExpr = compileComponentClassMetadata(classMetadata, deferredDeps);
  if (complianceMode) {
    return printer.printStatement(metadataExpr.toStmt());
  }
  const stmts = stripIife(metadataExpr);
  const printedStmt = stmts.map((stmt) => printer.printStatement(stmt)).join('\n');
  return createStaticBlock(printedStmt);
}

function createStaticBlock(statement: string): string {
  const indented = statement
    .split('\n')
    .map((line) => (line.length > 0 ? `    ${line}` : line))
    .join('\n');
  return `  static {\n${indented}\n  }\n`;
}

/**
 * https://github.com/angular/angular/blob/c1829f6/packages/compiler-cli/src/ngtsc/util/src/path.ts#L29-L48
 */
function getProjectRelativePath(filePath: string, rootDir: string | undefined): string | null {
  if (!rootDir) {
    return null;
  }
  const rel = path.posix.relative(rootDir, filePath);
  return rel.startsWith('..') ? null : rel;
}

/**
 * https://github.com/angular/angular/blob/c1829f6/packages/compiler-cli/src/ngtsc/annotations/common/src/debug_info.ts#L15-L36
 * https://github.com/angular/angular/blob/c1829f6/packages/compiler/src/render3/r3_class_debug_info_compiler.ts#L56-L82
 */
function generateSetClassDebugInfo(
  className: string,
  relativeFilePath: string | null,
  content: string,
  nameOffset: number,
  forbidOrphanRendering: boolean,
  printer: ExpressionPrinter,
): string {
  const debugInfo: R3ClassDebugInfo = {
    type: o.variable(className),
    className: o.literal(className),
    filePath: relativeFilePath !== null ? o.literal(relativeFilePath) : null,
    // 1-based line number of the class name, matching ngtsc's
    // `srcFile.getLineAndCharacterOfPosition(clazz.name.pos).line + 1`.
    lineNumber: o.literal(relativeFilePath !== null ? lineNumberAtOffset(content, nameOffset) : 0),
    forbidOrphanRendering,
  };
  const debugInfoExpr = compileClassDebugInfo(debugInfo);
  return printer.printStatement(debugInfoExpr.toStmt());
}

/**
 * The identifier a reference resolves to in the file being emitted: the binding this file
 * already has, else the name its module exports it under (which a generated namespace import
 * will dereference).
 */
function refName(ref: nga.ReferenceMetadata): string {
  const name = ref.localAlias ?? ref.consumerImport?.symbol ?? ref.typecheckImport?.symbol;
  if (name === undefined) {
    // The analyzer guarantees one or the other: a symbol with no import path is declared
    // here and therefore bound here. Emitting a guess would produce a dangling identifier.
    throw new Error('ReferenceMetadata has neither a local binding nor an import path');
  }
  return name;
}

/**
 * How a deferrable dependency is named and reached, taken from the `import` declaration the
 * consuming file already has for it rather than from the declaration that import resolves to.
 *
 * That distinction is the whole point. ngtsc fills these three fields from
 * `getImportOfIdentifier` on the identifier written in `@Component.imports`, which reads the
 * consumer's own `ImportDeclaration`:
 *
 *     deferBlockDep.symbolName = importInfo.name;
 *     deferBlockDep.importPath = importInfo.from;
 *     deferBlockDep.isDefaultImport = isDefaultImport(importInfo.node);
 *
 * The two disagree whenever a module re-exports a class under another name — `import {NgFor}
 * from '@angular/common'` resolves to a class declared as `NgForOf`, and under
 * `PrefixImportStrategy` it resolves to the declaring `ng_for_of.d.ts` rather than the barrel.
 * Naming the dependency after the declaration would emit `(NgForOf: any) => …` as the
 * `ɵsetClassMetadataAsync` callback parameter, while the `@Component` metadata preserved inside
 * that callback still reads `imports: [NgFor]` — whose `import` declaration this compiler has
 * just deleted, leaving an unbound identifier (TS2552).
 *
 * The name is the *exported* name of the specifier (`{Cmp as Alias}` -> `Cmp`), since that is the
 * property the awaited module object carries, and it is also what ngtsc's `getExportedName`
 * returns. A default import has no specifier to read a name off, so it falls back to the local
 * identifier: the analyzer reports its exported name as the literal `default`, which must not
 * reach the emitter — the name doubles as the callback parameter, where `default` is a reserved
 * word and produces unparseable output. `isDefaultImport` is what redirects the module access to
 * `m.default`.
 *
 * Returns `null` for a reference this file has no `import` declaration for, and for one bound by
 * a namespace import, which names no export at all — `m.<name>` needs one. That is also every
 * reference `isRefDeferrable` rejects, since it looks the binding up in the same map, so a caller
 * that gates on it cannot reach a `null` it would then have to explain. Callers must keep the two
 * decisions together regardless: a dependency with no dynamic import to load it is one whose
 * static import has to survive.
 *
 * TODO(parity): ngtsc can defer a namespace-imported dependency —
 * `getImportOfIdentifier` resolves `ns.Cmp` through `getImportOfNamespacedIdentifier` and reports
 * the exported name `Cmp`. Reaching that here needs the analyzer to report the namespace root and
 * the member separately; it currently reports the reference's local alias as the dotted source
 * text (`ns.Cmp`), which matches no import binding, so such a dependency stays eager.
 */
function deferredImportOf(
  ref: nga.ReferenceMetadata,
  importsByBinding: ReadonlyMap<string, nga.ImportDeclarationMetadata>,
): R3DeferPerComponentDependency | null {
  const local = ref.localAlias;
  if (local === undefined) {
    return null;
  }
  const decl = importsByBinding.get(local);
  const binding = decl?.bindings.find((b) => b.local === local);
  if (decl === undefined || binding === undefined || binding.imported === undefined) {
    return null;
  }
  const isDefaultImport = binding.imported === 'default';
  return {
    symbolName: isDefaultImport ? local : binding.imported,
    importPath: decl.specifier,
    isDefaultImport,
  };
}

/**
 * Identity of a deferrable dependency, for collapsing the repeats that arise when one symbol is
 * used by several `@defer` blocks of the same component.
 *
 * The module has to be part of it. Two modules may each export a symbol of the same name, and the
 * importing file can only name both by aliasing at least one — but the alias is local, so both
 * reach this point calling themselves by the same *exported* name. Keyed on that name alone they
 * collapse, and the second module never gets a loader, which leaves its component unresolvable
 * once the `@defer` block triggers.
 *
 * This is not the key the reference's `uniqueDeps` map uses, and it does not need to be: that map
 * belongs to `compileComponentClassMetadata`, which applies it downstream of this list on the way
 * into `ɵsetClassMetadataAsync`. The defer resolver function is compiled from the same list with
 * no de-duplication at all, so anything dropped here is dropped from the runtime loader too.
 * https://github.com/angular/angular/blob/main/packages/compiler/src/render3/view/compiler.ts#L780-L798
 */
function deferredDepKey(importPath: string, symbolName: string): string {
  // A tuple rather than a delimited string: a module specifier may contain any character.
  return JSON.stringify([importPath, symbolName]);
}

function refToExpression(ref: nga.ReferenceMetadata): o.Expression {
  // A binding in this file wins: reusing it avoids a redundant import, and for a `forwardRef`
  // cycle it is the only form that works.
  if (ref.localAlias) {
    return o.variable(ref.localAlias);
  }
  if (ref.consumerImport) {
    return new o.ExternalExpr({
      moduleName: ref.consumerImport.specifier,
      name: ref.consumerImport.symbol,
    } as any);
  }
  return o.variable(refName(ref));
}
function compileNgModuleDef(
  className: string,
  ngModule: nga.NgModuleMetadata,
  deps: any,
  printer: ExpressionPrinter,
  ctx: HybridCompilerContext,
  classes: nga.ClassMetadata[] = [],
  classMeta?: nga.ClassMetadata,
  content?: string,
  filePath?: string,
  diagnostics?: nga.NgDiagnostic[],
): {compiledFac: string; compiledMod: string; compiledInj: string; statements: string} {
  const {optimize, isClosureCompilerEnabled, emitDeclarationOnly} = ctx;
  const {declarations, imports, injectorImports, exports, bootstrap} = ngModule;

  const mapToVarArr = (names: nga.ReferenceMetadata[] | undefined) =>
    names ? o.literalArr(names.map((d) => refToExpression(d))) : null;

  const mapToRefs = (names: nga.ReferenceMetadata[] | undefined) =>
    names
      ? names.map((ref) => ({
          value: refToExpression(ref),
          type: refToExpression(ref),
        }))
      : [];

  // LOCAL compilation mode emits NgModule imports/exports/declarations/bootstrap VERBATIM,
  // as `WrappedNodeExpr` of the raw AST node — no resolution/filtering/flattening — matching
  // ngtsc (ɵɵsetNgModuleScope metadata: handler.ts#L566-L603; ɵinj.imports: handler.ts#L670-L688).
  // https://github.com/angular/angular/blob/e3ac727dfc/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L566-L603
  // We reproduce "the raw node" by slicing the original source text at the captured span.
  const guards = ctx.complianceMode ? [] : (classMeta?.laterDeclarationReferences ?? []);
  const rawExprFromSpan = (span: nga.SpanMetadata | undefined | null): o.Expression | null =>
    span && content !== undefined
      ? new o.WrappedNodeExpr(new RawSource(sliceGuarded(content, span, guards)))
      : null;

  const rawExprsFromSpans = (
    spans: nga.SpanMetadata[] | undefined | null,
  ): o.Expression[] | null =>
    spans && content !== undefined
      ? spans.map(
          (span) => new o.WrappedNodeExpr(new RawSource(sliceGuarded(content, span, guards))),
        )
      : null;

  const buildIsolatedTypeTupleExpr = (
    tuple: nga.IsolatedTypeTupleMetadata | undefined | null,
  ): o.Expression | null => {
    if (!tuple) {
      return null;
    }
    const elementExprs = tuple.elements.map((el): o.Expression => {
      switch (el.kind) {
        case 'typeof': {
          if (el.references && el.references.length > 0) {
            return new o.TypeofExpr(refToExpression(el.references[0]));
          }
          if (el.span && content !== undefined) {
            return new o.TypeofExpr(
              new o.WrappedNodeExpr(new RawSource(content.substring(el.span.start, el.span.end))),
            );
          }
          return new o.WrappedNodeExpr(new RawSource('never'));
        }
        case 'callReturnType': {
          const calleeText =
            el.span && content !== undefined
              ? content.substring(el.span.start, el.span.end)
              : 'never';
          return new o.WrappedNodeExpr(new RawSource(`ReturnType<typeof ${calleeText}>`));
        }
        case 'referenceTuple': {
          return o.literalArr(
            (el.references ?? []).map((ref) => new o.TypeofExpr(refToExpression(ref))),
          );
        }
        case 'never':
        default: {
          if (diagnostics && filePath) {
            diagnostics.push({
              category: 1,
              code: 11003,
              messageText: `In experimental declaration-only emission mode, this expression is not supported in NgModule imports/exports as it cannot be referenced with 'typeof'. Use a direct reference or a supported call.`,
              filePath,
              span: el.span ? {start: el.span.start, end: el.span.end} : undefined,
            });
          }
          return new o.WrappedNodeExpr(new RawSource('never'));
        }
      }
    });
    return tuple.isArrayLiteral ? o.literalArr(elementExprs) : (elementExprs[0] ?? null);
  };

  // Generate ɵfac (Factory) for NgModule
  const factoryRes = compileFactoryFunction({
    name: className,
    type: {
      value: o.variable(className),
      type: o.variable(className),
    },
    typeArgumentCount: classMeta?.typeParameters?.length ?? 0,
    deps: deps,
    target: FactoryTarget.NgModule,
  });

  const compiledFac = compileFactoryField(factoryRes, printer, ctx);

  // https://github.com/angular/angular/blob/4c9afb6/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L554
  const sharedMeta = {
    type: {
      value: o.variable(className),
      type: o.variable(className),
    },
    schemas: [],
    id: rawExprFromSpan(ngModule.idSpan),
  };

  // Detect if any dependencies are forward references.
  // https://github.com/angular/angular/blob/4c9afb6/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L546
  let containsForwardDecls = false;
  if (optimize && !emitDeclarationOnly && classMeta) {
    const allRefs = [
      ...(declarations || []),
      ...(imports || []),
      ...(exports || []),
      ...(bootstrap || []),
    ];
    for (const ref of allRefs) {
      const localClass = classes.find((c) => c.className === refName(ref));
      if (localClass && localClass.span.start > classMeta.span.start) {
        containsForwardDecls = true;
        break;
      }
    }
  }

  const hasWireImports = Array.isArray(imports);
  const hasWireExports = Array.isArray(exports);
  const hasWireDeclarations = Array.isArray(declarations);
  const hasWireBootstrap = Array.isArray(bootstrap);
  const ngModuleMeta: R3NgModuleMetadata = emitDeclarationOnly
    ? {
        ...sharedMeta,
        kind: R3NgModuleMetadataKind.Isolated,
        selectorScopeMode: R3SelectorScopeMode.Omit,
        importsExpression: ctx.onlyPublishPublicTypingsForNgModules
          ? null
          : buildIsolatedTypeTupleExpr(ngModule.isolatedImports),
        exportsExpression: buildIsolatedTypeTupleExpr(ngModule.isolatedExports),
      }
    : optimize &&
        (hasWireImports || !ngModule.importsSpan) &&
        (hasWireExports || !ngModule.exportsSpan) &&
        (hasWireDeclarations || !ngModule.declarationsSpan) &&
        (hasWireBootstrap || !ngModule.bootstrapSpan)
      ? {
          ...sharedMeta,
          kind: R3NgModuleMetadataKind.Global,
          // In JIT/linker mode scope information is emitted inline into `ɵɵdefineNgModule()`.
          selectorScopeMode: ctx.templateParseOptions?.linkerJitMode
            ? R3SelectorScopeMode.Inline
            : R3SelectorScopeMode.SideEffect,
          bootstrap: mapToRefs(bootstrap),
          declarations: mapToRefs(declarations),
          imports: mapToRefs(imports),
          exports: mapToRefs(exports),
          containsForwardDecls,
          // `onlyPublishPublicTypingsForNgModules` narrows the `ɵmod` type — which becomes the
          // `.d.ts` type once `tsc` compiles this output — to the declarations the module exports,
          // and drops its imports, which are generally private.
          // https://github.com/angular/angular/blob/b3b9f39/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L583-L592
          includeImportTypes: !ctx.onlyPublishPublicTypingsForNgModules,
          publicDeclarationTypes: ctx.onlyPublishPublicTypingsForNgModules
            ? (ngModule.publicDeclarations ?? []).map((ref) => refToExpression(ref))
            : null,
        }
      : {
          ...sharedMeta,
          kind: R3NgModuleMetadataKind.Local,
          selectorScopeMode: R3SelectorScopeMode.SideEffect,
          // Verbatim raw expressions (ngtsc local mode). Fall back to reconstructing from
          // resolved references only when the raw span/source is unavailable (e.g. .d.ts).
          bootstrapExpression: rawExprFromSpan(ngModule.bootstrapSpan) ?? mapToVarArr(bootstrap),
          declarationsExpression:
            rawExprFromSpan(ngModule.declarationsSpan) ?? mapToVarArr(declarations),
          importsExpression: rawExprFromSpan(ngModule.importsSpan) ?? mapToVarArr(imports),
          exportsExpression: rawExprFromSpan(ngModule.exportsSpan) ?? mapToVarArr(exports),
        };

  const compileResult = compileNgModule(ngModuleMeta);
  const compiledMod = createStaticField(
    'ɵmod',
    printer.print(compileResult.expression),
    printer.emitTypes ? printer.printType(compileResult.type) : null,
    true,
    isClosureCompilerEnabled,
  );

  let statements = '';
  const allStatements = [...(compileResult.statements || [])];

  if (optimize && !emitDeclarationOnly && classMeta) {
    interface ScopeTarget {
      component: nga.ReferenceMetadata;
      directiveRefs: nga.ReferenceMetadata[];
      pipeRefs: nga.ReferenceMetadata[];
    }
    const scopeTargets: ScopeTarget[] = [];

    // Find all components in the metadataMap that declare this NgModule and are remotely scoped
    const metadataMap = ctx.metadataMap || new Map();
    for (const [cachedPath, fileMeta] of metadataMap.entries()) {
      for (const otherClass of fileMeta.classes) {
        if (!otherClass.className) continue;
        const comp = otherClass.component;
        if (
          comp &&
          ctx.remoteScopedClasses?.has(`${cachedPath}#${otherClass.className}`) &&
          comp.declaringNgModule &&
          comp.declaringNgModule.symbolId === classMeta.symbolId &&
          comp.declaringNgModule.filePath === filePath
        ) {
          const compClassName = otherClass.className;
          const ngModuleDecls = ngModule.declarations || [];

          // The component itself is one of this module's declarations, so it is already in
          // this file's frame.
          const compDecl = ngModuleDecls.find((d) => refName(d) === compClassName);
          if (!compDecl) continue;

          // Every reference below is emitted into *this* file, not the component's, so it must
          // use the projection the analyzer made for the declaring NgModule.
          const eager: nga.DeclarationMetadata[] =
            ctx.eagerlyUsedDeclarations?.get(`${cachedPath}#${compClassName}`) ?? [];
          const refs = eager
            .map((d: nga.DeclarationMetadata) => ({
              type: d.declarationType,
              ref: d.refInDeclaringModule,
            }))
            .filter((r): r is {type: string; ref: nga.ReferenceMetadata} => r.ref != null);

          const directiveRefs = refs
            .filter((r) => r.type === 'directive' || r.type === 'component')
            .map((r) => r.ref);
          const pipeRefs = refs.filter((r) => r.type === 'pipe').map((r) => r.ref);

          scopeTargets.push({
            component: compDecl,
            directiveRefs,
            pipeRefs,
          });
        }
      }
    }

    // Sort targets to guarantee deterministic order of generated statements
    scopeTargets.sort((a, b) => refName(a.component).localeCompare(refName(b.component)));

    const coreSetScope = o.importExpr({
      moduleName: '@angular/core',
      name: 'ɵɵsetComponentScope',
    });

    // Wrapped in a closure only when some declaration or import came from a `forwardRef`-like
    // resolver, and never for an empty list.
    // https://github.com/angular/angular/blob/c1829f6/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L1032-L1040
    const mayRequireCycleProtection = ngModule.remoteScopesMayRequireCycleProtection ?? false;
    const scopeArray = (refs: nga.ReferenceMetadata[]): o.Expression => {
      const array = o.literalArr(refs.map((ref) => refToExpression(ref)));
      return mayRequireCycleProtection && refs.length > 0
        ? o.fn([], [new o.ReturnStatement(array)])
        : array;
    };

    for (const target of scopeTargets) {
      // Emitted unguarded: remote scoping is how a cyclic component gets its directives at
      // all, so gating it on `ngDevMode` would leave the scope unset in production builds.
      allStatements.push(
        coreSetScope
          .callFn([
            refToExpression(target.component),
            scopeArray(target.directiveRefs),
            scopeArray(target.pipeRefs),
          ])
          .toStmt(),
      );
    }
  }

  if (allStatements.length > 0) {
    statements = allStatements.map((stmt) => printer.printStatement(stmt)).join('\n');
  }

  // ɵinj.imports:
  // - LOCAL mode: the raw `imports` array elements followed by the raw `exports` array
  //   elements, each emitted verbatim (ngtsc handler.ts#L670-L688) — no resolve/filter/flatten,
  //   so ModuleWithProviders (`X.forRoot()`), spreads and non-identifier entries survive.
  //   https://github.com/angular/angular/blob/e3ac727dfc/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L670-L688
  // - OPTIMIZE mode: the resolved+filtered `injectorImports` with `ModuleWithProviders` and
  //   unfiltered elements spliced back in verbatim (see `buildInjectorImports`).
  const injectorImportsExprs = (): o.Expression[] => {
    if (emitDeclarationOnly) {
      return [];
    }
    const hasUnresolvedImports = !hasWireImports && !!ngModule.importsSpan;
    const hasUnresolvedExports = !hasWireExports && !!ngModule.exportsSpan;
    if (!optimize || hasUnresolvedImports || hasUnresolvedExports) {
      const rawImportEls = rawExprsFromSpans(ngModule.localImportsElementSpans);
      const rawExportEls = rawExprsFromSpans(ngModule.localExportsElementSpans);
      if (rawImportEls !== null || rawExportEls !== null) {
        return [...(rawImportEls ?? []), ...(rawExportEls ?? [])];
      }
    }
    return buildInjectorImports(ngModule, content, guards);
  };

  const injectorMeta = {
    name: className,
    type: {
      value: o.variable(className),
      type: o.variable(className),
    },
    providers: rawExprFromSpan(ngModule.providersSpan),
    imports: injectorImportsExprs(),
  };
  const injectorResult = compileInjector(injectorMeta);
  const compiledInj = createStaticField(
    'ɵinj',
    printer.print(injectorResult.expression),
    printer.emitTypes ? printer.printType(injectorResult.type) : null,
    true,
    isClosureCompilerEnabled,
  );

  return {compiledFac, compiledMod, compiledInj, statements};
}

/**
 * Builds the OPTIMIZE-mode `ɵinj.imports` expression list: resolved references with the
 * `injectorImportRawSpans` elements spliced in verbatim — ngtsc keeps a top-level `imports`
 * element as written whenever it carries a `ModuleWithProviders` or none of its references are
 * filtered out, which is the common case:
 * https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L808-L815
 * https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L863-L866
 *
 * LOCAL mode does not use this path — it emits every raw `imports`/`exports` element verbatim
 * (see `injectorImportsExprs` in `compileNgModuleDef`), so the resolved-reference fallback here
 * only applies when a module has no imports/exports to re-print.
 */
function buildInjectorImports(
  ngModule: nga.NgModuleMetadata,
  content?: string,
  guards: nga.SpanMetadata[] = [],
): o.Expression[] {
  const {imports, injectorImports, exports} = ngModule;
  const importExprs: o.Expression[] = (
    injectorImports || (imports || []).concat(exports || [])
  ).map((d: nga.ReferenceMetadata) => refToExpression(d));

  // Raw indices were computed against `injectorImports`; if that failed to lower and we
  // fell back to `imports`/`exports` above, they are meaningless — skip splicing.
  if (ngModule.injectorImportRawSpans && injectorImports && content) {
    const raws = [...ngModule.injectorImportRawSpans].sort((a, b) => a.index - b.index);
    for (const raw of raws) {
      // `raw.index` was computed against the flattened kept-import count in
      // `optimize_ng_module`; if it exceeds the references we actually received, the two
      // models desynced — fail loudly rather than emit the expression in the wrong place.
      if (raw.index > importExprs.length) {
        throw new Error(
          `ɵinj.imports raw index ${raw.index} exceeds resolved import count ` +
            `${importExprs.length}; flattened-count model desynced from wire references`,
        );
      }
      importExprs.splice(
        raw.index,
        0,
        new o.WrappedNodeExpr(new RawSource(sliceGuarded(content, raw.span, guards))),
      );
    }
  }
  return importExprs;
}

/**
 * Report NG8014 for every `import` declaration that feeds a `@Component.deferredImports` field
 * yet survives anyway, because something else in the file still references one of its bindings.
 * The dynamic `import()`s the defer blocks emit then buy nothing — the module is pulled into the
 * eager graph by the surviving declaration regardless — so the author has almost certainly not
 * got the laziness they asked for.
 *
 * ngtsc runs this check at the top of `resolve()` and returns the diagnostic *instead of*
 * compiling the component, in both local and global compilation modes. This compiler reports and
 * carries on, as it does for the other defer diagnostics above, so a single mistake does not
 * cascade into a wave of unrelated errors from the half-emitted file.
 * https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L1312-L1335
 */
function reportEagerlyImportedDeferredDependencies(
  diagnostics: nga.NgDiagnostic[],
  filePath: string,
  importDeclarations: readonly nga.ImportDeclarationMetadata[],
  classes: readonly nga.ClassMetadata[],
  deferredOnlyNames: ReadonlySet<string>,
  eagerlyBoundNames: ReadonlySet<string>,
) {
  const explicitlyDeferredNames = new Set<string>();
  for (const classMeta of classes) {
    const component = classMeta.component;
    const byBlock = Object.values(component?.deferredImportsByBlock ?? {}).flat();
    for (const ref of [...(component?.deferredImports ?? []), ...byBlock]) {
      if (ref.localAlias !== undefined) {
        explicitlyDeferredNames.add(ref.localAlias);
      }
    }
  }
  if (explicitlyDeferredNames.size === 0) {
    return;
  }

  for (const decl of importDeclarations) {
    if (!decl.bindings.some((binding) => explicitlyDeferredNames.has(binding.local))) {
      continue;
    }
    // ngtsc asks whether the declaration would survive *its* emit, which is JavaScript, so a
    // type-only binding or a type-position reference is erased on the way out and does not block
    // deferral (`valueReferenced` rather than `eagerlyReferenced`).
    const canDefer = decl.bindings.every(
      (binding) =>
        binding.isType ||
        (deferredOnlyNames.has(binding.local) &&
          !eagerlyBoundNames.has(binding.local) &&
          !binding.valueReferenced),
    );
    if (canDefer) {
      continue;
    }
    diagnostics.push({
      category: 1, // Error
      code: 8014, // DEFERRED_DEPENDENCY_IMPORTED_EAGERLY
      messageText:
        `This import contains symbols that are used both inside and outside of the ` +
        `\`@Component.deferredImports\` fields in the file. This renders all these ` +
        `defer imports useless as this import remains and its module is eagerly loaded. ` +
        `To fix this, make sure that all symbols from the import are *only* used within ` +
        `\`@Component.deferredImports\` arrays and there are no other references to those ` +
        `symbols present in this file.`,
      filePath,
      span: decl.span,
    });
  }
}

/**
 * Elide the runtime `import` declarations that exist only to bring in symbols used inside `@defer`
 * blocks, which reach them through the dynamic `import()`s in their dependency resolver instead.
 *
 * Deferral is all-or-nothing per declaration, matching ngtsc's `DeferredSymbolTracker`: every
 * value binding a declaration introduces must be deferrable (`deferredOnlyNames`, not in
 * `eagerlyBoundNames`, and not `valueReferenced`), while `isType` bindings are ignored.
 *
 * When a deferrable declaration has no surviving references at all (`!binding.eagerlyReferenced`),
 * it is removed outright. When any binding is still referenced in a TypeScript type annotation
 * (`binding.eagerlyReferenced`), non-type specifiers are converted to `type` specifiers so
 * downstream `tsc` / `tsickle` elides the runtime import while keeping type annotations valid.
 * https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/imports/src/deferred_symbol_tracker.ts
 */
function removeDeferredImports(
  s: MagicString,
  content: string,
  importDeclarations: readonly nga.ImportDeclarationMetadata[],
  deferredOnlyNames: ReadonlySet<string>,
  eagerlyBoundNames: ReadonlySet<string>,
): Set<nga.ImportDeclarationMetadata> {
  const removed = new Set<nga.ImportDeclarationMetadata>();
  if (deferredOnlyNames.size === 0) {
    return removed;
  }

  for (const decl of importDeclarations) {
    // A bare `import './side-effect'` or an already type-only declaration has no runtime value
    // bindings to defer.
    if (!decl.bindings.some((binding) => !binding.isType)) {
      continue;
    }
    const deferrable = decl.bindings.every(
      (binding) =>
        binding.isType ||
        (deferredOnlyNames.has(binding.local) &&
          !eagerlyBoundNames.has(binding.local) &&
          !binding.valueReferenced),
    );
    if (!deferrable) {
      continue;
    }
    if (decl.bindings.some((binding) => binding.eagerlyReferenced)) {
      convertImportToTypeOnly(s, content, decl);
    } else {
      s.remove(decl.removalSpan.start, decl.removalSpan.end);
      removed.add(decl);
    }
  }
  return removed;
}

/**
 * Convert all non-`type` specifiers of `decl` into `type` specifiers so the declaration remains
 * valid for TypeScript type annotations while eliding any runtime module import.
 */
function convertImportToTypeOnly(
  s: MagicString,
  content: string,
  decl: nga.ImportDeclarationMetadata,
): void {
  const first = decl.bindings[0];
  const hasDefaultClauseWithNamed =
    decl.bindings.length > 1 &&
    first.imported === 'default' &&
    !content.slice(decl.span.start, first.span.start).includes('{');
  if (hasDefaultClauseWithNamed) {
    const braceIdx = content.indexOf('{', first.span.end);
    s.overwrite(first.span.start, braceIdx + 1, `{ type default as ${first.local},`);
    for (const binding of decl.bindings.slice(1)) {
      if (!binding.isType) {
        s.appendLeft(binding.span.start, 'type ');
      }
    }
    return;
  }
  for (const binding of decl.bindings) {
    if (!binding.isType) {
      s.appendLeft(binding.span.start, 'type ');
    }
  }
}

// Note: Angular adds pure annotations for tree-shaking.
// See standard InvokeFunctionExpr pure flag in output AST:
// https://github.com/angular/angular/blob/main/packages/compiler/src/output/output_ast.ts#L443
function createStaticField(
  name: string,
  value: string,
  type: string | null,
  pure: boolean,
  isClosureCompilerEnabled?: boolean,
): string {
  const pureComment = pure ? '/*@__PURE__*/ ' : '';
  const typeSuffix = type ? `: ${type}` : '';
  const nocollapse = isClosureCompilerEnabled ? '/** @nocollapse */\n  ' : '';
  // `// @ts-ignore` only covers the line directly below it, so the initializer has to start on the
  // `static <name> =` line. Breaking after `=` would leave the guard covering the declaration
  // instead of the value it was emitted for. ngtsc emits this on one line too.
  //
  // TODO: the guard still reaches only the initializer's first line. `hostBindings` and `template`
  // print as multi-line functions, so anything emitted after one of them falls outside it.
  // TypeScript has no multi-line suppression, and collapsing the initializer would swallow the
  // `//` comments Angular prints inside it. Characterized in `tests/emit_suppressions.test.ts`.
  return `  ${nocollapse}// @ts-ignore\n  static ${name}${typeSuffix} = ${pureComment}${value};\n`;
}

function compileFactoryField(
  factoryRes: any,
  printer: ExpressionPrinter,
  ctx: HybridCompilerContext,
): string {
  const factoryIsPure =
    factoryRes.expression instanceof o.InvokeFunctionExpr && factoryRes.expression.pure;
  return createStaticField(
    'ɵfac',
    printer.print(factoryRes.expression),
    printer.emitTypes ? printer.printType(factoryRes.type) : null,
    factoryIsPure,
    ctx.isClosureCompilerEnabled,
  );
}

type DeclarationListEmitModeType =
  (typeof DeclarationListEmitMode)[keyof typeof DeclarationListEmitMode];

interface ComponentDependencyMetadata {
  declarations: R3TemplateDependency[];
  declarationListEmitMode: DeclarationListEmitModeType;
  rawImports?: o.Expression;
}

/**
 * Computes component dependency emit metadata (declarations, emit mode, and rawImports).
 */
function computeComponentDependencyMetadata(
  isLocalCompilation: boolean,
  localRuntimeResolved: boolean,
  isRemoteScoped: boolean,
  hasUnresolvedImports: boolean,
  hasForwardRef: boolean,
  standalone: boolean,
  declarations: R3TemplateDependency[],
  rawImportsString?: string,
  importsFactoryString?: string,
): ComponentDependencyMetadata {
  if (isLocalCompilation) {
    return {
      declarations: [],
      declarationListEmitMode: localRuntimeResolved
        ? DeclarationListEmitMode.RuntimeResolved
        : DeclarationListEmitMode.Direct,
      rawImports:
        localRuntimeResolved && importsFactoryString
          ? new o.WrappedNodeExpr(new RawSource(importsFactoryString))
          : undefined,
    };
  }

  const rawImports =
    hasUnresolvedImports && rawImportsString
      ? new o.WrappedNodeExpr(new RawSource(rawImportsString))
      : undefined;

  if (isRemoteScoped) {
    // The scope is set from the NgModule's file instead, so the definition carries no
    // `dependencies` at all. `RuntimeResolved` would emit `ɵɵgetComponentDepsFactory`, which is
    // the local-compilation runtime helper — an empty list in `Direct` mode emits no key.
    // https://github.com/angular/angular/blob/c1829f6/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L1266-L1269
    return {
      declarations: [],
      declarationListEmitMode: DeclarationListEmitMode.Direct,
      rawImports,
    };
  }

  if (!hasUnresolvedImports) {
    return {
      declarations,
      declarationListEmitMode: hasForwardRef
        ? DeclarationListEmitMode.Closure
        : DeclarationListEmitMode.Direct,
      rawImports: undefined,
    };
  }

  return {
    declarations,
    declarationListEmitMode:
      rawImportsString !== undefined || !standalone
        ? DeclarationListEmitMode.RuntimeResolved
        : DeclarationListEmitMode.Direct,
    rawImports,
  };
}

/**
 * Where a diagnostic about a span of a component's template is reported, following ngtsc's
 * `makeTemplateDiagnostic` for each kind of template source mapping: in the template file for
 * an external template, and at the span itself for an inline literal (`direct`, whose spans are
 * offsets into this file). An inline template computed by any other expression (`indirect`) has
 * spans that are offsets into the resolved template string, not into any file on disk, so the
 * diagnostic is anchored on the `template` expression instead.
 */
function templateDiagnosticLocation(
  component: nga.ComponentMetadata,
  filePath: string,
  span: {start: number; end: number},
): {filePath: string; span: {start: number; end: number}} {
  if (component.templateUrl != null) {
    return {filePath: component.templateUrl.resolvedPath, span};
  }
  const expressionSpan = component.templateSpan;
  if (component.templateContentSpan != null || expressionSpan == null) {
    return {filePath, span};
  }
  // TODO(parity): for an `indirect` template ngtsc reports the diagnostic at `span` inside a
  // synthetic `<file> (<ComponentName> template)` source file holding the resolved template, and
  // points related information ("Error occurs in the template of component …") at the
  // `template` expression. `NgDiagnostic` can carry neither a synthetic file nor related
  // information, so only the expression location is reported.
  return {filePath, span: {start: expressionSpan.start, end: expressionSpan.end}};
}

function parseComponentTemplate(
  component: nga.ComponentMetadata,
  filePath: string,
  content: string,
  options: Partial<ParseTemplateOptions> = {},
): ParsedTemplate {
  const parseOptions: Partial<ParseTemplateOptions> = {
    ...options,
    preserveWhitespaces: component.preserveWhitespaces ?? options.preserveWhitespaces ?? false,
  };
  // A `template` literal is parsed out of this file's source text so its spans are offsets
  // into it. An external template, or an inline one computed by any other expression, is parsed
  // on its own: its spans are offsets into the template string (ngtsc's `external` and
  // `indirect` source mappings).
  // TODO(parity): ngtsc's `parseExtractedTemplate` also parses a second, span-faithful copy
  // (`diagNodes`: whitespace, line endings and leading trivia preserved) that type-checking
  // binds against. Only this primary parse exists here, so spans that line-ending
  // normalization moves (e.g. an ICU switch value after CRLF line breaks) can still drift.
  const contentSpan = component.templateContentSpan;
  if (component.templateUrl == null && contentSpan != null) {
    return parseDirectInlineTemplate(content, filePath, contentSpan, parseOptions);
  }
  return parseTemplate(component.template || '', filePath, parseOptions);
}
