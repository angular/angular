/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createMayBeForwardRefExpression, emitDistinctChangesOnlyDefaultValue, Expression, ExternalExpr, ForwardRefHandling, getSafePropertyAccessString, MaybeForwardRefExpression, ParsedHostBindings, ParseError, parseHostBindings, R3DirectiveMetadata, R3HostDirectiveMetadata, R3QueryMetadata, verifyHostBindings, WrappedNodeExpr,} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {Reference, ReferenceEmitter} from '../../../imports';
import {ClassPropertyMapping, HostDirectiveMeta, InputMapping} from '../../../metadata';
import {DynamicValue, EnumValue, PartialEvaluator, ResolvedValue} from '../../../partial_evaluator';
import {ClassDeclaration, ClassMember, ClassMemberKind, Decorator, filterToMembersWithDecorator, isNamedClassDeclaration, ReflectionHost, reflectObjectLiteral,} from '../../../reflection';
import {HandlerFlags} from '../../../transform';
import {createSourceSpan, createValueHasWrongTypeError, forwardRefResolver, getConstructorDependencies, ReferencesRegistry, toR3Reference, tryUnwrapForwardRef, unwrapConstructorDependencies, unwrapExpression, validateConstructorDependencies, wrapFunctionExpressionsInParens, wrapTypeReference,} from '../../common';

const EMPTY_OBJECT: {[key: string]: string} = {};
const QUERY_TYPES = new Set([
  'ContentChild',
  'ContentChildren',
  'ViewChild',
  'ViewChildren',
]);

/**
 * Helper function to extract metadata from a `Directive` or `Component`. `Directive`s without a
 * selector are allowed to be used for abstract base classes. These abstract directives should not
 * appear in the declarations of an `NgModule` and additional verification is done when processing
 * the module.
 */
export function extractDirectiveMetadata(
    clazz: ClassDeclaration, decorator: Readonly<Decorator|null>, reflector: ReflectionHost,
    evaluator: PartialEvaluator, refEmitter: ReferenceEmitter,
    referencesRegistry: ReferencesRegistry, isCore: boolean, flags: HandlerFlags,
    annotateForClosureCompiler: boolean, defaultSelector: string|null = null): {
  decorator: Map<string, ts.Expression>,
  metadata: R3DirectiveMetadata,
  inputs: ClassPropertyMapping<InputMapping>,
  outputs: ClassPropertyMapping,
  isStructural: boolean;
  hostDirectives: HostDirectiveMeta[] | null, rawHostDirectives: ts.Expression | null,
}|undefined {
  let directive: Map<string, ts.Expression>;
  if (decorator === null || decorator.args === null || decorator.args.length === 0) {
    directive = new Map<string, ts.Expression>();
  } else if (decorator.args.length !== 1) {
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARITY_WRONG, decorator.node,
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
  // decorator, and the decorated fields.
  const inputsFromMeta = parseInputsArray(directive, evaluator);
  const inputsFromFields = parseInputFields(
      filterToMembersWithDecorator(decoratedElements, 'Input', coreModule), evaluator);
  const inputs = ClassPropertyMapping.fromMappedObject({...inputsFromMeta, ...inputsFromFields});

  // And outputs.
  const outputsFromMeta = parseOutputsArray(directive, evaluator);
  const outputsFromFields = parseOutputFields(
      filterToMembersWithDecorator(decoratedElements, 'Output', coreModule), evaluator);
  const outputs = ClassPropertyMapping.fromMappedObject({...outputsFromMeta, ...outputsFromFields});

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

  const rawCtorDeps = getConstructorDependencies(clazz, reflector, isCore);

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

  let isStandalone = false;
  if (directive.has('standalone')) {
    const expr = directive.get('standalone')!;
    const resolved = evaluator.evaluate(expr);
    if (typeof resolved !== 'boolean') {
      throw createValueHasWrongTypeError(expr, resolved, `standalone flag must be a boolean`);
    }
    isStandalone = resolved;
  }

  // Detect if the component inherits from another class
  const usesInheritance = reflector.hasBaseClass(clazz);
  const sourceFile = clazz.getSourceFile();
  const type = wrapTypeReference(reflector, clazz);
  const rawHostDirectives = directive.get('hostDirectives') || null;
  const hostDirectives =
      rawHostDirectives === null ? null : extractHostDirectives(rawHostDirectives, evaluator);

  if (hostDirectives !== null) {
    // The template type-checker will need to import host directive types, so add them
    // as referenced by `clazz`. This will ensure that libraries are required to export
    // host directives which are visible from publicly exported components.
    referencesRegistry.add(clazz, ...hostDirectives.map(hostDir => hostDir.directive));
  }

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
    typeArgumentCount: reflector.getGenericArityOfClass(clazz) || 0,
    typeSourceSpan: createSourceSpan(clazz.name),
    usesInheritance,
    exportAs,
    providers,
    isStandalone,
    hostDirectives:
        hostDirectives?.map(hostDir => toHostDirectiveMetadata(hostDir, sourceFile, refEmitter)) ||
        null,
  };
  return {
    decorator: directive,
    metadata,
    inputs,
    outputs,
    isStructural,
    hostDirectives,
    rawHostDirectives,
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
  const forwardReferenceTarget = tryUnwrapForwardRef(args[0], reflector);
  const node = forwardReferenceTarget ?? args[0];

  const arg = evaluator.evaluate(node);

  /** Whether or not this query should collect only static results (see view/api.ts)  */
  let isStatic: boolean = false;

  // Extract the predicate
  let predicate: MaybeForwardRefExpression|string[]|null = null;
  if (arg instanceof Reference || arg instanceof DynamicValue) {
    // References and predicates that could not be evaluated statically are emitted as is.
    predicate = createMayBeForwardRefExpression(
        new WrappedNodeExpr(node),
        forwardReferenceTarget !== null ? ForwardRefHandling.Unwrapped : ForwardRefHandling.None);
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
                  ErrorCode.DECORATOR_ARITY_WRONG, decorator.node,
                  `@HostBinding can have at most one argument, got ${
                      decorator.args.length} argument(s)`);
            }

            const resolved = evaluator.evaluate(decorator.args[0]);
            if (typeof resolved !== 'string') {
              throw createValueHasWrongTypeError(
                  decorator.node, resolved, `@HostBinding's argument must be a string`);
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

function extractQueriesFromDecorator(
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

export function parseFieldStringArrayValue(
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

function queriesFromFields(
    fields: {member: ClassMember, decorators: Decorator[]}[], reflector: ReflectionHost,
    evaluator: PartialEvaluator): R3QueryMetadata[] {
  return fields.map(({member, decorators}) => {
    const decorator = decorators[0];
    const node = member.node || decorator.node;

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

function parseMappingStringArray(values: string[]) {
  return values.reduce((results, value) => {
    if (typeof value !== 'string') {
      throw new Error('Mapping value must be a string');
    }

    const [bindingPropertyName, fieldName] = parseMappingString(value);
    results[fieldName] = bindingPropertyName;
    return results;
  }, {} as {[field: string]: string});
}

function parseMappingString(value: string): [bindingPropertyName: string, fieldName: string] {
  // Either the value is 'field' or 'field: property'. In the first case, `property` will
  // be undefined, in which case the field name should also be used as the property name.
  const [fieldName, bindingPropertyName] = value.split(':', 2).map(str => str.trim());
  return [bindingPropertyName ?? fieldName, fieldName];
}

/**
 * Parse property decorators (e.g. `Input` or `Output`) and invoke callback with the parsed data.
 */
function parseDecoratedFields(
    fields: {member: ClassMember, decorators: Decorator[]}[], evaluator: PartialEvaluator,
    callback: (fieldName: string, fieldValue: ResolvedValue, decorator: Decorator) => void): void {
  for (const field of fields) {
    const fieldName = field.member.name;

    for (const decorator of field.decorators) {
      if (decorator.args != null && decorator.args.length > 1) {
        throw new FatalDiagnosticError(
            ErrorCode.DECORATOR_ARITY_WRONG, decorator.node,
            `@${decorator.name} can have at most one argument, got ${
                decorator.args.length} argument(s)`);
      }

      const value = decorator.args != null && decorator.args.length > 0 ?
          evaluator.evaluate(decorator.args[0]) :
          null;

      callback(fieldName, value, decorator);
    }
  }
}

/** Parses the `inputs` array of a directive/component decorator. */
function parseInputsArray(
    decoratorMetadata: Map<string, ts.Expression>,
    evaluator: PartialEvaluator): Record<string, InputMapping> {
  const inputsField = decoratorMetadata.get('inputs');

  if (inputsField === undefined) {
    return {};
  }

  const inputs = {} as Record<string, InputMapping>;
  const inputsArray = evaluator.evaluate(inputsField);

  if (!Array.isArray(inputsArray)) {
    throw createValueHasWrongTypeError(
        inputsField, inputsArray, `Failed to resolve @Directive.inputs to an array`);
  }

  for (let i = 0; i < inputsArray.length; i++) {
    const value = inputsArray[i];

    if (typeof value === 'string') {
      // If the value is a string, we treat it as a mapping string.
      const [bindingPropertyName, classPropertyName] = parseMappingString(value);
      inputs[classPropertyName] = {bindingPropertyName, classPropertyName, required: false};
    } else if (value instanceof Map) {
      // If it's a map, we treat it as a config object.
      const name = value.get('name');
      const alias = value.get('alias');
      const required = value.get('required');

      if (typeof name !== 'string') {
        throw createValueHasWrongTypeError(
            inputsField, name,
            `Value at position ${i} of @Directive.inputs array must have a "name" property`);
      }

      inputs[name] = {
        classPropertyName: name,
        bindingPropertyName: typeof alias === 'string' ? alias : name,
        required: required === true
      };
    } else {
      throw createValueHasWrongTypeError(
          inputsField, value,
          `@Directive.inputs array can only contain strings or object literals`);
    }
  }

  return inputs;
}

/** Parses the class members that are decorated as inputs. */
function parseInputFields(
    inputMembers: {member: ClassMember, decorators: Decorator[]}[],
    evaluator: PartialEvaluator): Record<string, InputMapping> {
  const inputs = {} as Record<string, InputMapping>;

  parseDecoratedFields(inputMembers, evaluator, (classPropertyName, options, decorator) => {
    let bindingPropertyName: string;
    let required = false;

    if (options === null) {
      bindingPropertyName = classPropertyName;
    } else if (typeof options === 'string') {
      bindingPropertyName = options;
    } else if (options instanceof Map) {
      const aliasInConfig = options.get('alias');
      bindingPropertyName = typeof aliasInConfig === 'string' ? aliasInConfig : classPropertyName;
      required = options.get('required') === true;
    } else {
      throw createValueHasWrongTypeError(
          decorator.node, options,
          `@${decorator.name} decorator argument must resolve to a string or an object literal`);
    }

    inputs[classPropertyName] = {bindingPropertyName, classPropertyName, required};
  });

  return inputs;
}

/** Parses the `outputs` array of a directive/component. */
function parseOutputsArray(
    directive: Map<string, ts.Expression>, evaluator: PartialEvaluator): Record<string, string> {
  const metaValues = parseFieldStringArrayValue(directive, 'outputs', evaluator);
  return metaValues ? parseMappingStringArray(metaValues) : EMPTY_OBJECT;
}

/** Parses the class members that are decorated as outputs. */
function parseOutputFields(
    outputMembers: {member: ClassMember, decorators: Decorator[]}[],
    evaluator: PartialEvaluator): Record<string, string> {
  const outputs = {} as Record<string, string>;

  parseDecoratedFields(outputMembers, evaluator, (fieldName, bindingPropertyName, decorator) => {
    if (bindingPropertyName != null && typeof bindingPropertyName !== 'string') {
      throw createValueHasWrongTypeError(
          decorator.node, bindingPropertyName,
          `@${decorator.name} decorator argument must resolve to a string`);
    }

    outputs[fieldName] = bindingPropertyName ?? fieldName;
  });

  return outputs;
}

function evaluateHostExpressionBindings(
    hostExpr: ts.Expression, evaluator: PartialEvaluator): ParsedHostBindings {
  const hostMetaMap = evaluator.evaluate(hostExpr);
  if (!(hostMetaMap instanceof Map)) {
    throw createValueHasWrongTypeError(
        hostExpr, hostMetaMap, `Decorator host metadata must be an object`);
  }
  const hostMetadata: Record<string, string|Expression> = {};
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

/**
 * Extracts and prepares the host directives metadata from an array literal expression.
 * @param rawHostDirectives Expression that defined the `hostDirectives`.
 */
function extractHostDirectives(
    rawHostDirectives: ts.Expression, evaluator: PartialEvaluator): HostDirectiveMeta[] {
  const resolved = evaluator.evaluate(rawHostDirectives, forwardRefResolver);
  if (!Array.isArray(resolved)) {
    throw createValueHasWrongTypeError(
        rawHostDirectives, resolved, 'hostDirectives must be an array');
  }

  return resolved.map(value => {
    const hostReference = value instanceof Map ? value.get('directive') : value;

    if (!(hostReference instanceof Reference)) {
      throw createValueHasWrongTypeError(
          rawHostDirectives, hostReference, 'Host directive must be a reference');
    }

    if (!isNamedClassDeclaration(hostReference.node)) {
      throw createValueHasWrongTypeError(
          rawHostDirectives, hostReference, 'Host directive reference must be a class');
    }

    const meta: HostDirectiveMeta = {
      directive: hostReference as Reference<ClassDeclaration>,
      isForwardReference: hostReference.synthetic,
      inputs: parseHostDirectivesMapping('inputs', value, hostReference.node, rawHostDirectives),
      outputs: parseHostDirectivesMapping('outputs', value, hostReference.node, rawHostDirectives),
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
    field: 'inputs'|'outputs', resolvedValue: ResolvedValue, classReference: ClassDeclaration,
    sourceExpression: ts.Expression): {[bindingPropertyName: string]: string}|null {
  if (resolvedValue instanceof Map && resolvedValue.has(field)) {
    const nameForErrors = `@Directive.hostDirectives.${classReference.name.text}.${field}`;
    const rawInputs = resolvedValue.get(field);

    if (isStringArrayOrDie(rawInputs, nameForErrors, sourceExpression)) {
      return parseMappingStringArray(rawInputs);
    }
  }

  return null;
}

/** Converts the parsed host directive information into metadata. */
function toHostDirectiveMetadata(
    hostDirective: HostDirectiveMeta, context: ts.SourceFile,
    refEmitter: ReferenceEmitter): R3HostDirectiveMetadata {
  return {
    directive:
        toR3Reference(hostDirective.directive.node, hostDirective.directive, context, refEmitter),
    isForwardReference: hostDirective.isForwardReference,
    inputs: hostDirective.inputs || null,
    outputs: hostDirective.outputs || null
  };
}
