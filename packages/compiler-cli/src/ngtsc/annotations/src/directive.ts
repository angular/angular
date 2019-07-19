/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, EMPTY_SOURCE_SPAN, Expression, ParseError, ParsedHostBindings, R3DirectiveMetadata, R3QueryMetadata, Statement, WrappedNodeExpr, compileDirectiveFromMetadata, makeBindingParser, parseHostBindings, verifyHostBindings} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {DefaultImportRecorder, Reference} from '../../imports';
import {MetadataRegistry} from '../../metadata';
import {extractDirectiveGuards} from '../../metadata/src/util';
import {DynamicValue, EnumValue, PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, ClassMember, ClassMemberKind, Decorator, ReflectionHost, filterToMembersWithDecorator, reflectObjectLiteral} from '../../reflection';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence} from '../../transform';

import {generateSetClassMetadataCall} from './metadata';
import {findAngularDecorator, getValidConstructorDependencies, readBaseClass, unwrapExpression, unwrapForwardRef} from './util';

const EMPTY_OBJECT: {[key: string]: string} = {};

export interface DirectiveHandlerData {
  meta: R3DirectiveMetadata;
  metadataStmt: Statement|null;
}
export class DirectiveDecoratorHandler implements
    DecoratorHandler<DirectiveHandlerData, Decorator> {
  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private metaRegistry: MetadataRegistry, private defaultImportRecorder: DefaultImportRecorder,
      private isCore: boolean) {}

  readonly precedence = HandlerPrecedence.PRIMARY;

  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<Decorator>|undefined {
    if (!decorators) {
      return undefined;
    }
    const decorator = findAngularDecorator(decorators, 'Directive', this.isCore);
    if (decorator !== undefined) {
      return {
        trigger: decorator.node,
        metadata: decorator,
      };
    } else {
      return undefined;
    }
  }

  analyze(node: ClassDeclaration, decorator: Decorator): AnalysisOutput<DirectiveHandlerData> {
    const directiveResult = extractDirectiveMetadata(
        node, decorator, this.reflector, this.evaluator, this.defaultImportRecorder, this.isCore);
    const analysis = directiveResult && directiveResult.metadata;

    // If the directive has a selector, it should be registered with the `SelectorScopeRegistry` so
    // when this directive appears in an `@NgModule` scope, its selector can be determined.
    if (analysis && analysis.selector !== null) {
      const ref = new Reference(node);
      this.metaRegistry.registerDirectiveMetadata({
        ref,
        name: node.name.text,
        selector: analysis.selector,
        exportAs: analysis.exportAs,
        inputs: analysis.inputs,
        outputs: analysis.outputs,
        queries: analysis.queries.map(query => query.propertyName),
        isComponent: false, ...extractDirectiveGuards(node, this.reflector),
        baseClass: readBaseClass(node, this.reflector, this.evaluator),
      });
    }

    if (analysis === undefined) {
      return {};
    }

    return {
      analysis: {
        meta: analysis,
        metadataStmt: generateSetClassMetadataCall(
            node, this.reflector, this.defaultImportRecorder, this.isCore),
      }
    };
  }

  compile(node: ClassDeclaration, analysis: DirectiveHandlerData, pool: ConstantPool):
      CompileResult {
    const res = compileDirectiveFromMetadata(analysis.meta, pool, makeBindingParser());
    const statements = res.statements;
    if (analysis.metadataStmt !== null) {
      statements.push(analysis.metadataStmt);
    }
    return {
      name: 'ngDirectiveDef',
      initializer: res.expression,
      statements: statements,
      type: res.type,
    };
  }
}

/**
 * Helper function to extract metadata from a `Directive` or `Component`.
 */
export function extractDirectiveMetadata(
    clazz: ClassDeclaration, decorator: Decorator, reflector: ReflectionHost,
    evaluator: PartialEvaluator, defaultImportRecorder: DefaultImportRecorder, isCore: boolean,
    defaultSelector: string | null = null): {
  decorator: Map<string, ts.Expression>,
  metadata: R3DirectiveMetadata,
  decoratedElements: ClassMember[],
}|undefined {
  if (decorator.args === null || decorator.args.length !== 1) {
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARITY_WRONG, decorator.node,
        `Incorrect number of arguments to @${decorator.name} decorator`);
  }
  const meta = unwrapExpression(decorator.args[0]);
  if (!ts.isObjectLiteralExpression(meta)) {
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, `@${decorator.name} argument must be literal.`);
  }
  const directive = reflectObjectLiteral(meta);

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
  const outputsFromFields = parseDecoratedFields(
      filterToMembersWithDecorator(decoratedElements, 'Output', coreModule), evaluator,
      resolveOutput) as{[field: string]: string};
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
        extractQueriesFromDecorator(directive.get('queries') !, reflector, evaluator, isCore);
    queries.push(...queriesFromDecorator.content);
    viewQueries.push(...queriesFromDecorator.view);
  }

  // Parse the selector.
  let selector = defaultSelector;
  if (directive.has('selector')) {
    const expr = directive.get('selector') !;
    const resolved = evaluator.evaluate(expr);
    if (typeof resolved !== 'string') {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, expr, `selector must be a string`);
    }
    // use default selector in case selector is an empty string
    selector = resolved === '' ? defaultSelector : resolved;
  }
  if (!selector) {
    throw new Error(`Directive ${clazz.name.text} has no selector, please add it!`);
  }

  const host = extractHostBindings(decoratedElements, evaluator, coreModule, directive);

  const providers: Expression|null =
      directive.has('providers') ? new WrappedNodeExpr(directive.get('providers') !) : null;

  // Determine if `ngOnChanges` is a lifecycle hook defined on the component.
  const usesOnChanges = members.some(
      member => !member.isStatic && member.kind === ClassMemberKind.Method &&
          member.name === 'ngOnChanges');

  // Parse exportAs.
  let exportAs: string[]|null = null;
  if (directive.has('exportAs')) {
    const expr = directive.get('exportAs') !;
    const resolved = evaluator.evaluate(expr);
    if (typeof resolved !== 'string') {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, expr, `exportAs must be a string`);
    }
    exportAs = resolved.split(',').map(part => part.trim());
  }

  // Detect if the component inherits from another class
  const usesInheritance = reflector.hasBaseClass(clazz);
  const metadata: R3DirectiveMetadata = {
    name: clazz.name.text,
    deps: getValidConstructorDependencies(clazz, reflector, defaultImportRecorder, isCore), host,
    lifecycle: {
        usesOnChanges,
    },
    inputs: {...inputsFromMeta, ...inputsFromFields},
    outputs: {...outputsFromMeta, ...outputsFromFields}, queries, viewQueries, selector,
    type: new WrappedNodeExpr(clazz.name),
    typeArgumentCount: reflector.getGenericArityOfClass(clazz) || 0,
    typeSourceSpan: EMPTY_SOURCE_SPAN, usesInheritance, exportAs, providers
  };
  return {decoratedElements, decorator: directive, metadata};
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
  if (arg instanceof Reference) {
    predicate = new WrappedNodeExpr(node);
  } else if (typeof arg === 'string') {
    predicate = [arg];
  } else if (isStringArrayOrDie(arg, '@' + name)) {
    predicate = arg as string[];
  } else {
    throw new FatalDiagnosticError(
        ErrorCode.VALUE_HAS_WRONG_TYPE, node, `@${name} predicate cannot be interpreted`);
  }

  // Extract the read and descendants options.
  let read: Expression|null = null;
  // The default value for descendants is true for every decorator except @ContentChildren.
  let descendants: boolean = name !== 'ContentChildren';
  if (args.length === 2) {
    const optionsExpr = unwrapExpression(args[1]);
    if (!ts.isObjectLiteralExpression(optionsExpr)) {
      throw new Error(`@${name} options must be an object literal`);
    }
    const options = reflectObjectLiteral(optionsExpr);
    if (options.has('read')) {
      read = new WrappedNodeExpr(options.get('read') !);
    }

    if (options.has('descendants')) {
      const descendantsValue = evaluator.evaluate(options.get('descendants') !);
      if (typeof descendantsValue !== 'boolean') {
        throw new Error(`@${name} options.descendants must be a boolean`);
      }
      descendants = descendantsValue;
    }

    if (options.has('static')) {
      const staticValue = evaluator.evaluate(options.get('static') !);
      if (typeof staticValue !== 'boolean') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, node, `@${name} options.static must be a boolean`);
      }
      isStatic = staticValue;
    }

  } else if (args.length > 2) {
    // Too many arguments.
    throw new Error(`@${name} has too many arguments`);
  }

  return {
    propertyName,
    predicate,
    first,
    descendants,
    read,
    static: isStatic,
  };
}

export function extractQueriesFromDecorator(
    queryData: ts.Expression, reflector: ReflectionHost, evaluator: PartialEvaluator,
    isCore: boolean): {
  content: R3QueryMetadata[],
  view: R3QueryMetadata[],
} {
  const content: R3QueryMetadata[] = [], view: R3QueryMetadata[] = [];
  const expr = unwrapExpression(queryData);
  if (!ts.isObjectLiteralExpression(queryData)) {
    throw new Error(`queries metadata must be an object literal`);
  }
  reflectObjectLiteral(queryData).forEach((queryExpr, propertyName) => {
    queryExpr = unwrapExpression(queryExpr);
    if (!ts.isNewExpression(queryExpr) || !ts.isIdentifier(queryExpr.expression)) {
      throw new Error(`query metadata must be an instance of a query type`);
    }
    const type = reflector.getImportOfIdentifier(queryExpr.expression);
    if (type === null || (!isCore && type.from !== '@angular/core') ||
        !QUERY_TYPES.has(type.name)) {
      throw new Error(`query metadata must be an instance of a query type`);
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

function isStringArrayOrDie(value: any, name: string): value is string[] {
  if (!Array.isArray(value)) {
    return false;
  }

  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== 'string') {
      throw new Error(`Failed to resolve ${name}[${i}] to a string`);
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
  const value = evaluator.evaluate(directive.get(field) !);
  if (!isStringArrayOrDie(value, field)) {
    throw new Error(`Failed to resolve @Directive.${field}`);
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

  return metaValues.reduce(
      (results, value) => {
        // Either the value is 'field' or 'field: property'. In the first case, `property` will
        // be undefined, in which case the field name should also be used as the property name.
        const [field, property] = value.split(':', 2).map(str => str.trim());
        results[field] = property || field;
        return results;
      },
      {} as{[field: string]: string});
}

/**
 * Parse property decorators (e.g. `Input` or `Output`) and return the correctly shaped metadata
 * object.
 */
function parseDecoratedFields(
    fields: {member: ClassMember, decorators: Decorator[]}[], evaluator: PartialEvaluator,
    mapValueResolver: (publicName: string, internalName: string) =>
        string | [string, string]): {[field: string]: string | [string, string]} {
  return fields.reduce(
      (results, field) => {
        const fieldName = field.member.name;
        field.decorators.forEach(decorator => {
          // The decorator either doesn't have an argument (@Input()) in which case the property
          // name is used, or it has one argument (@Output('named')).
          if (decorator.args == null || decorator.args.length === 0) {
            results[fieldName] = fieldName;
          } else if (decorator.args.length === 1) {
            const property = evaluator.evaluate(decorator.args[0]);
            if (typeof property !== 'string') {
              throw new Error(`Decorator argument must resolve to a string`);
            }
            results[fieldName] = mapValueResolver(property, fieldName);
          } else {
            // Too many arguments.
            throw new Error(
                `Decorator must have 0 or 1 arguments, got ${decorator.args.length} argument(s)`);
          }
        });
        return results;
      },
      {} as{[field: string]: string | [string, string]});
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
    const node = member.node || decorator.node;

    // Throw in case of `@Input() @ContentChild('foo') foo: any`, which is not supported in Ivy
    if (member.decorators !.some(v => v.name === 'Input')) {
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
        decorator.node, decorator.name, decorator.args || [], member.name, reflector, evaluator);
  });
}

function isPropertyTypeMember(member: ClassMember): boolean {
  return member.kind === ClassMemberKind.Getter || member.kind === ClassMemberKind.Setter ||
      member.kind === ClassMemberKind.Property;
}

type StringMap<T> = {
  [key: string]: T;
};

export function extractHostBindings(
    members: ClassMember[], evaluator: PartialEvaluator, coreModule: string | undefined,
    metadata?: Map<string, ts.Expression>): ParsedHostBindings {
  let hostMetadata: StringMap<string|Expression> = {};
  if (metadata && metadata.has('host')) {
    const expr = metadata.get('host') !;
    const hostMetaMap = evaluator.evaluate(expr);
    if (!(hostMetaMap instanceof Map)) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL, expr, `Decorator host metadata must be an object`);
    }
    hostMetaMap.forEach((value, key) => {
      // Resolve Enum references to their declared value.
      if (value instanceof EnumValue) {
        value = value.resolved;
      }

      if (typeof key !== 'string') {
        throw new Error(
            `Decorator host metadata must be a string -> string object, but found unparseable key ${key}`);
      }

      if (typeof value == 'string') {
        hostMetadata[key] = value;
      } else if (value instanceof DynamicValue) {
        hostMetadata[key] = new WrappedNodeExpr(value.node as ts.Expression);
      } else {
        throw new Error(
            `Decorator host metadata must be a string -> string object, but found unparseable value ${value}`);
      }
    });
  }

  const bindings = parseHostBindings(hostMetadata);

  // TODO: create and provide proper sourceSpan to make error message more descriptive (FW-995)
  // For now, pass an incorrect (empty) but valid sourceSpan.
  const errors = verifyHostBindings(bindings, EMPTY_SOURCE_SPAN);
  if (errors.length > 0) {
    throw new FatalDiagnosticError(
        // TODO: provide more granular diagnostic and output specific host expression that triggered
        // an error instead of the whole host object
        ErrorCode.HOST_BINDING_PARSE_ERROR, metadata !.get('host') !,
        errors.map((error: ParseError) => error.msg).join('\n'));
  }

  filterToMembersWithDecorator(members, 'HostBinding', coreModule)
      .forEach(({member, decorators}) => {
        decorators.forEach(decorator => {
          let hostPropertyName: string = member.name;
          if (decorator.args !== null && decorator.args.length > 0) {
            if (decorator.args.length !== 1) {
              throw new Error(`@HostBinding() can have at most one argument`);
            }

            const resolved = evaluator.evaluate(decorator.args[0]);
            if (typeof resolved !== 'string') {
              throw new Error(`@HostBinding()'s argument must be a string`);
            }

            hostPropertyName = resolved;
          }

          bindings.properties[hostPropertyName] = member.name;
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
                  `@HostListener() can have at most two arguments`);
            }

            const resolved = evaluator.evaluate(decorator.args[0]);
            if (typeof resolved !== 'string') {
              throw new FatalDiagnosticError(
                  ErrorCode.VALUE_HAS_WRONG_TYPE, decorator.args[0],
                  `@HostListener()'s event name argument must be a string`);
            }

            eventName = resolved;

            if (decorator.args.length === 2) {
              const resolvedArgs = evaluator.evaluate(decorator.args[1]);
              if (!isStringArrayOrDie(resolvedArgs, '@HostListener.args')) {
                throw new FatalDiagnosticError(
                    ErrorCode.VALUE_HAS_WRONG_TYPE, decorator.args[1],
                    `@HostListener second argument must be a string array`);
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
