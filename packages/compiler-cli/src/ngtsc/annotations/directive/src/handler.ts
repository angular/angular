/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  compileClassMetadata,
  compileDeclareClassMetadata,
  compileDeclareDirectiveFromMetadata,
  compileDirectiveFromMetadata,
  ConstantPool,
  FactoryTarget,
  makeBindingParser,
  R3ClassMetadata,
  R3DirectiveMetadata,
  WrappedNodeExpr,
} from '@angular/compiler';
import ts from 'typescript';

import {ImportedSymbolsTracker, Reference, ReferenceEmitter} from '../../../imports';
import {
  extractSemanticTypeParameters,
  SemanticDepGraphUpdater,
} from '../../../incremental/semantic_graph';
import {
  ClassPropertyMapping,
  DirectiveTypeCheckMeta,
  extractDirectiveTypeCheckMeta,
  HostDirectiveMeta,
  InputMapping,
  MatchSource,
  MetadataReader,
  MetadataRegistry,
  MetaKind,
} from '../../../metadata';
import {PartialEvaluator} from '../../../partial_evaluator';
import {PerfEvent, PerfRecorder} from '../../../perf';
import {
  ClassDeclaration,
  ClassMember,
  ClassMemberKind,
  Decorator,
  ReflectionHost,
} from '../../../reflection';
import {LocalModuleScopeRegistry} from '../../../scope';
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
  compileDeclareFactory,
  compileInputTransformFields,
  compileNgFactoryDefField,
  compileResults,
  extractClassMetadata,
  findAngularDecorator,
  getDirectiveDiagnostics,
  getProviderDiagnostics,
  getUndecoratedClassWithAngularFeaturesDiagnostic,
  InjectableClassRegistry,
  isAngularDecorator,
  readBaseClass,
  ReferencesRegistry,
  resolveProvidersRequiringFactory,
  toFactoryMetadata,
  validateHostDirectives,
} from '../../common';

import {extractDirectiveMetadata} from './shared';
import {DirectiveSymbol} from './symbol';
import {JitDeclarationRegistry} from '../../common/src/jit_declaration_registry';

const FIELD_DECORATORS = [
  'Input',
  'Output',
  'ViewChild',
  'ViewChildren',
  'ContentChild',
  'ContentChildren',
  'HostBinding',
  'HostListener',
];
const LIFECYCLE_HOOKS = new Set([
  'ngOnChanges',
  'ngOnInit',
  'ngOnDestroy',
  'ngDoCheck',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngAfterContentInit',
  'ngAfterContentChecked',
]);

export interface DirectiveHandlerData {
  baseClass: Reference<ClassDeclaration> | 'dynamic' | null;
  typeCheckMeta: DirectiveTypeCheckMeta;
  meta: R3DirectiveMetadata;
  classMetadata: R3ClassMetadata | null;
  providersRequiringFactory: Set<Reference<ClassDeclaration>> | null;
  inputs: ClassPropertyMapping<InputMapping>;
  inputFieldNamesFromMetadataArray: Set<string>;
  outputs: ClassPropertyMapping;
  isPoisoned: boolean;
  isStructural: boolean;
  decorator: ts.Decorator | null;
  hostDirectives: HostDirectiveMeta[] | null;
  rawHostDirectives: ts.Expression | null;
}

export class DirectiveDecoratorHandler
  implements DecoratorHandler<Decorator | null, DirectiveHandlerData, DirectiveSymbol, unknown>
{
  constructor(
    private reflector: ReflectionHost,
    private evaluator: PartialEvaluator,
    private metaRegistry: MetadataRegistry,
    private scopeRegistry: LocalModuleScopeRegistry,
    private metaReader: MetadataReader,
    private injectableRegistry: InjectableClassRegistry,
    private refEmitter: ReferenceEmitter,
    private referencesRegistry: ReferencesRegistry,
    private isCore: boolean,
    private strictCtorDeps: boolean,
    private semanticDepGraphUpdater: SemanticDepGraphUpdater | null,
    private annotateForClosureCompiler: boolean,
    private perf: PerfRecorder,
    private importTracker: ImportedSymbolsTracker,
    private includeClassMetadata: boolean,
    private readonly compilationMode: CompilationMode,
    private readonly jitDeclarationRegistry: JitDeclarationRegistry,
    private readonly strictStandalone: boolean,
    private readonly implicitStandaloneValue: boolean,
  ) {}

  readonly precedence = HandlerPrecedence.PRIMARY;
  readonly name = 'DirectiveDecoratorHandler';

  detect(
    node: ClassDeclaration,
    decorators: Decorator[] | null,
  ): DetectResult<Decorator | null> | undefined {
    // If a class is undecorated but uses Angular features, we detect it as an
    // abstract directive. This is an unsupported pattern as of v10, but we want
    // to still detect these patterns so that we can report diagnostics.
    if (!decorators) {
      const angularField = this.findClassFieldWithAngularFeatures(node);
      return angularField
        ? {trigger: angularField.node, decorator: null, metadata: null}
        : undefined;
    } else {
      const decorator = findAngularDecorator(decorators, 'Directive', this.isCore);
      return decorator ? {trigger: decorator.node, decorator, metadata: decorator} : undefined;
    }
  }

  analyze(
    node: ClassDeclaration,
    decorator: Readonly<Decorator | null>,
  ): AnalysisOutput<DirectiveHandlerData> {
    // Skip processing of the class declaration if compilation of undecorated classes
    // with Angular features is disabled. Previously in ngtsc, such classes have always
    // been processed, but we want to enforce a consistent decorator mental model.
    // See: https://v9.angular.io/guide/migration-undecorated-classes.
    if (decorator === null) {
      // If compiling @angular/core, skip the diagnostic as core occasionally hand-writes
      // definitions.
      if (this.isCore) {
        return {};
      }
      return {diagnostics: [getUndecoratedClassWithAngularFeaturesDiagnostic(node)]};
    }

    this.perf.eventCount(PerfEvent.AnalyzeDirective);

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
      /* defaultSelector */ null,
      this.strictStandalone,
      this.implicitStandaloneValue,
    );
    // `extractDirectiveMetadata` returns `jitForced = true` when the `@Directive` has
    // set `jit: true`. In this case, compilation of the decorator is skipped. Returning
    // an empty object signifies that no analysis was produced.
    if (directiveResult.jitForced) {
      this.jitDeclarationRegistry.jitDeclarations.add(node);
      return {};
    }

    const analysis = directiveResult.metadata;

    let providersRequiringFactory: Set<Reference<ClassDeclaration>> | null = null;
    if (directiveResult !== undefined && directiveResult.decorator.has('providers')) {
      providersRequiringFactory = resolveProvidersRequiringFactory(
        directiveResult.decorator.get('providers')!,
        this.reflector,
        this.evaluator,
      );
    }

    return {
      analysis: {
        inputs: directiveResult.inputs,
        inputFieldNamesFromMetadataArray: directiveResult.inputFieldNamesFromMetadataArray,
        outputs: directiveResult.outputs,
        meta: analysis,
        hostDirectives: directiveResult.hostDirectives,
        rawHostDirectives: directiveResult.rawHostDirectives,
        classMetadata: this.includeClassMetadata
          ? extractClassMetadata(node, this.reflector, this.isCore, this.annotateForClosureCompiler)
          : null,
        baseClass: readBaseClass(node, this.reflector, this.evaluator),
        typeCheckMeta: extractDirectiveTypeCheckMeta(node, directiveResult.inputs, this.reflector),
        providersRequiringFactory,
        isPoisoned: false,
        isStructural: directiveResult.isStructural,
        decorator: (decorator?.node as ts.Decorator | null) ?? null,
      },
    };
  }

  symbol(node: ClassDeclaration, analysis: Readonly<DirectiveHandlerData>): DirectiveSymbol {
    const typeParameters = extractSemanticTypeParameters(node);

    return new DirectiveSymbol(
      node,
      analysis.meta.selector,
      analysis.inputs,
      analysis.outputs,
      analysis.meta.exportAs,
      analysis.typeCheckMeta,
      typeParameters,
    );
  }

  register(node: ClassDeclaration, analysis: Readonly<DirectiveHandlerData>): void {
    // Register this directive's information with the `MetadataRegistry`. This ensures that
    // the information about the directive is available during the compile() phase.
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
      isComponent: false,
      baseClass: analysis.baseClass,
      hostDirectives: analysis.hostDirectives,
      ...analysis.typeCheckMeta,
      isPoisoned: analysis.isPoisoned,
      isStructural: analysis.isStructural,
      animationTriggerNames: null,
      isStandalone: analysis.meta.isStandalone,
      isSignal: analysis.meta.isSignal,
      imports: null,
      rawImports: null,
      deferredImports: null,
      schemas: null,
      ngContentSelectors: null,
      decorator: analysis.decorator,
      preserveWhitespaces: false,
      // Directives analyzed within our own compilation are not _assumed_ to export providers.
      // Instead, we statically analyze their imports to make a direct determination.
      assumedToExportProviders: false,
      isExplicitlyDeferred: false,
    });

    this.injectableRegistry.registerInjectable(node, {
      ctorDeps: analysis.meta.deps,
    });
  }

  resolve(
    node: ClassDeclaration,
    analysis: DirectiveHandlerData,
    symbol: DirectiveSymbol,
  ): ResolveResult<unknown> {
    if (this.compilationMode === CompilationMode.LOCAL) {
      return {};
    }

    if (this.semanticDepGraphUpdater !== null && analysis.baseClass instanceof Reference) {
      symbol.baseClass = this.semanticDepGraphUpdater.getSymbol(analysis.baseClass.node);
    }

    const diagnostics: ts.Diagnostic[] = [];
    if (
      analysis.providersRequiringFactory !== null &&
      analysis.meta.providers instanceof WrappedNodeExpr
    ) {
      const providerDiagnostics = getProviderDiagnostics(
        analysis.providersRequiringFactory,
        analysis.meta.providers!.node,
        this.injectableRegistry,
      );
      diagnostics.push(...providerDiagnostics);
    }

    const directiveDiagnostics = getDirectiveDiagnostics(
      node,
      this.injectableRegistry,
      this.evaluator,
      this.reflector,
      this.scopeRegistry,
      this.strictCtorDeps,
      'Directive',
    );
    if (directiveDiagnostics !== null) {
      diagnostics.push(...directiveDiagnostics);
    }

    const hostDirectivesDiagnotics =
      analysis.hostDirectives && analysis.rawHostDirectives
        ? validateHostDirectives(
            analysis.rawHostDirectives,
            analysis.hostDirectives,
            this.metaReader,
          )
        : null;
    if (hostDirectivesDiagnotics !== null) {
      diagnostics.push(...hostDirectivesDiagnotics);
    }

    return {diagnostics: diagnostics.length > 0 ? diagnostics : undefined};
  }

  compileFull(
    node: ClassDeclaration,
    analysis: Readonly<DirectiveHandlerData>,
    resolution: Readonly<unknown>,
    pool: ConstantPool,
  ): CompileResult[] {
    const fac = compileNgFactoryDefField(toFactoryMetadata(analysis.meta, FactoryTarget.Directive));
    const def = compileDirectiveFromMetadata(analysis.meta, pool, makeBindingParser());
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileClassMetadata(analysis.classMetadata).toStmt()
        : null;
    return compileResults(
      fac,
      def,
      classMetadata,
      'ɵdir',
      inputTransformFields,
      null /* deferrableImports */,
    );
  }

  compilePartial(
    node: ClassDeclaration,
    analysis: Readonly<DirectiveHandlerData>,
    resolution: Readonly<unknown>,
  ): CompileResult[] {
    const fac = compileDeclareFactory(toFactoryMetadata(analysis.meta, FactoryTarget.Directive));
    const def = compileDeclareDirectiveFromMetadata(analysis.meta);
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileDeclareClassMetadata(analysis.classMetadata).toStmt()
        : null;

    return compileResults(
      fac,
      def,
      classMetadata,
      'ɵdir',
      inputTransformFields,
      null /* deferrableImports */,
    );
  }

  compileLocal(
    node: ClassDeclaration,
    analysis: Readonly<DirectiveHandlerData>,
    resolution: Readonly<unknown>,
    pool: ConstantPool,
  ): CompileResult[] {
    const fac = compileNgFactoryDefField(toFactoryMetadata(analysis.meta, FactoryTarget.Directive));
    const def = compileDirectiveFromMetadata(analysis.meta, pool, makeBindingParser());
    const inputTransformFields = compileInputTransformFields(analysis.inputs);
    const classMetadata =
      analysis.classMetadata !== null
        ? compileClassMetadata(analysis.classMetadata).toStmt()
        : null;
    return compileResults(
      fac,
      def,
      classMetadata,
      'ɵdir',
      inputTransformFields,
      null /* deferrableImports */,
    );
  }

  /**
   * Checks if a given class uses Angular features and returns the TypeScript node
   * that indicated the usage. Classes are considered using Angular features if they
   * contain class members that are either decorated with a known Angular decorator,
   * or if they correspond to a known Angular lifecycle hook.
   */
  private findClassFieldWithAngularFeatures(node: ClassDeclaration): ClassMember | undefined {
    return this.reflector.getMembersOfClass(node).find((member) => {
      if (
        !member.isStatic &&
        member.kind === ClassMemberKind.Method &&
        LIFECYCLE_HOOKS.has(member.name)
      ) {
        return true;
      }
      if (member.decorators) {
        return member.decorators.some((decorator) =>
          FIELD_DECORATORS.some((decoratorName) =>
            isAngularDecorator(decorator, decoratorName, this.isCore),
          ),
        );
      }
      return false;
    });
  }
}
