/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compileDeclareDirectiveFromMetadata, compileDirectiveFromMetadata, ConstantPool, Expression, ExternalExpr, FactoryTarget, getSafePropertyAccessString, makeBindingParser, ParsedHostBindings, ParseError, parseHostBindings, R3DirectiveMetadata, R3FactoryMetadata, R3QueryMetadata, Statement, verifyHostBindings, WrappedNodeExpr} from '@angular/compiler';
import {emitDistinctChangesOnlyDefaultValue} from '@angular/compiler/src/core';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {DefaultImportRecorder, Reference} from '../../imports';
import {areTypeParametersEqual, extractSemanticTypeParameters, isArrayEqual, isSetEqual, isSymbolEqual, SemanticDepGraphUpdater, SemanticSymbol, SemanticTypeParameter} from '../../incremental/semantic_graph';
import {BindingPropertyName, ClassPropertyMapping, ClassPropertyName, DirectiveTypeCheckMeta, InjectableClassRegistry, MetadataReader, MetadataRegistry, TemplateGuardMeta} from '../../metadata';
import {extractDirectiveTypeCheckMeta} from '../../metadata/src/util';
import {DynamicValue, EnumValue, PartialEvaluator} from '../../partial_evaluator';
import {PerfEvent, PerfRecorder} from '../../perf';
import {ClassDeclaration, ClassMember, ClassMemberKind, Decorator, filterToMembersWithDecorator, ReflectionHost, reflectObjectLiteral} from '../../reflection';
import {LocalModuleScopeRegistry} from '../../scope';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerFlags, HandlerPrecedence, ResolveResult} from '../../transform';

import {createValueHasWrongTypeError, getDirectiveDiagnostics, getProviderDiagnostics, getUndecoratedClassWithAngularFeaturesDiagnostic} from './diagnostics';
import {compileDeclareFactory, compileNgFactoryDefField} from './factory';
import {generateSetClassMetadataCall} from './metadata';
import {compileResults, createSourceSpan, findAngularDecorator, getConstructorDependencies, isAngularDecorator, readBaseClass, resolveProvidersRequiringFactory, toFactoryMetadata, unwrapConstructorDependencies, unwrapExpression, unwrapForwardRef, validateConstructorDependencies, wrapFunctionExpressionsInParens, wrapTypeReference} from './util';

const EMPTY_OBJECT: {[key: string]: string} = {};
const FIELD_DECORATORS = [
  'Input', 'Output', 'ViewChild', 'ViewChildren', 'ContentChild', 'ContentChildren', 'HostBinding',
  'HostListener'
];
const LIFECYCLE_HOOKS = new Set([
  'ngOnChanges', 'ngOnInit', 'ngOnDestroy', 'ngDoCheck', 'ngAfterViewInit', 'ngAfterViewChecked',
  'ngAfterContentInit', 'ngAfterContentChecked'
]);

export interface DirectiveHandlerData {
  baseClass: Reference<ClassDeclaration>|'dynamic'|null;
  typeCheckMeta: DirectiveTypeCheckMeta;
  meta: R3DirectiveMetadata;
  metadataStmt: Statement|null;
  providersRequiringFactory: Set<Reference<ClassDeclaration>>|null;
  inputs: ClassPropertyMapping;
  outputs: ClassPropertyMapping;
  isPoisoned: boolean;
  isStructural: boolean;
}

/**
 * Represents an Angular directive. Components are represented by `ComponentSymbol`, which inherits
 * from this symbol.
 */
export class DirectiveSymbol extends SemanticSymbol {
  baseClass: SemanticSymbol|null = null;

  constructor(
      decl: ClassDeclaration, public readonly selector: string|null,
      public readonly inputs: ClassPropertyMapping, public readonly outputs: ClassPropertyMapping,
      public readonly exportAs: string[]|null,
      public readonly typeCheckMeta: DirectiveTypeCheckMeta,
      public readonly typeParameters: SemanticTypeParameter[]|null) {
    super(decl);
  }

  isPublicApiAffected(previousSymbol: SemanticSymbol): boolean {
    // Note: since components and directives have exactly the same items contributing to their
    // public API, it is okay for a directive to change into a component and vice versa without
    // the API being affected.
    if (!(previousSymbol instanceof DirectiveSymbol)) {
      return true;
    }

    // Directives and components have a public API of:
    //  1. Their selector.
    //  2. The binding names of their inputs and outputs; a change in ordering is also considered
    //     to be a change in public API.
    //  3. The list of exportAs names and its ordering.
    return this.selector !== previousSymbol.selector ||
        !isArrayEqual(this.inputs.propertyNames, previousSymbol.inputs.propertyNames) ||
        !isArrayEqual(this.outputs.propertyNames, previousSymbol.outputs.propertyNames) ||
        !isArrayEqual(this.exportAs, previousSymbol.exportAs);
  }

  isTypeCheckApiAffected(previousSymbol: SemanticSymbol): boolean {
    // If the public API of the directive has changed, then so has its type-check API.
    if (this.isPublicApiAffected(previousSymbol)) {
      return true;
    }

    if (!(previousSymbol instanceof DirectiveSymbol)) {
      return true;
    }

    // The type-check block also depends on the class property names, as writes property bindings
    // directly into the backing fields.
    if (!isArrayEqual(
            Array.from(this.inputs), Array.from(previousSymbol.inputs), isInputMappingEqual) ||
        !isArrayEqual(
            Array.from(this.outputs), Array.from(previousSymbol.outputs), isInputMappingEqual)) {
      return true;
    }

    // The type parameters of a directive are emitted into the type constructors in the type-check
    // block of a component, so if the type parameters are not considered equal then consider the
    // type-check API of this directive to be affected.
    if (!areTypeParametersEqual(this.typeParameters, previousSymbol.typeParameters)) {
      return true;
    }

    // The type-check metadata is used during TCB code generation, so any changes should invalidate
    // prior type-check files.
    if (!isTypeCheckMetaEqual(this.typeCheckMeta, previousSymbol.typeCheckMeta)) {
      return true;
    }

    // Changing the base class of a directive means that its inputs/outputs etc may have changed,
    // so the type-check block of components that use this directive needs to be regenerated.
    if (!isBaseClassEqual(this.baseClass, previousSymbol.baseClass)) {
      return true;
    }

    return false;
  }
}

function isInputMappingEqual(
    current: [ClassPropertyName, BindingPropertyName],
    previous: [ClassPropertyName, BindingPropertyName]): boolean {
  return current[0] === previous[0] && current[1] === previous[1];
}

function isTypeCheckMetaEqual(
    current: DirectiveTypeCheckMeta, previous: DirectiveTypeCheckMeta): boolean {
  if (current.hasNgTemplateContextGuard !== previous.hasNgTemplateContextGuard) {
    return false;
  }
  if (current.isGeneric !== previous.isGeneric) {
    // Note: changes in the number of type parameters is also considered in `areTypeParametersEqual`
    // so this check is technically not needed; it is done anyway for completeness in terms of
    // whether the `DirectiveTypeCheckMeta` struct itself compares equal or not.
    return false;
  }
  if (!isArrayEqual(current.ngTemplateGuards, previous.ngTemplateGuards, isTemplateGuardEqual)) {
    return false;
  }
  if (!isSetEqual(current.coercedInputFields, previous.coercedInputFields)) {
    return false;
  }
  if (!isSetEqual(current.restrictedInputFields, previous.restrictedInputFields)) {
    return false;
  }
  if (!isSetEqual(current.stringLiteralInputFields, previous.stringLiteralInputFields)) {
    return false;
  }
  if (!isSetEqual(current.undeclaredInputFields, previous.undeclaredInputFields)) {
    return false;
  }
  return true;
}

function isTemplateGuardEqual(current: TemplateGuardMeta, previous: TemplateGuardMeta): boolean {
  return current.inputName === previous.inputName && current.type === previous.type;
}

function isBaseClassEqual(current: SemanticSymbol|null, previous: SemanticSymbol|null): boolean {
  if (current === null || previous === null) {
    return current === previous;
  }

  return isSymbolEqual(current, previous);
}

export class DirectiveDecoratorHandler implements
    DecoratorHandler<Decorator|null, DirectiveHandlerData, DirectiveSymbol, unknown> {
  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private metaRegistry: MetadataRegistry, private scopeRegistry: LocalModuleScopeRegistry,
      private metaReader: MetadataReader, private defaultImportRecorder: DefaultImportRecorder,
      private injectableRegistry: InjectableClassRegistry, private isCore: boolean,
      private semanticDepGraphUpdater: SemanticDepGraphUpdater|null,
      private annotateForClosureCompiler: boolean,
      private compileUndecoratedClassesWithAngularFeatures: boolean, private perf: PerfRecorder) {}

  readonly precedence = HandlerPrecedence.PRIMARY;
  readonly name = DirectiveDecoratorHandler.name;

  detect(node: ClassDeclaration, decorators: Decorator[]|null):
      DetectResult<Decorator|null>|undefined {
    // If a class is undecorated but uses Angular features, we detect it as an
    // abstract directive. This is an unsupported pattern as of v10, but we want
    // to still detect these patterns so that we can report diagnostics, or compile
    // them for backwards compatibility in ngcc.
    if (!decorators) {
      const angularField = this.findClassFieldWithAngularFeatures(node);
      return angularField ? {trigger: angularField.node, decorator: null, metadata: null} :
                            undefined;
    } else {
      const decorator = findAngularDecorator(decorators, 'Directive', this.isCore);
      return decorator ? {trigger: decorator.node, decorator, metadata: decorator} : undefined;
    }
  }

  analyze(node: ClassDeclaration, decorator: Readonly<Decorator|null>, flags = HandlerFlags.NONE):
      AnalysisOutput<DirectiveHandlerData> {
    // Skip processing of the class declaration if compilation of undecorated classes
    // with Angular features is disabled. Previously in ngtsc, such classes have always
    // been processed, but we want to enforce a consistent decorator mental model.
    // See: https://v9.angular.io/guide/migration-undecorated-classes.
    if (this.compileUndecoratedClassesWithAngularFeatures === false && decorator === null) {
      return {diagnostics: [getUndecoratedClassWithAngularFeaturesDiagnostic(node)]};
    }

    this.perf.eventCount(PerfEvent.AnalyzeDirective);

    const directiveResult = extractDirectiveMetadata(
        node, decorator, this.reflector, this.evaluator, this.defaultImportRecorder, this.isCore,
        flags, this.annotateForClosureCompiler);
    if (directiveResult === undefined) {
      return {};
    }
    const analysis = directiveResult.metadata;

    let providersRequiringFactory: Set<Reference<ClassDeclaration>>|null = null;
    if (directiveResult !== undefined && directiveResult.decorator.has('providers')) {
      providersRequiringFactory = resolveProvidersRequiringFactory(
          directiveResult.decorator.get('providers')!, this.reflector, this.evaluator);
    }

    return {
      analysis: {
        inputs: directiveResult.inputs,
        outputs: directiveResult.outputs,
        meta: analysis,
        metadataStmt: generateSetClassMetadataCall(
            node, this.reflector, this.defaultImportRecorder, this.isCore,
            this.annotateForClosureCompiler),
        baseClass: readBaseClass(node, this.reflector, this.evaluator),
        typeCheckMeta: extractDirectiveTypeCheckMeta(node, directiveResult.inputs, this.reflector),
        providersRequiringFactory,
        isPoisoned: false,
        isStructural: directiveResult.isStructural,
      }
    };
  }

  symbol(node: ClassDeclaration, analysis: Readonly<DirectiveHandlerData>): DirectiveSymbol {
    const typeParameters = extractSemanticTypeParameters(node);

    return new DirectiveSymbol(
        node, analysis.meta.selector, analysis.inputs, analysis.outputs, analysis.meta.exportAs,
        analysis.typeCheckMeta, typeParameters);
  }

  register(node: ClassDeclaration, analysis: Readonly<DirectiveHandlerData>): void {
    // Register this directive's information with the `MetadataRegistry`. This ensures that
    // the information about the directive is available during the compile() phase.
    const ref = new Reference(node);
    this.metaRegistry.registerDirectiveMetadata({
      ref,
      name: node.name.text,
      selector: analysis.meta.selector,
      exportAs: analysis.meta.exportAs,
      inputs: analysis.inputs,
      outputs: analysis.outputs,
      queries: analysis.meta.queries.map(query => query.propertyName),
      isComponent: false,
      baseClass: analysis.baseClass,
      ...analysis.typeCheckMeta,
      isPoisoned: analysis.isPoisoned,
      isStructural: analysis.isStructural,
    });

    this.injectableRegistry.registerInjectable(node);
  }

  resolve(node: ClassDeclaration, analysis: DirectiveHandlerData, symbol: DirectiveSymbol):
      ResolveResult<unknown> {
    if (this.semanticDepGraphUpdater !== null && analysis.baseClass instanceof Reference) {
      symbol.baseClass = this.semanticDepGraphUpdater.getSymbol(analysis.baseClass.node);
    }

    const diagnostics: ts.Diagnostic[] = [];
    if (analysis.providersRequiringFactory !== null &&
        analysis.meta.providers instanceof WrappedNodeExpr) {
      const providerDiagnostics = getProviderDiagnostics(
          analysis.providersRequiringFactory, analysis.meta.providers!.node,
          this.injectableRegistry);
      diagnostics.push(...providerDiagnostics);
    }

    const directiveDiagnostics = getDirectiveDiagnostics(
        node, this.metaReader, this.evaluator, this.reflector, this.scopeRegistry, 'Directive');
    if (directiveDiagnostics !== null) {
      diagnostics.push(...directiveDiagnostics);
    }

    return {diagnostics: diagnostics.length > 0 ? diagnostics : undefined};
  }

  compileFull(
      node: ClassDeclaration, analysis: Readonly<DirectiveHandlerData>,
      resolution: Readonly<unknown>, pool: ConstantPool): CompileResult[] {
    const fac = compileNgFactoryDefField(toFactoryMetadata(analysis.meta, FactoryTarget.Directive));
    const def = compileDirectiveFromMetadata(analysis.meta, pool, makeBindingParser());
    return compileResults(fac, def, analysis.metadataStmt, 'ɵdir');
  }

  compilePartial(
      node: ClassDeclaration, analysis: Readonly<DirectiveHandlerData>,
      resolution: Readonly<unknown>): CompileResult[] {
    const fac = compileDeclareFactory(toFactoryMetadata(analysis.meta, FactoryTarget.Directive));
    const def = compileDeclareDirectiveFromMetadata(analysis.meta);
    return compileResults(fac, def, analysis.metadataStmt, 'ɵdir');
  }

  /**
   * Checks if a given class uses Angular features and returns the TypeScript node
   * that indicated the usage. Classes are considered using Angular features if they
   * contain class members that are either decorated with a known Angular decorator,
   * or if they correspond to a known Angular lifecycle hook.
   */
  private findClassFieldWithAngularFeatures(node: ClassDeclaration): ClassMember|undefined {
    return this.reflector.getMembersOfClass(node).find(member => {
      if (!member.isStatic && member.kind === ClassMemberKind.Method &&
          LIFECYCLE_HOOKS.has(member.name)) {
        return true;
      }
      if (member.decorators) {
        return member.decorators.some(
            decorator => FIELD_DECORATORS.some(
                decoratorName => isAngularDecorator(decorator, decoratorName, this.isCore)));
      }
      return false;
    });
  }
}

/**
 * Helper function to extract metadata from a `Directive` or `Component`. `Directive`s without a
 * selector are allowed to be used for abstract base classes. These abstract directives should not
 * appear in the declarations of an `NgModule` and additional verification is done when processing
 * the module.
 */
export function extractDirectiveMetadata(
    clazz: ClassDeclaration, decorator: Readonly<Decorator|null>, reflector: ReflectionHost,
    evaluator: PartialEvaluator, defaultImportRecorder: DefaultImportRecorder, isCore: boolean,
    flags: HandlerFlags, annotateForClosureCompiler: boolean,
    defaultSelector: string|null = null): {
  decorator: Map<string, ts.Expression>,
  metadata: R3DirectiveMetadata,
  inputs: ClassPropertyMapping,
  outputs: ClassPropertyMapping,
  isStructural: boolean;
}|undefined {
  let directive: Map<string, ts.Expression>;
  if (decorator === null || decorator.args === null || decorator.args.length === 0) {
    directive = new Map<string, ts.Expression>();
  } else if (decorator.args.length !== 1) {
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARITY_WRONG, Decorator.nodeForError(decorator),
        `Incorrect number of arguments to @${decorator.name} decorator`);
  } else {
    const meta = unwrapExpression(decorator.args[0]);
    if (!ts.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta,
          `@${decorator.name} argument must be an object literal`);
    }
    directive = reflectObjectLiteral(meta);
  }

  if (directive.has('jit')) {
    // The only allowed value is true, so there's no need to expand further.
    return undefined;
  }

  const members = reflector.getMembersOfClass(clazz);

  // Precompute a list of ts.ClassElements that have decorators. This includes things like @Input,
  // @Output, @HostBinding, etc.
  const decoratedElements =
      members.filter(member => !member.isStatic && member.decorators !== null);

  const coreModule = isCore ? undefined : '@angular/core';

  // Construct the map of inputs both from the @Directive/@Component
  // decorator, and the decorated
  // fields.
  const inputsFromMeta = parseFieldToPropertyMapping(directive, 'inputs', evaluator);
  const inputsFromFields = parseDecoratedFields(
      filterToMembersWithDecorator(decoratedElements, 'Input', coreModule), evaluator,
      resolveInput);

  // And outputs.
  const outputsFromMeta = parseFieldToPropertyMapping(directive, 'outputs', evaluator);
  const outputsFromFields =
      parseDecoratedFields(
          filterToMembersWithDecorator(decoratedElements, 'Output', coreModule), evaluator,
          resolveOutput) as {[field: string]: string};
  // Construct the list of queries.
  const contentChildFromFields = queriesFromFields(
      filterToMembersWithDecorator(decoratedElements, 'ContentChild', coreModule), reflector,
      evaluator);
  const contentChildrenFromFields = queriesFromFields(
      filterToMembersWithDecorator(decoratedElements, 'ContentChildren', coreModule), reflector,
      evaluator);

  const queries = [...contentChildFromFields, ...contentChildrenFromFields];

  // Construct the list of view queries.
  const viewChildFromFields = queriesFromFields(
      filterToMembersWithDecorator(decoratedElements, 'ViewChild', coreModule), reflector,
      evaluator);
  const viewChildrenFromFields = queriesFromFields(
      filterToMembersWithDecorator(decoratedElements, 'ViewChildren', coreModule), reflector,
      evaluator);
  const viewQueries = [...viewChildFromFields, ...viewChildrenFromFields];

  if (directive.has('queries')) {
    const queriesFromDecorator =
        extractQueriesFromDecorator(directive.get('queries')!, reflector, evaluator, isCore);
    queries.push(...queriesFromDecorator.content);
    viewQueries.push(...queriesFromDecorator.view);
  }

  // Parse the selector.
  let selector = defaultSelector;
  if (directive.has('selector')) {
    const expr = directive.get('selector')!;
    const resolved = evaluator.evaluate(expr);
    if (typeof resolved !== 'string') {
      throw createValueHasWrongTypeError(expr, resolved, `selector must be a string`);
    }
    // use default selector in case selector is an empty string
    selector = resolved === '' ? defaultSelector : resolved;
    if (!selector) {
      throw new FatalDiagnosticError(
          ErrorCode.DIRECTIVE_MISSING_SELECTOR, expr,
          `Directive ${clazz.name.text} has no selector, please add it!`);
    }
  }

  const host = extractHostBindings(decoratedElements, evaluator, coreModule, directive);

  const providers: Expression|null = directive.has('providers') ?
      new WrappedNodeExpr(
          annotateForClosureCompiler ?
              wrapFunctionExpressionsInParens(directive.get('providers')!) :
              directive.get('providers')!) :
      null;

  // Determine if `ngOnChanges` is a lifecycle hook defined on the component.
  const usesOnChanges = members.some(
      member => !member.isStatic && member.kind === ClassMemberKind.Method &&
          member.name === 'ngOnChanges');

  // Parse exportAs.
  let exportAs: string[]|null = null;
  if (directive.has('exportAs')) {
    const expr = directive.get('exportAs')!;
    const resolved = evaluator.evaluate(expr);
    if (typeof resolved !== 'string') {
      throw createValueHasWrongTypeError(expr, resolved, `exportAs must be a string`);
    }
    exportAs = resolved.split(',').map(part => part.trim());
  }

  const rawCtorDeps = getConstructorDependencies(clazz, reflector, defaultImportRecorder, isCore);

  // Non-abstract directives (those with a selector) require valid constructor dependencies, whereas
  // abstract directives are allowed to have invalid dependencies, given that a subclass may call
  // the constructor explicitly.
  const ctorDeps = selector !== null ? validateConstructorDependencies(clazz, rawCtorDeps) :
                                       unwrapConstructorDependencies(rawCtorDeps);

  // Structural directives must have a `TemplateRef` dependency.
  const isStructural = ctorDeps !== null && ctorDeps !== 'invalid' &&
      ctorDeps.some(
          dep => (dep.token instanceof ExternalExpr) &&
              dep.token.value.moduleName === '@angular/core' &&
              dep.token.value.name === 'TemplateRef');

  // Detect if the component inherits from another class
  const usesInheritance = reflector.hasBaseClass(clazz);
  const type = wrapTypeReference(reflector, clazz);
  const internalType = new WrappedNodeExpr(reflector.getInternalNameOfClass(clazz));

  const inputs = ClassPropertyMapping.fromMappedObject({...inputsFromMeta, ...inputsFromFields});
  const outputs = ClassPropertyMapping.fromMappedObject({...outputsFromMeta, ...outputsFromFields});

  const metadata: R3DirectiveMetadata = {
    name: clazz.name.text,
    deps: ctorDeps,
    host,
    lifecycle: {
      usesOnChanges,
    },
    inputs: inputs.toJointMappedObject(),
    outputs: outputs.toDirectMappedObject(),
    queries,
    viewQueries,
    selector,
    fullInheritance: !!(flags & HandlerFlags.FULL_INHERITANCE),
    type,
    internalType,
    typeArgumentCount: reflector.getGenericArityOfClass(clazz) || 0,
    typeSourceSpan: createSourceSpan(clazz.name),
    usesInheritance,
    exportAs,
    providers
  };
  return {
    decorator: directive,
    metadata,
    inputs,
    outputs,
    isStructural,
  };
}

export function extractQueryMetadata(
    exprNode: ts.Node, name: string, args: ReadonlyArray<ts.Expression>, propertyName: string,
    reflector: ReflectionHost, evaluator: PartialEvaluator): R3QueryMetadata {
  if (args.length === 0) {
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARITY_WRONG, exprNode, `@${name} must have arguments`);
  }
  const first = name === 'ViewChild' || name === 'ContentChild';
  const node = unwrapForwardRef(args[0], reflector);
  const arg = evaluator.evaluate(node);

  /** Whether or not this query should collect only static results (see view/api.ts)  */
  let isStatic: boolean = false;

  // Extract the predicate
  let predicate: Expression|string[]|null = null;
  if (arg instanceof Reference || arg instanceof DynamicValue) {
    // References and predicates that could not be evaluated statically are emitted as is.
    predicate = new WrappedNodeExpr(node);
  } else if (typeof arg === 'string') {
    predicate = [arg];
  } else if (isStringArrayOrDie(arg, `@${name} predicate`, node)) {
    predicate = arg;
  } else {
    throw createValueHasWrongTypeError(node, arg, `@${name} predicate cannot be interpreted`);
  }

  // Extract the read and descendants options.
  let read: Expression|null = null;
  // The default value for descendants is true for every decorator except @ContentChildren.
  let descendants: boolean = name !== 'ContentChildren';
  let emitDistinctChangesOnly: boolean = emitDistinctChangesOnlyDefaultValue;
  if (args.length === 2) {
    const optionsExpr = unwrapExpression(args[1]);
    if (!ts.isObjectLiteralExpression(optionsExpr)) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL, optionsExpr,
          `@${name} options must be an object literal`);
    }
    const options = reflectObjectLiteral(optionsExpr);
    if (options.has('read')) {
      read = new WrappedNodeExpr(options.get('read')!);
    }

    if (options.has('descendants')) {
      const descendantsExpr = options.get('descendants')!;
      const descendantsValue = evaluator.evaluate(descendantsExpr);
      if (typeof descendantsValue !== 'boolean') {
        throw createValueHasWrongTypeError(
            descendantsExpr, descendantsValue, `@${name} options.descendants must be a boolean`);
      }
      descendants = descendantsValue;
    }

    if (options.has('emitDistinctChangesOnly')) {
      const emitDistinctChangesOnlyExpr = options.get('emitDistinctChangesOnly')!;
      const emitDistinctChangesOnlyValue = evaluator.evaluate(emitDistinctChangesOnlyExpr);
      if (typeof emitDistinctChangesOnlyValue !== 'boolean') {
        throw createValueHasWrongTypeError(
            emitDistinctChangesOnlyExpr, emitDistinctChangesOnlyValue,
            `@${name} options.emitDistinctChangesOnly must be a boolean`);
      }
      emitDistinctChangesOnly = emitDistinctChangesOnlyValue;
    }

    if (options.has('static')) {
      const staticValue = evaluator.evaluate(options.get('static')!);
      if (typeof staticValue !== 'boolean') {
        throw createValueHasWrongTypeError(
            node, staticValue, `@${name} options.static must be a boolean`);
      }
      isStatic = staticValue;
    }

  } else if (args.length > 2) {
    // Too many arguments.
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARITY_WRONG, node, `@${name} has too many arguments`);
  }

  return {
    propertyName,
    predicate,
    first,
    descendants,
    read,
    static: isStatic,
    emitDistinctChangesOnly,
  };
}

export function extractQueriesFromDecorator(
    queryData: ts.Expression, reflector: ReflectionHost, evaluator: PartialEvaluator,
    isCore: boolean): {
  content: R3QueryMetadata[],
  view: R3QueryMetadata[],
} {
  const content: R3QueryMetadata[] = [], view: R3QueryMetadata[] = [];
  if (!ts.isObjectLiteralExpression(queryData)) {
    throw new FatalDiagnosticError(
        ErrorCode.VALUE_HAS_WRONG_TYPE, queryData,
        'Decorator queries metadata must be an object literal');
  }
  reflectObjectLiteral(queryData).forEach((queryExpr, propertyName) => {
    queryExpr = unwrapExpression(queryExpr);
    if (!ts.isNewExpression(queryExpr)) {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, queryData,
          'Decorator query metadata must be an instance of a query type');
    }
    const queryType = ts.isPropertyAccessExpression(queryExpr.expression) ?
        queryExpr.expression.name :
        queryExpr.expression;
    if (!ts.isIdentifier(queryType)) {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, queryData,
          'Decorator query metadata must be an instance of a query type');
    }
    const type = reflector.getImportOfIdentifier(queryType);
    if (type === null || (!isCore && type.from !== '@angular/core') ||
        !QUERY_TYPES.has(type.name)) {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, queryData,
          'Decorator query metadata must be an instance of a query type');
    }

    const query = extractQueryMetadata(
        queryExpr, type.name, queryExpr.arguments || [], propertyName, reflector, evaluator);
    if (type.name.startsWith('Content')) {
      content.push(query);
    } else {
      view.push(query);
    }
  });
  return {content, view};
}

function isStringArrayOrDie(value: any, name: string, node: ts.Expression): value is string[] {
  if (!Array.isArray(value)) {
    return false;
  }

  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== 'string') {
      throw createValueHasWrongTypeError(
          node, value[i], `Failed to resolve ${name} at position ${i} to a string`);
    }
  }
  return true;
}

export function parseFieldArrayValue(
    directive: Map<string, ts.Expression>, field: string, evaluator: PartialEvaluator): null|
    string[] {
  if (!directive.has(field)) {
    return null;
  }

  // Resolve the field of interest from the directive metadata to a string[].
  const expression = directive.get(field)!;
  const value = evaluator.evaluate(expression);
  if (!isStringArrayOrDie(value, field, expression)) {
    throw createValueHasWrongTypeError(
        expression, value, `Failed to resolve @Directive.${field} to a string array`);
  }

  return value;
}

/**
 * Interpret property mapping fields on the decorator (e.g. inputs or outputs) and return the
 * correctly shaped metadata object.
 */
function parseFieldToPropertyMapping(
    directive: Map<string, ts.Expression>, field: string,
    evaluator: PartialEvaluator): {[field: string]: string} {
  const metaValues = parseFieldArrayValue(directive, field, evaluator);
  if (!metaValues) {
    return EMPTY_OBJECT;
  }

  return metaValues.reduce((results, value) => {
    // Either the value is 'field' or 'field: property'. In the first case, `property` will
    // be undefined, in which case the field name should also be used as the property name.
    const [field, property] = value.split(':', 2).map(str => str.trim());
    results[field] = property || field;
    return results;
  }, {} as {[field: string]: string});
}

/**
 * Parse property decorators (e.g. `Input` or `Output`) and return the correctly shaped metadata
 * object.
 */
function parseDecoratedFields(
    fields: {member: ClassMember, decorators: Decorator[]}[], evaluator: PartialEvaluator,
    mapValueResolver: (publicName: string, internalName: string) =>
        string | [string, string]): {[field: string]: string|[string, string]} {
  return fields.reduce((results, field) => {
    const fieldName = field.member.name;
    field.decorators.forEach(decorator => {
      // The decorator either doesn't have an argument (@Input()) in which case the property
      // name is used, or it has one argument (@Output('named')).
      if (decorator.args == null || decorator.args.length === 0) {
        results[fieldName] = fieldName;
      } else if (decorator.args.length === 1) {
        const property = evaluator.evaluate(decorator.args[0]);
        if (typeof property !== 'string') {
          throw createValueHasWrongTypeError(
              Decorator.nodeForError(decorator), property,
              `@${decorator.name} decorator argument must resolve to a string`);
        }
        results[fieldName] = mapValueResolver(property, fieldName);
      } else {
        // Too many arguments.
        throw new FatalDiagnosticError(
            ErrorCode.DECORATOR_ARITY_WRONG, Decorator.nodeForError(decorator),
            `@${decorator.name} can have at most one argument, got ${
                decorator.args.length} argument(s)`);
      }
    });
    return results;
  }, {} as {[field: string]: string | [string, string]});
}

function resolveInput(publicName: string, internalName: string): [string, string] {
  return [publicName, internalName];
}

function resolveOutput(publicName: string, internalName: string) {
  return publicName;
}

export function queriesFromFields(
    fields: {member: ClassMember, decorators: Decorator[]}[], reflector: ReflectionHost,
    evaluator: PartialEvaluator): R3QueryMetadata[] {
  return fields.map(({member, decorators}) => {
    const decorator = decorators[0];
    const node = member.node || Decorator.nodeForError(decorator);

    // Throw in case of `@Input() @ContentChild('foo') foo: any`, which is not supported in Ivy
    if (member.decorators!.some(v => v.name === 'Input')) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_COLLISION, node,
          'Cannot combine @Input decorators with query decorators');
    }
    if (decorators.length !== 1) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_COLLISION, node,
          'Cannot have multiple query decorators on the same class member');
    } else if (!isPropertyTypeMember(member)) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_UNEXPECTED, node,
          'Query decorator must go on a property-type member');
    }
    return extractQueryMetadata(
        node, decorator.name, decorator.args || [], member.name, reflector, evaluator);
  });
}

function isPropertyTypeMember(member: ClassMember): boolean {
  return member.kind === ClassMemberKind.Getter || member.kind === ClassMemberKind.Setter ||
      member.kind === ClassMemberKind.Property;
}

type StringMap<T> = {
  [key: string]: T;
};

function evaluateHostExpressionBindings(
    hostExpr: ts.Expression, evaluator: PartialEvaluator): ParsedHostBindings {
  const hostMetaMap = evaluator.evaluate(hostExpr);
  if (!(hostMetaMap instanceof Map)) {
    throw createValueHasWrongTypeError(
        hostExpr, hostMetaMap, `Decorator host metadata must be an object`);
  }
  const hostMetadata: StringMap<string|Expression> = {};
  hostMetaMap.forEach((value, key) => {
    // Resolve Enum references to their declared value.
    if (value instanceof EnumValue) {
      value = value.resolved;
    }

    if (typeof key !== 'string') {
      throw createValueHasWrongTypeError(
          hostExpr, key,
          `Decorator host metadata must be a string -> string object, but found unparseable key`);
    }

    if (typeof value == 'string') {
      hostMetadata[key] = value;
    } else if (value instanceof DynamicValue) {
      hostMetadata[key] = new WrappedNodeExpr(value.node as ts.Expression);
    } else {
      throw createValueHasWrongTypeError(
          hostExpr, value,
          `Decorator host metadata must be a string -> string object, but found unparseable value`);
    }
  });

  const bindings = parseHostBindings(hostMetadata);

  const errors = verifyHostBindings(bindings, createSourceSpan(hostExpr));
  if (errors.length > 0) {
    throw new FatalDiagnosticError(
        // TODO: provide more granular diagnostic and output specific host expression that
        // triggered an error instead of the whole host object.
        ErrorCode.HOST_BINDING_PARSE_ERROR, hostExpr,
        errors.map((error: ParseError) => error.msg).join('\n'));
  }

  return bindings;
}

export function extractHostBindings(
    members: ClassMember[], evaluator: PartialEvaluator, coreModule: string|undefined,
    metadata?: Map<string, ts.Expression>): ParsedHostBindings {
  let bindings: ParsedHostBindings;
  if (metadata && metadata.has('host')) {
    bindings = evaluateHostExpressionBindings(metadata.get('host')!, evaluator);
  } else {
    bindings = parseHostBindings({});
  }

  filterToMembersWithDecorator(members, 'HostBinding', coreModule)
      .forEach(({member, decorators}) => {
        decorators.forEach(decorator => {
          let hostPropertyName: string = member.name;
          if (decorator.args !== null && decorator.args.length > 0) {
            if (decorator.args.length !== 1) {
              throw new FatalDiagnosticError(
                  ErrorCode.DECORATOR_ARITY_WRONG, Decorator.nodeForError(decorator),
                  `@HostBinding can have at most one argument, got ${
                      decorator.args.length} argument(s)`);
            }

            const resolved = evaluator.evaluate(decorator.args[0]);
            if (typeof resolved !== 'string') {
              throw createValueHasWrongTypeError(
                  Decorator.nodeForError(decorator), resolved,
                  `@HostBinding's argument must be a string`);
            }

            hostPropertyName = resolved;
          }

          // Since this is a decorator, we know that the value is a class member. Always access it
          // through `this` so that further down the line it can't be confused for a literal value
          // (e.g. if there's a property called `true`). There is no size penalty, because all
          // values (except literals) are converted to `ctx.propName` eventually.
          bindings.properties[hostPropertyName] = getSafePropertyAccessString('this', member.name);
        });
      });

  filterToMembersWithDecorator(members, 'HostListener', coreModule)
      .forEach(({member, decorators}) => {
        decorators.forEach(decorator => {
          let eventName: string = member.name;
          let args: string[] = [];
          if (decorator.args !== null && decorator.args.length > 0) {
            if (decorator.args.length > 2) {
              throw new FatalDiagnosticError(
                  ErrorCode.DECORATOR_ARITY_WRONG, decorator.args[2],
                  `@HostListener can have at most two arguments`);
            }

            const resolved = evaluator.evaluate(decorator.args[0]);
            if (typeof resolved !== 'string') {
              throw createValueHasWrongTypeError(
                  decorator.args[0], resolved,
                  `@HostListener's event name argument must be a string`);
            }

            eventName = resolved;

            if (decorator.args.length === 2) {
              const expression = decorator.args[1];
              const resolvedArgs = evaluator.evaluate(decorator.args[1]);
              if (!isStringArrayOrDie(resolvedArgs, '@HostListener.args', expression)) {
                throw createValueHasWrongTypeError(
                    decorator.args[1], resolvedArgs,
                    `@HostListener's second argument must be a string array`);
              }
              args = resolvedArgs;
            }
          }

          bindings.listeners[eventName] = `${member.name}(${args.join(',')})`;
        });
      });
  return bindings;
}

const QUERY_TYPES = new Set([
  'ContentChild',
  'ContentChildren',
  'ViewChild',
  'ViewChildren',
]);
