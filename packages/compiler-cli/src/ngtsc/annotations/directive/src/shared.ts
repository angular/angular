/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  createMayBeForwardRefExpression,
  emitDistinctChangesOnlyDefaultValue,
  Expression,
  ExternalExpr,
  ExternalReference,
  ForwardRefHandling,
  getSafePropertyAccessString,
  MaybeForwardRefExpression,
  ParsedHostBindings,
  ParseError,
  parseHostBindings,
  R3DirectiveMetadata,
  R3HostDirectiveMetadata,
  R3InputMetadata,
  R3QueryMetadata,
  R3Reference,
  verifyHostBindings,
  WrappedNodeExpr,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError, makeRelatedInformation} from '../../../diagnostics';
import {
  assertSuccessfulReferenceEmit,
  ImportedSymbolsTracker,
  ImportFlags,
  Reference,
  ReferenceEmitter,
} from '../../../imports';
import {
  ClassPropertyMapping,
  DecoratorInputTransform,
  HostDirectiveMeta,
  InputMapping,
  InputOrOutput,
  isHostDirectiveMetaForGlobalMode,
  Resource,
} from '../../../metadata';
import {
  DynamicValue,
  EnumValue,
  ForeignFunctionResolver,
  PartialEvaluator,
  ResolvedValue,
  traceDynamicValue,
} from '../../../partial_evaluator';
import {
  AmbientImport,
  ClassDeclaration,
  ClassMember,
  ClassMemberKind,
  Decorator,
  filterToMembersWithDecorator,
  isNamedClassDeclaration,
  ReflectionHost,
  reflectObjectLiteral,
} from '../../../reflection';
import {CompilationMode} from '../../../transform';
import {
  assertLocalCompilationUnresolvedConst,
  createForwardRefResolver,
  createSourceSpan,
  createValueHasWrongTypeError,
  getAngularDecorators,
  getConstructorDependencies,
  isAngularDecorator,
  ReferencesRegistry,
  toR3Reference,
  tryUnwrapForwardRef,
  unwrapConstructorDependencies,
  unwrapExpression,
  validateConstructorDependencies,
  wrapFunctionExpressionsInParens,
  wrapTypeReference,
} from '../../common';

import {tryParseSignalInputMapping} from './input_function';
import {tryParseSignalModelMapping} from './model_function';
import {tryParseInitializerBasedOutput} from './output_function';
import {tryParseSignalQueryFromInitializer} from './query_functions';

const EMPTY_OBJECT: {[key: string]: string} = {};

type QueryDecoratorName = 'ViewChild' | 'ViewChildren' | 'ContentChild' | 'ContentChildren';
export const queryDecoratorNames: QueryDecoratorName[] = [
  'ViewChild',
  'ViewChildren',
  'ContentChild',
  'ContentChildren',
];

export interface HostBindingNodes {
  literal: ts.ObjectLiteralExpression | null;
  bindingDecorators: Set<ts.Decorator>;
  listenerDecorators: Set<ts.Decorator>;
}

const QUERY_TYPES = new Set<string>(queryDecoratorNames);

/**
 * Helper function to extract metadata from a `Directive` or `Component`. `Directive`s without a
 * selector are allowed to be used for abstract base classes. These abstract directives should not
 * appear in the declarations of an `NgModule` and additional verification is done when processing
 * the module.
 */
export function extractDirectiveMetadata(
  clazz: ClassDeclaration,
  decorator: Readonly<Decorator>,
  reflector: ReflectionHost,
  importTracker: ImportedSymbolsTracker,
  evaluator: PartialEvaluator,
  refEmitter: ReferenceEmitter,
  referencesRegistry: ReferencesRegistry,
  isCore: boolean,
  annotateForClosureCompiler: boolean,
  compilationMode: CompilationMode,
  defaultSelector: string | null,
  strictStandalone: boolean,
  implicitStandaloneValue: boolean,
  emitDeclarationOnly: boolean,
):
  | {
      jitForced: false;
      decorator: Map<string, ts.Expression>;
      metadata: R3DirectiveMetadata;
      inputs: ClassPropertyMapping<InputMapping>;
      outputs: ClassPropertyMapping;
      isStructural: boolean;
      hostDirectives: HostDirectiveMeta[] | null;
      rawHostDirectives: ts.Expression | null;
      inputFieldNamesFromMetadataArray: Set<string>;
      hostBindingNodes: HostBindingNodes;
    }
  | {jitForced: true} {
  let directive: Map<string, ts.Expression>;
  if (decorator.args === null || decorator.args.length === 0) {
    directive = new Map<string, ts.Expression>();
  } else if (decorator.args.length !== 1) {
    throw new FatalDiagnosticError(
      ErrorCode.DECORATOR_ARITY_WRONG,
      decorator.node,
      `Incorrect number of arguments to @${decorator.name} decorator`,
    );
  } else {
    const meta = unwrapExpression(decorator.args[0]);
    if (!ts.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARG_NOT_LITERAL,
        meta,
        `@${decorator.name} argument must be an object literal`,
      );
    }
    directive = reflectObjectLiteral(meta);
  }

  if (directive.has('jit')) {
    // The only allowed value is true, so there's no need to expand further.
    return {jitForced: true};
  }

  const members = reflector.getMembersOfClass(clazz);

  // Precompute a list of ts.ClassElements that have decorators. This includes things like @Input,
  // @Output, @HostBinding, etc.
  const decoratedElements = members.filter(
    (member) => !member.isStatic && member.decorators !== null,
  );

  const coreModule = isCore ? undefined : '@angular/core';

  // Construct the map of inputs both from the @Directive/@Component
  // decorator, and the decorated fields.
  const inputsFromMeta = parseInputsArray(
    clazz,
    directive,
    evaluator,
    reflector,
    refEmitter,
    compilationMode,
    emitDeclarationOnly,
  );
  const inputsFromFields = parseInputFields(
    clazz,
    members,
    evaluator,
    reflector,
    importTracker,
    refEmitter,
    isCore,
    compilationMode,
    inputsFromMeta,
    decorator,
    emitDeclarationOnly,
  );
  const inputs = ClassPropertyMapping.fromMappedObject({...inputsFromMeta, ...inputsFromFields});

  // And outputs.
  const outputsFromMeta = parseOutputsArray(directive, evaluator);
  const outputsFromFields = parseOutputFields(
    clazz,
    decorator,
    members,
    isCore,
    reflector,
    importTracker,
    evaluator,
    outputsFromMeta,
  );
  const outputs = ClassPropertyMapping.fromMappedObject({...outputsFromMeta, ...outputsFromFields});

  // Parse queries of fields.
  const {viewQueries, contentQueries} = parseQueriesOfClassFields(
    members,
    reflector,
    importTracker,
    evaluator,
    isCore,
  );

  if (directive.has('queries')) {
    const signalQueryFields = new Set(
      [...viewQueries, ...contentQueries].filter((q) => q.isSignal).map((q) => q.propertyName),
    );
    const queriesFromDecorator = extractQueriesFromDecorator(
      directive.get('queries')!,
      reflector,
      evaluator,
      isCore,
    );

    // Checks if the query is already declared/reserved via class members declaration.
    // If so, we throw a fatal diagnostic error to prevent this unintentional pattern.
    const checkAndUnwrapQuery = (q: {expr: ts.Expression; metadata: R3QueryMetadata}) => {
      if (signalQueryFields.has(q.metadata.propertyName)) {
        throw new FatalDiagnosticError(
          ErrorCode.INITIALIZER_API_DECORATOR_METADATA_COLLISION,
          q.expr,
          `Query is declared multiple times. "@${decorator.name}" declares a query for the same property.`,
        );
      }
      return q.metadata;
    };

    contentQueries.push(...queriesFromDecorator.content.map((q) => checkAndUnwrapQuery(q)));
    viewQueries.push(...queriesFromDecorator.view.map((q) => checkAndUnwrapQuery(q)));
  }

  // Parse the selector.
  let selector = defaultSelector;
  if (directive.has('selector')) {
    const expr = directive.get('selector')!;
    const resolved = evaluator.evaluate(expr);
    assertLocalCompilationUnresolvedConst(
      compilationMode,
      resolved,
      null,
      'Unresolved identifier found for @Component.selector field! Did you ' +
        'import this identifier from a file outside of the compilation unit? ' +
        'This is not allowed when Angular compiler runs in local mode. Possible ' +
        'solutions: 1) Move the declarations into a file within the compilation ' +
        'unit, 2) Inline the selector',
    );
    if (typeof resolved !== 'string') {
      throw createValueHasWrongTypeError(expr, resolved, `selector must be a string`);
    }
    // use default selector in case selector is an empty string
    selector = resolved === '' ? defaultSelector : resolved;
    if (!selector) {
      throw new FatalDiagnosticError(
        ErrorCode.DIRECTIVE_MISSING_SELECTOR,
        expr,
        `Directive ${clazz.name.text} has no selector, please add it!`,
      );
    }
  }

  const hostBindingNodes: HostBindingNodes = {
    literal: null,
    bindingDecorators: new Set<ts.Decorator>(),
    listenerDecorators: new Set<ts.Decorator>(),
  };

  const host = extractHostBindings(
    decoratedElements,
    evaluator,
    coreModule,
    compilationMode,
    hostBindingNodes,
    directive,
  );

  const providers: Expression | null = directive.has('providers')
    ? new WrappedNodeExpr(
        annotateForClosureCompiler
          ? wrapFunctionExpressionsInParens(directive.get('providers')!)
          : directive.get('providers')!,
      )
    : null;

  // Determine if `ngOnChanges` is a lifecycle hook defined on the component.
  const usesOnChanges = members.some(
    (member) =>
      !member.isStatic && member.kind === ClassMemberKind.Method && member.name === 'ngOnChanges',
  );

  // Parse exportAs.
  let exportAs: string[] | null = null;
  if (directive.has('exportAs')) {
    const expr = directive.get('exportAs')!;
    const resolved = evaluator.evaluate(expr);

    assertLocalCompilationUnresolvedConst(
      compilationMode,
      resolved,
      null,
      'Unresolved identifier found for exportAs field! Did you import this ' +
        'identifier from a file outside of the compilation unit? This is not ' +
        'allowed when Angular compiler runs in local mode. Possible solutions: ' +
        '1) Move the declarations into a file within the compilation unit, ' +
        '2) Inline the selector',
    );

    if (typeof resolved !== 'string') {
      throw createValueHasWrongTypeError(expr, resolved, `exportAs must be a string`);
    }
    exportAs = resolved.split(',').map((part) => part.trim());
  }

  const rawCtorDeps = getConstructorDependencies(clazz, reflector, isCore);

  // Non-abstract directives (those with a selector) require valid constructor dependencies, whereas
  // abstract directives are allowed to have invalid dependencies, given that a subclass may call
  // the constructor explicitly.
  const ctorDeps =
    selector !== null
      ? validateConstructorDependencies(clazz, rawCtorDeps)
      : unwrapConstructorDependencies(rawCtorDeps);

  // Structural directives must have a `TemplateRef` dependency.
  const isStructural =
    ctorDeps !== null &&
    ctorDeps !== 'invalid' &&
    ctorDeps.some(
      (dep) =>
        dep.token instanceof ExternalExpr &&
        dep.token.value.moduleName === '@angular/core' &&
        dep.token.value.name === 'TemplateRef',
    );

  let isStandalone = implicitStandaloneValue;
  if (directive.has('standalone')) {
    const expr = directive.get('standalone')!;
    const resolved = evaluator.evaluate(expr);
    if (typeof resolved !== 'boolean') {
      throw createValueHasWrongTypeError(expr, resolved, `standalone flag must be a boolean`);
    }
    isStandalone = resolved;

    if (!isStandalone && strictStandalone) {
      throw new FatalDiagnosticError(
        ErrorCode.NON_STANDALONE_NOT_ALLOWED,
        expr,
        `Only standalone components/directives are allowed when 'strictStandalone' is enabled.`,
      );
    }
  }
  let isSignal = false;
  if (directive.has('signals')) {
    const expr = directive.get('signals')!;
    const resolved = evaluator.evaluate(expr);
    if (typeof resolved !== 'boolean') {
      throw createValueHasWrongTypeError(expr, resolved, `signals flag must be a boolean`);
    }
    isSignal = resolved;
  }

  // Detect if the component inherits from another class
  const usesInheritance = reflector.hasBaseClass(clazz);
  const sourceFile = clazz.getSourceFile();
  const type = wrapTypeReference(reflector, clazz);

  const rawHostDirectives = directive.get('hostDirectives') || null;
  const hostDirectives =
    rawHostDirectives === null
      ? null
      : extractHostDirectives(
          rawHostDirectives,
          evaluator,
          reflector,
          compilationMode,
          createForwardRefResolver(isCore),
          emitDeclarationOnly,
        );

  if (compilationMode !== CompilationMode.LOCAL && hostDirectives !== null) {
    // In global compilation mode where we do type checking, the template type-checker will need to
    // import host directive types, so add them as referenced by `clazz`. This will ensure that
    // libraries are required to export host directives which are visible from publicly exported
    // components.
    referencesRegistry.add(
      clazz,
      ...hostDirectives.map((hostDir) => {
        if (!isHostDirectiveMetaForGlobalMode(hostDir)) {
          throw new Error('Impossible state');
        }

        return hostDir.directive;
      }),
    );
  }

  const metadata: R3DirectiveMetadata = {
    name: clazz.name.text,
    deps: ctorDeps,
    host: {
      ...host,
    },
    lifecycle: {
      usesOnChanges,
    },
    inputs: inputs.toJointMappedObject(toR3InputMetadata),
    outputs: outputs.toDirectMappedObject(),
    queries: contentQueries,
    viewQueries,
    selector,
    fullInheritance: false,
    type,
    typeArgumentCount: reflector.getGenericArityOfClass(clazz) || 0,
    typeSourceSpan: createSourceSpan(clazz.name),
    usesInheritance,
    exportAs,
    providers,
    isStandalone,
    isSignal,
    hostDirectives:
      hostDirectives?.map((hostDir) => toHostDirectiveMetadata(hostDir, sourceFile, refEmitter)) ||
      null,
  };
  return {
    jitForced: false,
    decorator: directive,
    metadata,
    inputs,
    outputs,
    isStructural,
    hostDirectives,
    rawHostDirectives,
    hostBindingNodes,
    // Track inputs from class metadata. This is useful for migration efforts.
    inputFieldNamesFromMetadataArray: new Set(
      Object.values(inputsFromMeta).map((i) => i.classPropertyName),
    ),
  };
}

export function extractDecoratorQueryMetadata(
  exprNode: ts.Node,
  name: string,
  args: ReadonlyArray<ts.Expression>,
  propertyName: string,
  reflector: ReflectionHost,
  evaluator: PartialEvaluator,
): R3QueryMetadata {
  if (args.length === 0) {
    throw new FatalDiagnosticError(
      ErrorCode.DECORATOR_ARITY_WRONG,
      exprNode,
      `@${name} must have arguments`,
    );
  }
  const first = name === 'ViewChild' || name === 'ContentChild';
  const forwardReferenceTarget = tryUnwrapForwardRef(args[0], reflector);
  const node = forwardReferenceTarget ?? args[0];

  const arg = evaluator.evaluate(node);

  /** Whether or not this query should collect only static results (see view/api.ts)  */
  let isStatic: boolean = false;

  // Extract the predicate
  let predicate: MaybeForwardRefExpression | string[] | null = null;
  if (arg instanceof Reference || arg instanceof DynamicValue) {
    // References and predicates that could not be evaluated statically are emitted as is.
    predicate = createMayBeForwardRefExpression(
      new WrappedNodeExpr(node),
      forwardReferenceTarget !== null ? ForwardRefHandling.Unwrapped : ForwardRefHandling.None,
    );
  } else if (typeof arg === 'string') {
    predicate = [arg];
  } else if (isStringArrayOrDie(arg, `@${name} predicate`, node)) {
    predicate = arg;
  } else {
    throw createValueHasWrongTypeError(node, arg, `@${name} predicate cannot be interpreted`);
  }

  // Extract the read and descendants options.
  let read: Expression | null = null;
  // The default value for descendants is true for every decorator except @ContentChildren.
  let descendants: boolean = name !== 'ContentChildren';
  let emitDistinctChangesOnly: boolean = emitDistinctChangesOnlyDefaultValue;
  if (args.length === 2) {
    const optionsExpr = unwrapExpression(args[1]);
    if (!ts.isObjectLiteralExpression(optionsExpr)) {
      throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARG_NOT_LITERAL,
        optionsExpr,
        `@${name} options must be an object literal`,
      );
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
          descendantsExpr,
          descendantsValue,
          `@${name} options.descendants must be a boolean`,
        );
      }
      descendants = descendantsValue;
    }

    if (options.has('emitDistinctChangesOnly')) {
      const emitDistinctChangesOnlyExpr = options.get('emitDistinctChangesOnly')!;
      const emitDistinctChangesOnlyValue = evaluator.evaluate(emitDistinctChangesOnlyExpr);
      if (typeof emitDistinctChangesOnlyValue !== 'boolean') {
        throw createValueHasWrongTypeError(
          emitDistinctChangesOnlyExpr,
          emitDistinctChangesOnlyValue,
          `@${name} options.emitDistinctChangesOnly must be a boolean`,
        );
      }
      emitDistinctChangesOnly = emitDistinctChangesOnlyValue;
    }

    if (options.has('static')) {
      const staticValue = evaluator.evaluate(options.get('static')!);
      if (typeof staticValue !== 'boolean') {
        throw createValueHasWrongTypeError(
          node,
          staticValue,
          `@${name} options.static must be a boolean`,
        );
      }
      isStatic = staticValue;
    }
  } else if (args.length > 2) {
    // Too many arguments.
    throw new FatalDiagnosticError(
      ErrorCode.DECORATOR_ARITY_WRONG,
      node,
      `@${name} has too many arguments`,
    );
  }

  return {
    isSignal: false,
    propertyName,
    predicate,
    first,
    descendants,
    read,
    static: isStatic,
    emitDistinctChangesOnly,
  };
}

function extractHostBindings(
  members: ClassMember[],
  evaluator: PartialEvaluator,
  coreModule: string | undefined,
  compilationMode: CompilationMode,
  hostBindingNodes: HostBindingNodes,
  metadata?: Map<string, ts.Expression>,
): ParsedHostBindings {
  let bindings: ParsedHostBindings;
  if (metadata && metadata.has('host')) {
    const hostExpression = metadata.get('host')!;
    bindings = evaluateHostExpressionBindings(hostExpression, evaluator);
    if (ts.isObjectLiteralExpression(hostExpression)) {
      hostBindingNodes.literal = hostExpression;
    }
  } else {
    bindings = parseHostBindings({});
  }

  filterToMembersWithDecorator(members, 'HostBinding', coreModule).forEach(
    ({member, decorators}) => {
      decorators.forEach((decorator) => {
        let hostPropertyName: string = member.name;
        if (decorator.args !== null && decorator.args.length > 0) {
          if (decorator.args.length !== 1) {
            throw new FatalDiagnosticError(
              ErrorCode.DECORATOR_ARITY_WRONG,
              decorator.node,
              `@HostBinding can have at most one argument, got ${decorator.args.length} argument(s)`,
            );
          }

          const resolved = evaluator.evaluate(decorator.args[0]);

          // Specific error for local compilation mode if the argument cannot be resolved
          assertLocalCompilationUnresolvedConst(
            compilationMode,
            resolved,
            null,
            "Unresolved identifier found for @HostBinding's argument! Did " +
              'you import this identifier from a file outside of the compilation ' +
              'unit? This is not allowed when Angular compiler runs in local mode. ' +
              'Possible solutions: 1) Move the declaration into a file within ' +
              'the compilation unit, 2) Inline the argument',
          );

          if (typeof resolved !== 'string') {
            throw createValueHasWrongTypeError(
              decorator.node,
              resolved,
              `@HostBinding's argument must be a string`,
            );
          }

          hostPropertyName = resolved;
        }

        if (ts.isDecorator(decorator.node)) {
          hostBindingNodes.bindingDecorators.add(decorator.node);
        }

        // Since this is a decorator, we know that the value is a class member. Always access it
        // through `this` so that further down the line it can't be confused for a literal value
        // (e.g. if there's a property called `true`). There is no size penalty, because all
        // values (except literals) are converted to `ctx.propName` eventually.
        bindings.properties[hostPropertyName] = getSafePropertyAccessString('this', member.name);
      });
    },
  );

  filterToMembersWithDecorator(members, 'HostListener', coreModule).forEach(
    ({member, decorators}) => {
      decorators.forEach((decorator) => {
        let eventName: string = member.name;
        let args: string[] = [];
        if (decorator.args !== null && decorator.args.length > 0) {
          if (decorator.args.length > 2) {
            throw new FatalDiagnosticError(
              ErrorCode.DECORATOR_ARITY_WRONG,
              decorator.args[2],
              `@HostListener can have at most two arguments`,
            );
          }

          const resolved = evaluator.evaluate(decorator.args[0]);

          // Specific error for local compilation mode if the event name cannot be resolved
          assertLocalCompilationUnresolvedConst(
            compilationMode,
            resolved,
            null,
            "Unresolved identifier found for @HostListener's event name " +
              'argument! Did you import this identifier from a file outside of ' +
              'the compilation unit? This is not allowed when Angular compiler ' +
              'runs in local mode. Possible solutions: 1) Move the declaration ' +
              'into a file within the compilation unit, 2) Inline the argument',
          );

          if (typeof resolved !== 'string') {
            throw createValueHasWrongTypeError(
              decorator.args[0],
              resolved,
              `@HostListener's event name argument must be a string`,
            );
          }

          eventName = resolved;

          if (decorator.args.length === 2) {
            const expression = decorator.args[1];
            const resolvedArgs = evaluator.evaluate(decorator.args[1]);
            if (!isStringArrayOrDie(resolvedArgs, '@HostListener.args', expression)) {
              throw createValueHasWrongTypeError(
                decorator.args[1],
                resolvedArgs,
                `@HostListener's second argument must be a string array`,
              );
            }
            args = resolvedArgs;
          }
        }

        if (ts.isDecorator(decorator.node)) {
          hostBindingNodes.listenerDecorators.add(decorator.node);
        }

        bindings.listeners[eventName] = `${member.name}(${args.join(',')})`;
      });
    },
  );
  return bindings;
}

function extractQueriesFromDecorator(
  queryData: ts.Expression,
  reflector: ReflectionHost,
  evaluator: PartialEvaluator,
  isCore: boolean,
): {
  content: {expr: ts.Expression; metadata: R3QueryMetadata}[];
  view: {expr: ts.Expression; metadata: R3QueryMetadata}[];
} {
  const content: {expr: ts.Expression; metadata: R3QueryMetadata}[] = [];
  const view: {expr: ts.Expression; metadata: R3QueryMetadata}[] = [];

  if (!ts.isObjectLiteralExpression(queryData)) {
    throw new FatalDiagnosticError(
      ErrorCode.VALUE_HAS_WRONG_TYPE,
      queryData,
      'Decorator queries metadata must be an object literal',
    );
  }
  reflectObjectLiteral(queryData).forEach((queryExpr, propertyName) => {
    queryExpr = unwrapExpression(queryExpr);
    if (!ts.isNewExpression(queryExpr)) {
      throw new FatalDiagnosticError(
        ErrorCode.VALUE_HAS_WRONG_TYPE,
        queryData,
        'Decorator query metadata must be an instance of a query type',
      );
    }
    const queryType = ts.isPropertyAccessExpression(queryExpr.expression)
      ? queryExpr.expression.name
      : queryExpr.expression;
    if (!ts.isIdentifier(queryType)) {
      throw new FatalDiagnosticError(
        ErrorCode.VALUE_HAS_WRONG_TYPE,
        queryData,
        'Decorator query metadata must be an instance of a query type',
      );
    }
    const type = reflector.getImportOfIdentifier(queryType);
    if (
      type === null ||
      (!isCore && type.from !== '@angular/core') ||
      !QUERY_TYPES.has(type.name)
    ) {
      throw new FatalDiagnosticError(
        ErrorCode.VALUE_HAS_WRONG_TYPE,
        queryData,
        'Decorator query metadata must be an instance of a query type',
      );
    }

    const query = extractDecoratorQueryMetadata(
      queryExpr,
      type.name,
      queryExpr.arguments || [],
      propertyName,
      reflector,
      evaluator,
    );
    if (type.name.startsWith('Content')) {
      content.push({expr: queryExpr, metadata: query});
    } else {
      view.push({expr: queryExpr, metadata: query});
    }
  });
  return {content, view};
}

export function parseDirectiveStyles(
  directive: Map<string, ts.Expression>,
  evaluator: PartialEvaluator,
  compilationMode: CompilationMode,
): null | string[] {
  const expression = directive.get('styles');

  if (!expression) {
    return null;
  }

  const evaluated = evaluator.evaluate(expression);
  const value = typeof evaluated === 'string' ? [evaluated] : evaluated;

  // Check if the identifier used for @Component.styles cannot be resolved in local compilation
  // mode. if the case, an error specific to this situation is generated.
  if (compilationMode === CompilationMode.LOCAL) {
    let unresolvedNode: ts.Node | null = null;
    if (Array.isArray(value)) {
      const entry = value.find((e) => e instanceof DynamicValue && e.isFromUnknownIdentifier()) as
        | DynamicValue
        | undefined;
      unresolvedNode = entry?.node ?? null;
    } else if (value instanceof DynamicValue && value.isFromUnknownIdentifier()) {
      unresolvedNode = value.node;
    }

    if (unresolvedNode !== null) {
      throw new FatalDiagnosticError(
        ErrorCode.LOCAL_COMPILATION_UNRESOLVED_CONST,
        unresolvedNode,
        'Unresolved identifier found for @Component.styles field! Did you import ' +
          'this identifier from a file outside of the compilation unit? This is ' +
          'not allowed when Angular compiler runs in local mode. Possible ' +
          'solutions: 1) Move the declarations into a file within the compilation ' +
          'unit, 2) Inline the styles, 3) Move the styles into separate files and ' +
          'include it using @Component.styleUrls',
      );
    }
  }

  if (!isStringArrayOrDie(value, 'styles', expression)) {
    throw createValueHasWrongTypeError(
      expression,
      value,
      `Failed to resolve @Component.styles to a string or an array of strings`,
    );
  }

  return value;
}

export function parseFieldStringArrayValue(
  directive: Map<string, ts.Expression>,
  field: string,
  evaluator: PartialEvaluator,
): null | string[] {
  if (!directive.has(field)) {
    return null;
  }

  // Resolve the field of interest from the directive metadata to a string[].
  const expression = directive.get(field)!;
  const value = evaluator.evaluate(expression);
  if (!isStringArrayOrDie(value, field, expression)) {
    throw createValueHasWrongTypeError(
      expression,
      value,
      `Failed to resolve @Directive.${field} to a string array`,
    );
  }

  return value;
}

function isStringArrayOrDie(value: any, name: string, node: ts.Expression): value is string[] {
  if (!Array.isArray(value)) {
    return false;
  }

  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== 'string') {
      throw createValueHasWrongTypeError(
        node,
        value[i],
        `Failed to resolve ${name} at position ${i} to a string`,
      );
    }
  }
  return true;
}

function tryGetQueryFromFieldDecorator(
  member: ClassMember,
  reflector: ReflectionHost,
  evaluator: PartialEvaluator,
  isCore: boolean,
): {name: QueryDecoratorName; decorator: Decorator; metadata: R3QueryMetadata} | null {
  const decorators = member.decorators;
  if (decorators === null) {
    return null;
  }

  const queryDecorators = getAngularDecorators(decorators, queryDecoratorNames, isCore);
  if (queryDecorators.length === 0) {
    return null;
  }
  if (queryDecorators.length !== 1) {
    throw new FatalDiagnosticError(
      ErrorCode.DECORATOR_COLLISION,
      member.node ?? queryDecorators[0].node,
      'Cannot combine multiple query decorators.',
    );
  }

  const decorator = queryDecorators[0];
  const node = member.node || decorator.node;

  // Throw in case of `@Input() @ContentChild('foo') foo: any`, which is not supported in Ivy
  if (decorators.some((v) => v.name === 'Input')) {
    throw new FatalDiagnosticError(
      ErrorCode.DECORATOR_COLLISION,
      node,
      'Cannot combine @Input decorators with query decorators',
    );
  }
  if (!isPropertyTypeMember(member)) {
    throw new FatalDiagnosticError(
      ErrorCode.DECORATOR_UNEXPECTED,
      node,
      'Query decorator must go on a property-type member',
    );
  }

  // Either the decorator was aliased, or is referenced directly with
  // the proper query name.
  const name = (decorator.import?.name ?? decorator.name) as QueryDecoratorName;

  return {
    name,
    decorator,
    metadata: extractDecoratorQueryMetadata(
      node,
      name,
      decorator.args || [],
      member.name,
      reflector,
      evaluator,
    ),
  };
}

function isPropertyTypeMember(member: ClassMember): boolean {
  return (
    member.kind === ClassMemberKind.Getter ||
    member.kind === ClassMemberKind.Setter ||
    member.kind === ClassMemberKind.Property
  );
}

function parseMappingStringArray(values: string[]) {
  return values.reduce(
    (results, value) => {
      if (typeof value !== 'string') {
        throw new Error('Mapping value must be a string');
      }

      const [bindingPropertyName, fieldName] = parseMappingString(value);
      results[fieldName] = bindingPropertyName;
      return results;
    },
    {} as {[field: string]: string},
  );
}

function parseMappingString(value: string): [bindingPropertyName: string, fieldName: string] {
  // Either the value is 'field' or 'field: property'. In the first case, `property` will
  // be undefined, in which case the field name should also be used as the property name.
  const [fieldName, bindingPropertyName] = value.split(':', 2).map((str) => str.trim());
  return [bindingPropertyName ?? fieldName, fieldName];
}

/** Parses the `inputs` array of a directive/component decorator. */
function parseInputsArray(
  clazz: ClassDeclaration,
  decoratorMetadata: Map<string, ts.Expression>,
  evaluator: PartialEvaluator,
  reflector: ReflectionHost,
  refEmitter: ReferenceEmitter,
  compilationMode: CompilationMode,
  emitDeclarationOnly: boolean,
): Record<string, InputMapping> {
  const inputsField = decoratorMetadata.get('inputs');

  if (inputsField === undefined) {
    return {};
  }

  const inputs = {} as Record<string, InputMapping>;
  const inputsArray = evaluator.evaluate(inputsField);

  if (!Array.isArray(inputsArray)) {
    throw createValueHasWrongTypeError(
      inputsField,
      inputsArray,
      `Failed to resolve @Directive.inputs to an array`,
    );
  }

  for (let i = 0; i < inputsArray.length; i++) {
    const value = inputsArray[i];

    if (typeof value === 'string') {
      // If the value is a string, we treat it as a mapping string.
      const [bindingPropertyName, classPropertyName] = parseMappingString(value);
      inputs[classPropertyName] = {
        bindingPropertyName,
        classPropertyName,
        required: false,
        transform: null,
        // Note: Signal inputs are not allowed with the array form.
        isSignal: false,
      };
    } else if (value instanceof Map) {
      // If it's a map, we treat it as a config object.
      const name = value.get('name');
      const alias = value.get('alias');
      const required = value.get('required');
      let transform: DecoratorInputTransform | null = null;

      if (typeof name !== 'string') {
        throw createValueHasWrongTypeError(
          inputsField,
          name,
          `Value at position ${i} of @Directive.inputs array must have a "name" property`,
        );
      }

      if (value.has('transform')) {
        const transformValue = value.get('transform');

        if (!(transformValue instanceof DynamicValue) && !(transformValue instanceof Reference)) {
          throw createValueHasWrongTypeError(
            inputsField,
            transformValue,
            `Transform of value at position ${i} of @Directive.inputs array must be a function`,
          );
        }

        transform = parseDecoratorInputTransformFunction(
          clazz,
          name,
          transformValue,
          reflector,
          refEmitter,
          compilationMode,
          emitDeclarationOnly,
        );
      }

      inputs[name] = {
        classPropertyName: name,
        bindingPropertyName: typeof alias === 'string' ? alias : name,
        required: required === true,
        // Note: Signal inputs are not allowed with the array form.
        isSignal: false,
        transform,
      };
    } else {
      throw createValueHasWrongTypeError(
        inputsField,
        value,
        `@Directive.inputs array can only contain strings or object literals`,
      );
    }
  }

  return inputs;
}

/** Attempts to find a given Angular decorator on the class member. */
function tryGetDecoratorOnMember(
  member: ClassMember,
  decoratorName: string,
  isCore: boolean,
): Decorator | null {
  if (member.decorators === null) {
    return null;
  }

  for (const decorator of member.decorators) {
    if (isAngularDecorator(decorator, decoratorName, isCore)) {
      return decorator;
    }
  }
  return null;
}

function tryParseInputFieldMapping(
  clazz: ClassDeclaration,
  member: ClassMember,
  evaluator: PartialEvaluator,
  reflector: ReflectionHost,
  importTracker: ImportedSymbolsTracker,
  isCore: boolean,
  refEmitter: ReferenceEmitter,
  compilationMode: CompilationMode,
  emitDeclarationOnly: boolean,
): InputMapping | null {
  const classPropertyName = member.name;

  const decorator = tryGetDecoratorOnMember(member, 'Input', isCore);
  const signalInputMapping = tryParseSignalInputMapping(member, reflector, importTracker);
  const modelInputMapping = tryParseSignalModelMapping(member, reflector, importTracker);

  if (decorator !== null && signalInputMapping !== null) {
    throw new FatalDiagnosticError(
      ErrorCode.INITIALIZER_API_WITH_DISALLOWED_DECORATOR,
      decorator.node,
      `Using @Input with a signal input is not allowed.`,
    );
  }

  if (decorator !== null && modelInputMapping !== null) {
    throw new FatalDiagnosticError(
      ErrorCode.INITIALIZER_API_WITH_DISALLOWED_DECORATOR,
      decorator.node,
      `Using @Input with a model input is not allowed.`,
    );
  }

  // Check `@Input` case.
  if (decorator !== null) {
    if (decorator.args !== null && decorator.args.length > 1) {
      throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARITY_WRONG,
        decorator.node,
        `@${decorator.name} can have at most one argument, got ${decorator.args.length} argument(s)`,
      );
    }

    const optionsNode =
      decorator.args !== null && decorator.args.length === 1 ? decorator.args[0] : undefined;
    const options = optionsNode !== undefined ? evaluator.evaluate(optionsNode) : null;
    const required = options instanceof Map ? options.get('required') === true : false;

    // To preserve old behavior: Even though TypeScript types ensure proper options are
    // passed, we sanity check for unsupported values here again.
    if (options !== null && typeof options !== 'string' && !(options instanceof Map)) {
      throw createValueHasWrongTypeError(
        decorator.node,
        options,
        `@${decorator.name} decorator argument must resolve to a string or an object literal`,
      );
    }

    let alias: string | null = null;
    if (typeof options === 'string') {
      alias = options;
    } else if (options instanceof Map && typeof options.get('alias') === 'string') {
      alias = options.get('alias') as string;
    }

    const publicInputName = alias ?? classPropertyName;

    let transform: DecoratorInputTransform | null = null;
    if (options instanceof Map && options.has('transform')) {
      const transformValue = options.get('transform');

      if (!(transformValue instanceof DynamicValue) && !(transformValue instanceof Reference)) {
        throw createValueHasWrongTypeError(
          optionsNode!,
          transformValue,
          `Input transform must be a function`,
        );
      }

      transform = parseDecoratorInputTransformFunction(
        clazz,
        classPropertyName,
        transformValue,
        reflector,
        refEmitter,
        compilationMode,
        emitDeclarationOnly,
      );
    }

    return {
      isSignal: false,
      classPropertyName,
      bindingPropertyName: publicInputName,
      transform,
      required,
    };
  }

  // Look for signal inputs. e.g. `memberName = input()`
  if (signalInputMapping !== null) {
    return signalInputMapping;
  }

  if (modelInputMapping !== null) {
    return modelInputMapping.input;
  }

  return null;
}

/** Parses the class members that declare inputs (via decorator or initializer). */
function parseInputFields(
  clazz: ClassDeclaration,
  members: ClassMember[],
  evaluator: PartialEvaluator,
  reflector: ReflectionHost,
  importTracker: ImportedSymbolsTracker,
  refEmitter: ReferenceEmitter,
  isCore: boolean,
  compilationMode: CompilationMode,
  inputsFromClassDecorator: Record<string, InputMapping>,
  classDecorator: Decorator,
  emitDeclarationOnly: boolean,
): Record<string, InputMapping> {
  const inputs = {} as Record<string, InputMapping>;

  for (const member of members) {
    const classPropertyName = member.name;
    const inputMapping = tryParseInputFieldMapping(
      clazz,
      member,
      evaluator,
      reflector,
      importTracker,
      isCore,
      refEmitter,
      compilationMode,
      emitDeclarationOnly,
    );
    if (inputMapping === null) {
      continue;
    }

    if (member.isStatic) {
      throw new FatalDiagnosticError(
        ErrorCode.INCORRECTLY_DECLARED_ON_STATIC_MEMBER,
        member.node ?? clazz,
        `Input "${member.name}" is incorrectly declared as static member of "${clazz.name.text}".`,
      );
    }

    // Validate that signal inputs are not accidentally declared in the `inputs` metadata.
    if (inputMapping.isSignal && inputsFromClassDecorator.hasOwnProperty(classPropertyName)) {
      throw new FatalDiagnosticError(
        ErrorCode.INITIALIZER_API_DECORATOR_METADATA_COLLISION,
        member.node ?? clazz,
        `Input "${member.name}" is also declared as non-signal in @${classDecorator.name}.`,
      );
    }

    inputs[classPropertyName] = inputMapping;
  }

  return inputs;
}

/**
 * Parses the `transform` function and its type for a decorator `@Input`.
 *
 * This logic verifies feasibility of extracting the transform write type
 * into a different place, so that the input write type can be captured at
 * a later point in a static acceptance member.
 *
 * Note: This is not needed for signal inputs where the transform type is
 * automatically captured in the type of the `InputSignal`.
 *
 */
export function parseDecoratorInputTransformFunction(
  clazz: ClassDeclaration,
  classPropertyName: string,
  value: DynamicValue | Reference,
  reflector: ReflectionHost,
  refEmitter: ReferenceEmitter,
  compilationMode: CompilationMode,
  emitDeclarationOnly: boolean,
): DecoratorInputTransform {
  if (emitDeclarationOnly) {
    const chain: ts.DiagnosticMessageChain = {
      messageText:
        '@Input decorators with a transform function are not supported in experimental declaration-only emission mode',
      category: ts.DiagnosticCategory.Error,
      code: 0,
      next: [
        {
          messageText: `Consider converting '${clazz.name.text}.${classPropertyName}' to an input signal`,
          category: ts.DiagnosticCategory.Message,
          code: 0,
        },
      ],
    };
    throw new FatalDiagnosticError(ErrorCode.DECORATOR_UNEXPECTED, value.node, chain);
  }
  // In local compilation mode we can skip type checking the function args. This is because usually
  // the type check is done in a separate build which runs in full compilation mode. So here we skip
  // all the diagnostics.
  if (compilationMode === CompilationMode.LOCAL) {
    const node =
      value instanceof Reference ? value.getIdentityIn(clazz.getSourceFile()) : value.node;

    // This should never be null since we know the reference originates
    // from the same file, but we null check it just in case.
    if (node === null) {
      throw createValueHasWrongTypeError(
        value.node,
        value,
        'Input transform function could not be referenced',
      );
    }

    return {
      node,
      type: new Reference(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)),
    };
  }

  const definition = reflector.getDefinitionOfFunction(value.node);

  if (definition === null) {
    throw createValueHasWrongTypeError(value.node, value, 'Input transform must be a function');
  }

  if (definition.typeParameters !== null && definition.typeParameters.length > 0) {
    throw createValueHasWrongTypeError(
      value.node,
      value,
      'Input transform function cannot be generic',
    );
  }

  if (definition.signatureCount > 1) {
    throw createValueHasWrongTypeError(
      value.node,
      value,
      'Input transform function cannot have multiple signatures',
    );
  }

  const members = reflector.getMembersOfClass(clazz);

  for (const member of members) {
    const conflictingName = `ngAcceptInputType_${classPropertyName}`;

    if (member.name === conflictingName && member.isStatic) {
      throw new FatalDiagnosticError(
        ErrorCode.CONFLICTING_INPUT_TRANSFORM,
        value.node,
        `Class cannot have both a transform function on Input ${classPropertyName} and a static member called ${conflictingName}`,
      );
    }
  }

  const node = value instanceof Reference ? value.getIdentityIn(clazz.getSourceFile()) : value.node;

  // This should never be null since we know the reference originates
  // from the same file, but we null check it just in case.
  if (node === null) {
    throw createValueHasWrongTypeError(
      value.node,
      value,
      'Input transform function could not be referenced',
    );
  }

  // Skip over `this` parameters since they're typing the context, not the actual parameter.
  // `this` parameters are guaranteed to be first if they exist, and the only to distinguish them
  // is using the name, TS doesn't have a special AST for them.
  const firstParam =
    definition.parameters[0]?.name === 'this' ? definition.parameters[1] : definition.parameters[0];

  // Treat functions with no arguments as `unknown` since returning
  // the same value from the transform function is valid.
  if (!firstParam) {
    return {
      node,
      type: new Reference(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)),
    };
  }

  // This should be caught by `noImplicitAny` already, but null check it just in case.
  if (!firstParam.type) {
    throw createValueHasWrongTypeError(
      value.node,
      value,
      'Input transform function first parameter must have a type',
    );
  }

  if (firstParam.node.dotDotDotToken) {
    throw createValueHasWrongTypeError(
      value.node,
      value,
      'Input transform function first parameter cannot be a spread parameter',
    );
  }

  assertEmittableInputType(firstParam.type, clazz.getSourceFile(), reflector, refEmitter);

  const viaModule = value instanceof Reference ? value.bestGuessOwningModule : null;
  return {node, type: new Reference(firstParam.type, viaModule)};
}

/**
 * Verifies that a type and all types contained within
 * it can be referenced in a specific context file.
 */
function assertEmittableInputType(
  type: ts.TypeNode,
  contextFile: ts.SourceFile,
  reflector: ReflectionHost,
  refEmitter: ReferenceEmitter,
): void {
  (function walk(node: ts.Node) {
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      const declaration = reflector.getDeclarationOfIdentifier(node.typeName);

      if (declaration !== null) {
        // If the type is declared in a different file, we have to check that it can be imported
        // into the context file. If they're in the same file, we need to verify that they're
        // exported, otherwise TS won't emit it to the .d.ts.
        if (declaration.node.getSourceFile() !== contextFile) {
          const emittedType = refEmitter.emit(
            new Reference(
              declaration.node,
              declaration.viaModule === AmbientImport ? AmbientImport : null,
            ),
            contextFile,
            ImportFlags.NoAliasing |
              ImportFlags.AllowTypeImports |
              ImportFlags.AllowRelativeDtsImports |
              ImportFlags.AllowAmbientReferences,
          );

          assertSuccessfulReferenceEmit(emittedType, node, 'type');
        } else if (!reflector.isStaticallyExported(declaration.node)) {
          throw new FatalDiagnosticError(
            ErrorCode.SYMBOL_NOT_EXPORTED,
            type,
            `Symbol must be exported in order to be used as the type of an Input transform function`,
            [makeRelatedInformation(declaration.node, `The symbol is declared here.`)],
          );
        }
      }
    }

    node.forEachChild(walk);
  })(type);
}

/**
 * Iterates through all specified class members and attempts to detect
 * view and content queries defined.
 *
 * Queries may be either defined via decorators, or through class member
 * initializers for signal-based queries.
 */
function parseQueriesOfClassFields(
  members: ClassMember[],
  reflector: ReflectionHost,
  importTracker: ImportedSymbolsTracker,
  evaluator: PartialEvaluator,
  isCore: boolean,
): {
  viewQueries: R3QueryMetadata[];
  contentQueries: R3QueryMetadata[];
} {
  const viewQueries: R3QueryMetadata[] = [];
  const contentQueries: R3QueryMetadata[] = [];

  // For backwards compatibility, decorator-based queries are grouped and
  // ordered in a specific way. The order needs to match with what we had in:
  // https://github.com/angular/angular/blob/8737544d6963bf664f752de273e919575cca08ac/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L94-L111.
  const decoratorViewChild: R3QueryMetadata[] = [];
  const decoratorViewChildren: R3QueryMetadata[] = [];
  const decoratorContentChild: R3QueryMetadata[] = [];
  const decoratorContentChildren: R3QueryMetadata[] = [];

  for (const member of members) {
    const decoratorQuery = tryGetQueryFromFieldDecorator(member, reflector, evaluator, isCore);
    const signalQuery = tryParseSignalQueryFromInitializer(member, reflector, importTracker);

    if (decoratorQuery !== null && signalQuery !== null) {
      throw new FatalDiagnosticError(
        ErrorCode.INITIALIZER_API_WITH_DISALLOWED_DECORATOR,
        decoratorQuery.decorator.node,
        `Using @${decoratorQuery.name} with a signal-based query is not allowed.`,
      );
    }

    const queryNode = decoratorQuery?.decorator.node ?? signalQuery?.call;
    if (queryNode !== undefined && member.isStatic) {
      throw new FatalDiagnosticError(
        ErrorCode.INCORRECTLY_DECLARED_ON_STATIC_MEMBER,
        queryNode,
        `Query is incorrectly declared on a static class member.`,
      );
    }

    if (decoratorQuery !== null) {
      switch (decoratorQuery.name) {
        case 'ViewChild':
          decoratorViewChild.push(decoratorQuery.metadata);
          break;
        case 'ViewChildren':
          decoratorViewChildren.push(decoratorQuery.metadata);
          break;
        case 'ContentChild':
          decoratorContentChild.push(decoratorQuery.metadata);
          break;
        case 'ContentChildren':
          decoratorContentChildren.push(decoratorQuery.metadata);
          break;
      }
    } else if (signalQuery !== null) {
      switch (signalQuery.name) {
        case 'viewChild':
        case 'viewChildren':
          viewQueries.push(signalQuery.metadata);
          break;
        case 'contentChild':
        case 'contentChildren':
          contentQueries.push(signalQuery.metadata);
          break;
      }
    }
  }

  return {
    viewQueries: [...viewQueries, ...decoratorViewChild, ...decoratorViewChildren],
    contentQueries: [...contentQueries, ...decoratorContentChild, ...decoratorContentChildren],
  };
}

/** Parses the `outputs` array of a directive/component. */
function parseOutputsArray(
  directive: Map<string, ts.Expression>,
  evaluator: PartialEvaluator,
): Record<string, string> {
  const metaValues = parseFieldStringArrayValue(directive, 'outputs', evaluator);
  return metaValues ? parseMappingStringArray(metaValues) : EMPTY_OBJECT;
}

/** Parses the class members that are outputs. */
function parseOutputFields(
  clazz: ClassDeclaration,
  classDecorator: Decorator,
  members: ClassMember[],
  isCore: boolean,
  reflector: ReflectionHost,
  importTracker: ImportedSymbolsTracker,
  evaluator: PartialEvaluator,
  outputsFromMeta: Record<string, string>,
): Record<string, string> {
  const outputs = {} as Record<string, string>;

  for (const member of members) {
    const decoratorOutput = tryParseDecoratorOutput(member, evaluator, isCore);
    const initializerOutput = tryParseInitializerBasedOutput(member, reflector, importTracker);
    const modelMapping = tryParseSignalModelMapping(member, reflector, importTracker);

    if (decoratorOutput !== null && initializerOutput !== null) {
      throw new FatalDiagnosticError(
        ErrorCode.INITIALIZER_API_WITH_DISALLOWED_DECORATOR,
        decoratorOutput.decorator.node,
        `Using "@Output" with "output()" is not allowed.`,
      );
    }

    if (decoratorOutput !== null && modelMapping !== null) {
      throw new FatalDiagnosticError(
        ErrorCode.INITIALIZER_API_WITH_DISALLOWED_DECORATOR,
        decoratorOutput.decorator.node,
        `Using @Output with a model input is not allowed.`,
      );
    }

    const queryNode =
      decoratorOutput?.decorator.node ?? initializerOutput?.call ?? modelMapping?.call;
    if (queryNode !== undefined && member.isStatic) {
      throw new FatalDiagnosticError(
        ErrorCode.INCORRECTLY_DECLARED_ON_STATIC_MEMBER,
        queryNode,
        `Output is incorrectly declared on a static class member.`,
      );
    }

    let bindingPropertyName: string;

    if (decoratorOutput !== null) {
      bindingPropertyName = decoratorOutput.metadata.bindingPropertyName;
    } else if (initializerOutput !== null) {
      bindingPropertyName = initializerOutput.metadata.bindingPropertyName;
    } else if (modelMapping !== null) {
      bindingPropertyName = modelMapping.output.bindingPropertyName;
    } else {
      continue;
    }

    // Validate that initializer-based outputs are not accidentally declared
    // in the `outputs` class metadata.
    if (
      (initializerOutput !== null || modelMapping !== null) &&
      outputsFromMeta.hasOwnProperty(member.name)
    ) {
      throw new FatalDiagnosticError(
        ErrorCode.INITIALIZER_API_DECORATOR_METADATA_COLLISION,
        member.node ?? clazz,
        `Output "${member.name}" is unexpectedly declared in @${classDecorator.name} as well.`,
      );
    }

    outputs[member.name] = bindingPropertyName;
  }

  return outputs;
}

/** Attempts to parse a decorator-based @Output. */
function tryParseDecoratorOutput(
  member: ClassMember,
  evaluator: PartialEvaluator,
  isCore: boolean,
): {decorator: Decorator; metadata: InputOrOutput} | null {
  const decorator = tryGetDecoratorOnMember(member, 'Output', isCore);
  if (decorator === null) {
    return null;
  }
  if (decorator.args !== null && decorator.args.length > 1) {
    throw new FatalDiagnosticError(
      ErrorCode.DECORATOR_ARITY_WRONG,
      decorator.node,
      `@Output can have at most one argument, got ${decorator.args.length} argument(s)`,
    );
  }

  const classPropertyName = member.name;

  let alias: string | null = null;
  if (decorator.args?.length === 1) {
    const resolvedAlias = evaluator.evaluate(decorator.args[0]);
    if (typeof resolvedAlias !== 'string') {
      throw createValueHasWrongTypeError(
        decorator.node,
        resolvedAlias,
        `@Output decorator argument must resolve to a string`,
      );
    }
    alias = resolvedAlias;
  }

  return {
    decorator,
    metadata: {
      isSignal: false,
      classPropertyName,
      bindingPropertyName: alias ?? classPropertyName,
    },
  };
}

function evaluateHostExpressionBindings(
  hostExpr: ts.Expression,
  evaluator: PartialEvaluator,
): ParsedHostBindings {
  const hostMetaMap = evaluator.evaluate(hostExpr);
  if (!(hostMetaMap instanceof Map)) {
    throw createValueHasWrongTypeError(
      hostExpr,
      hostMetaMap,
      `Decorator host metadata must be an object`,
    );
  }
  const hostMetadata: Record<string, string | Expression> = {};
  hostMetaMap.forEach((value, key) => {
    // Resolve Enum references to their declared value.
    if (value instanceof EnumValue) {
      value = value.resolved;
    }

    if (typeof key !== 'string') {
      throw createValueHasWrongTypeError(
        hostExpr,
        key,
        `Decorator host metadata must be a string -> string object, but found unparseable key`,
      );
    }

    if (typeof value == 'string') {
      hostMetadata[key] = value;
    } else if (value instanceof DynamicValue) {
      hostMetadata[key] = new WrappedNodeExpr(value.node as ts.Expression);
    } else {
      throw createValueHasWrongTypeError(
        hostExpr,
        value,
        `Decorator host metadata must be a string -> string object, but found unparseable value`,
      );
    }
  });

  const bindings = parseHostBindings(hostMetadata);

  const errors = verifyHostBindings(bindings, createSourceSpan(hostExpr));
  if (errors.length > 0) {
    throw new FatalDiagnosticError(
      ErrorCode.HOST_BINDING_PARSE_ERROR,
      getHostBindingErrorNode(errors[0], hostExpr),
      errors.map((error: ParseError) => error.msg).join('\n'),
    );
  }

  return bindings;
}

/**
 * Attempts to match a parser error to the host binding expression that caused it.
 * @param error Error to match.
 * @param hostExpr Expression declaring the host bindings.
 */
function getHostBindingErrorNode(error: ParseError, hostExpr: ts.Expression): ts.Node {
  // In the most common case the `host` object is an object literal with string values. We can
  // confidently match the error to its expression by looking at the string value that the parser
  // failed to parse and the initializers for each of the properties. If we fail to match, we fall
  // back to the old behavior where the error is reported on the entire `host` object.
  if (ts.isObjectLiteralExpression(hostExpr)) {
    for (const prop of hostExpr.properties) {
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isStringLiteralLike(prop.initializer) &&
        error.msg.includes(`[${prop.initializer.text}]`)
      ) {
        return prop.initializer;
      }
    }
  }

  return hostExpr;
}

/**
 * Extracts and prepares the host directives metadata from an array literal expression.
 * @param rawHostDirectives Expression that defined the `hostDirectives`.
 */
function extractHostDirectives(
  rawHostDirectives: ts.Expression,
  evaluator: PartialEvaluator,
  reflector: ReflectionHost,
  compilationMode: CompilationMode,
  forwardRefResolver: ForeignFunctionResolver,
  emitDeclarationOnly: boolean,
): HostDirectiveMeta[] {
  const resolved = evaluator.evaluate(rawHostDirectives, forwardRefResolver);
  if (!Array.isArray(resolved)) {
    throw createValueHasWrongTypeError(
      rawHostDirectives,
      resolved,
      'hostDirectives must be an array',
    );
  }

  return resolved.map((value) => {
    const hostReference = value instanceof Map ? value.get('directive') : value;

    // Diagnostics
    if (compilationMode !== CompilationMode.LOCAL) {
      if (!(hostReference instanceof Reference)) {
        throw createValueHasWrongTypeError(
          rawHostDirectives,
          hostReference,
          'Host directive must be a reference',
        );
      }

      if (!isNamedClassDeclaration(hostReference.node)) {
        throw createValueHasWrongTypeError(
          rawHostDirectives,
          hostReference,
          'Host directive reference must be a class',
        );
      }
    }

    let directive: Reference<ClassDeclaration> | Expression | ExternalReference;
    let nameForErrors = (fieldName: string) => '@Directive.hostDirectives';
    if (compilationMode === CompilationMode.LOCAL && hostReference instanceof DynamicValue) {
      // At the moment in local compilation we only support simple array for host directives, i.e.,
      // an array consisting of the directive identifiers. We don't support forward refs or other
      // expressions applied on externally imported directives. The main reason is simplicity, and
      // that almost nobody wants to use host directives this way (e.g., what would be the point of
      // forward ref for imported symbols?!)
      if (
        !ts.isIdentifier(hostReference.node) &&
        !ts.isPropertyAccessExpression(hostReference.node)
      ) {
        const compilationModeName = emitDeclarationOnly
          ? 'experimental declaration-only emission'
          : 'local compilation';
        throw new FatalDiagnosticError(
          ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION,
          hostReference.node,
          `In ${compilationModeName} mode, host directive cannot be an expression. Use an identifier instead`,
        );
      }

      if (emitDeclarationOnly) {
        if (ts.isIdentifier(hostReference.node)) {
          const importInfo = reflector.getImportOfIdentifier(hostReference.node);
          if (importInfo) {
            directive = new ExternalReference(importInfo.from, importInfo.name);
          } else {
            throw new FatalDiagnosticError(
              ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION,
              hostReference.node,
              `In experimental declaration-only emission mode, host directive cannot use indirect external indentifiers. Use a direct external identifier instead`,
            );
          }
        } else {
          throw new FatalDiagnosticError(
            ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION,
            hostReference.node,
            `In experimental declaration-only emission mode, host directive cannot be an expression. Use an identifier instead`,
          );
        }
      } else {
        directive = new WrappedNodeExpr(hostReference.node);
      }
    } else if (hostReference instanceof Reference) {
      directive = hostReference as Reference<ClassDeclaration>;
      nameForErrors = (fieldName: string) =>
        `@Directive.hostDirectives.${
          (directive as Reference<ClassDeclaration>).node.name.text
        }.${fieldName}`;
    } else {
      throw new Error('Impossible state');
    }

    const meta: HostDirectiveMeta = {
      directive,
      isForwardReference: hostReference instanceof Reference && hostReference.synthetic,
      inputs: parseHostDirectivesMapping(
        'inputs',
        value,
        nameForErrors('input'),
        rawHostDirectives,
      ),
      outputs: parseHostDirectivesMapping(
        'outputs',
        value,
        nameForErrors('output'),
        rawHostDirectives,
      ),
    };

    return meta;
  });
}

/**
 * Parses the expression that defines the `inputs` or `outputs` of a host directive.
 * @param field Name of the field that is being parsed.
 * @param resolvedValue Evaluated value of the expression that defined the field.
 * @param classReference Reference to the host directive class.
 * @param sourceExpression Expression that the host directive is referenced in.
 */
function parseHostDirectivesMapping(
  field: 'inputs' | 'outputs',
  resolvedValue: ResolvedValue,
  nameForErrors: string,
  sourceExpression: ts.Expression,
): {[bindingPropertyName: string]: string} | null {
  if (resolvedValue instanceof Map && resolvedValue.has(field)) {
    const rawInputs = resolvedValue.get(field);

    if (isStringArrayOrDie(rawInputs, nameForErrors, sourceExpression)) {
      return parseMappingStringArray(rawInputs);
    }
  }

  return null;
}

/** Converts the parsed host directive information into metadata. */
function toHostDirectiveMetadata(
  hostDirective: HostDirectiveMeta,
  context: ts.SourceFile,
  refEmitter: ReferenceEmitter,
): R3HostDirectiveMetadata {
  let directive: R3Reference;
  if (hostDirective.directive instanceof Reference) {
    directive = toR3Reference(
      hostDirective.directive.node,
      hostDirective.directive,
      context,
      refEmitter,
    );
  } else if (hostDirective.directive instanceof ExternalReference) {
    directive = {
      value: new ExternalExpr(hostDirective.directive),
      type: new ExternalExpr(hostDirective.directive),
    };
  } else {
    directive = {
      value: hostDirective.directive,
      type: hostDirective.directive,
    };
  }

  return {
    directive,
    isForwardReference: hostDirective.isForwardReference,
    inputs: hostDirective.inputs || null,
    outputs: hostDirective.outputs || null,
  };
}

/** Converts the parsed input information into metadata. */
function toR3InputMetadata(mapping: InputMapping): R3InputMetadata {
  return {
    classPropertyName: mapping.classPropertyName,
    bindingPropertyName: mapping.bindingPropertyName,
    required: mapping.required,
    transformFunction:
      mapping.transform !== null ? new WrappedNodeExpr(mapping.transform.node) : null,
    isSignal: mapping.isSignal,
  };
}

export function extractHostBindingResources(nodes: HostBindingNodes): ReadonlySet<Resource> {
  const result = new Set<Resource>();

  if (nodes.literal !== null) {
    result.add({path: null, node: nodes.literal});
  }

  for (const current of nodes.bindingDecorators) {
    result.add({path: null, node: current.expression});
  }

  for (const current of nodes.listenerDecorators) {
    result.add({path: null, node: current.expression});
  }

  return result;
}
