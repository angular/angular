/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, Expression, R3DirectiveMetadata, R3QueryMetadata, Statement, WrappedNodeExpr, compileDirectiveFromMetadata, makeBindingParser, parseHostBindings} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {ClassMember, ClassMemberKind, Decorator, Import, ReflectionHost} from '../../host';
import {Reference, ResolvedReference, filterToMembersWithDecorator, reflectObjectLiteral, staticallyResolve} from '../../metadata';
import {AnalysisOutput, CompileResult, DecoratorHandler} from '../../transform';

import {generateSetClassMetadataCall} from './metadata';
import {SelectorScopeRegistry} from './selector_scope';
import {extractDirectiveGuards, getConstructorDependencies, isAngularCore, unwrapExpression, unwrapForwardRef} from './util';

const EMPTY_OBJECT: {[key: string]: string} = {};

export interface DirectiveHandlerData {
  meta: R3DirectiveMetadata;
  metadataStmt: Statement|null;
}
export class DirectiveDecoratorHandler implements
    DecoratorHandler<DirectiveHandlerData, Decorator> {
  constructor(
      private checker: ts.TypeChecker, private reflector: ReflectionHost,
      private scopeRegistry: SelectorScopeRegistry, private isCore: boolean) {}

  detect(node: ts.Declaration, decorators: Decorator[]|null): Decorator|undefined {
    if (!decorators) {
      return undefined;
    }
    return decorators.find(
        decorator => decorator.name === 'Directive' && (this.isCore || isAngularCore(decorator)));
  }

  analyze(node: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<DirectiveHandlerData> {
    const directiveResult =
        extractDirectiveMetadata(node, decorator, this.checker, this.reflector, this.isCore);
    const analysis = directiveResult && directiveResult.metadata;

    // If the directive has a selector, it should be registered with the `SelectorScopeRegistry` so
    // when this directive appears in an `@NgModule` scope, its selector can be determined.
    if (analysis && analysis.selector !== null) {
      let ref = new ResolvedReference(node, node.name !);
      this.scopeRegistry.registerDirective(node, {
        ref,
        directive: ref,
        name: node.name !.text,
        selector: analysis.selector,
        exportAs: analysis.exportAs,
        inputs: analysis.inputs,
        outputs: analysis.outputs,
        queries: analysis.queries.map(query => query.propertyName),
        isComponent: false, ...extractDirectiveGuards(node, this.reflector),
      });
    }

    if (analysis === undefined) {
      return {};
    }

    return {
      analysis: {
        meta: analysis,
        metadataStmt: generateSetClassMetadataCall(node, this.reflector, this.isCore),
      }
    };
  }

  compile(node: ts.ClassDeclaration, analysis: DirectiveHandlerData, pool: ConstantPool):
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
    clazz: ts.ClassDeclaration, decorator: Decorator, checker: ts.TypeChecker,
    reflector: ReflectionHost, isCore: boolean): {
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
  const inputsFromMeta = parseFieldToPropertyMapping(directive, 'inputs', reflector, checker);
  const inputsFromFields = parseDecoratedFields(
      filterToMembersWithDecorator(decoratedElements, 'Input', coreModule), reflector, checker,
      resolveInput);

  // And outputs.
  const outputsFromMeta = parseFieldToPropertyMapping(directive, 'outputs', reflector, checker);
  const outputsFromFields = parseDecoratedFields(
      filterToMembersWithDecorator(decoratedElements, 'Output', coreModule), reflector, checker,
      resolveOutput) as{[field: string]: string};
  // Construct the list of queries.
  const contentChildFromFields = queriesFromFields(
      filterToMembersWithDecorator(decoratedElements, 'ContentChild', coreModule), reflector,
      checker);
  const contentChildrenFromFields = queriesFromFields(
      filterToMembersWithDecorator(decoratedElements, 'ContentChildren', coreModule), reflector,
      checker);

  const queries = [...contentChildFromFields, ...contentChildrenFromFields];

  if (directive.has('queries')) {
    const queriesFromDecorator =
        extractQueriesFromDecorator(directive.get('queries') !, reflector, checker, isCore);
    queries.push(...queriesFromDecorator.content);
  }

  // Parse the selector.
  let selector = '';
  if (directive.has('selector')) {
    const expr = directive.get('selector') !;
    const resolved = staticallyResolve(expr, reflector, checker);
    if (typeof resolved !== 'string') {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, expr, `selector must be a string`);
    }
    selector = resolved;
  }

  const host = extractHostBindings(directive, decoratedElements, reflector, checker, coreModule);

  const providers: Expression|null =
      directive.has('providers') ? new WrappedNodeExpr(directive.get('providers') !) : null;

  // Determine if `ngOnChanges` is a lifecycle hook defined on the component.
  const usesOnChanges = members.some(
      member => !member.isStatic && member.kind === ClassMemberKind.Method &&
          member.name === 'ngOnChanges');

  // Parse exportAs.
  let exportAs: string|null = null;
  if (directive.has('exportAs')) {
    const expr = directive.get('exportAs') !;
    const resolved = staticallyResolve(expr, reflector, checker);
    if (typeof resolved !== 'string') {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, expr, `exportAs must be a string`);
    }
    exportAs = resolved;
  }

  // Detect if the component inherits from another class
  const usesInheritance = clazz.heritageClauses !== undefined &&
      clazz.heritageClauses.some(hc => hc.token === ts.SyntaxKind.ExtendsKeyword);
  const metadata: R3DirectiveMetadata = {
    name: clazz.name !.text,
    deps: getConstructorDependencies(clazz, reflector, isCore), host,
    lifecycle: {
        usesOnChanges,
    },
    inputs: {...inputsFromMeta, ...inputsFromFields},
    outputs: {...outputsFromMeta, ...outputsFromFields}, queries, selector,
    type: new WrappedNodeExpr(clazz.name !),
    typeArgumentCount: reflector.getGenericArityOfClass(clazz) || 0,
    typeSourceSpan: null !, usesInheritance, exportAs, providers
  };
  return {decoratedElements, decorator: directive, metadata};
}

export function extractQueryMetadata(
    exprNode: ts.Node, name: string, args: ReadonlyArray<ts.Expression>, propertyName: string,
    reflector: ReflectionHost, checker: ts.TypeChecker): R3QueryMetadata {
  if (args.length === 0) {
    throw new FatalDiagnosticError(
        ErrorCode.DECORATOR_ARITY_WRONG, exprNode, `@${name} must have arguments`);
  }
  const first = name === 'ViewChild' || name === 'ContentChild';
  const node = unwrapForwardRef(args[0], reflector);
  const arg = staticallyResolve(node, reflector, checker);

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
      const descendantsValue = staticallyResolve(options.get('descendants') !, reflector, checker);
      if (typeof descendantsValue !== 'boolean') {
        throw new Error(`@${name} options.descendants must be a boolean`);
      }
      descendants = descendantsValue;
    }
  } else if (args.length > 2) {
    // Too many arguments.
    throw new Error(`@${name} has too many arguments`);
  }

  return {
      propertyName, predicate, first, descendants, read,
  };
}

export function extractQueriesFromDecorator(
    queryData: ts.Expression, reflector: ReflectionHost, checker: ts.TypeChecker,
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
        queryExpr, type.name, queryExpr.arguments || [], propertyName, reflector, checker);
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
    directive: Map<string, ts.Expression>, field: string, reflector: ReflectionHost,
    checker: ts.TypeChecker): null|string[] {
  if (!directive.has(field)) {
    return null;
  }

  // Resolve the field of interest from the directive metadata to a string[].
  const value = staticallyResolve(directive.get(field) !, reflector, checker);
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
    directive: Map<string, ts.Expression>, field: string, reflector: ReflectionHost,
    checker: ts.TypeChecker): {[field: string]: string} {
  const metaValues = parseFieldArrayValue(directive, field, reflector, checker);
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
    fields: {member: ClassMember, decorators: Decorator[]}[], reflector: ReflectionHost,
    checker: ts.TypeChecker,
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
            const property = staticallyResolve(decorator.args[0], reflector, checker);
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
    checker: ts.TypeChecker): R3QueryMetadata[] {
  return fields.map(({member, decorators}) => {
    if (decorators.length !== 1) {
      throw new Error(`Cannot have multiple query decorators on the same class member`);
    } else if (!isPropertyTypeMember(member)) {
      throw new Error(`Query decorator must go on a property-type member`);
    }
    const decorator = decorators[0];
    return extractQueryMetadata(
        decorator.node, decorator.name, decorator.args || [], member.name, reflector, checker);
  });
}

function isPropertyTypeMember(member: ClassMember): boolean {
  return member.kind === ClassMemberKind.Getter || member.kind === ClassMemberKind.Setter ||
      member.kind === ClassMemberKind.Property;
}

type StringMap = {
  [key: string]: string
};

function extractHostBindings(
    metadata: Map<string, ts.Expression>, members: ClassMember[], reflector: ReflectionHost,
    checker: ts.TypeChecker, coreModule: string | undefined): {
  attributes: StringMap,
  listeners: StringMap,
  properties: StringMap,
} {
  let hostMetadata: StringMap = {};
  if (metadata.has('host')) {
    const expr = metadata.get('host') !;
    const hostMetaMap = staticallyResolve(expr, reflector, checker);
    if (!(hostMetaMap instanceof Map)) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL, expr, `Decorator host metadata must be an object`);
    }
    hostMetaMap.forEach((value, key) => {
      if (typeof value !== 'string' || typeof key !== 'string') {
        throw new Error(`Decorator host metadata must be a string -> string object, got ${value}`);
      }
      hostMetadata[key] = value;
    });
  }

  const {attributes, listeners, properties, animations} = parseHostBindings(hostMetadata);

  filterToMembersWithDecorator(members, 'HostBinding', coreModule)
      .forEach(({member, decorators}) => {
        decorators.forEach(decorator => {
          let hostPropertyName: string = member.name;
          if (decorator.args !== null && decorator.args.length > 0) {
            if (decorator.args.length !== 1) {
              throw new Error(`@HostBinding() can have at most one argument`);
            }

            const resolved = staticallyResolve(decorator.args[0], reflector, checker);
            if (typeof resolved !== 'string') {
              throw new Error(`@HostBinding()'s argument must be a string`);
            }

            hostPropertyName = resolved;
          }

          properties[hostPropertyName] = member.name;
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

            const resolved = staticallyResolve(decorator.args[0], reflector, checker);
            if (typeof resolved !== 'string') {
              throw new FatalDiagnosticError(
                  ErrorCode.VALUE_HAS_WRONG_TYPE, decorator.args[0],
                  `@HostListener()'s event name argument must be a string`);
            }

            eventName = resolved;

            if (decorator.args.length === 2) {
              const resolvedArgs = staticallyResolve(decorator.args[1], reflector, checker);
              if (!isStringArrayOrDie(resolvedArgs, '@HostListener.args')) {
                throw new FatalDiagnosticError(
                    ErrorCode.VALUE_HAS_WRONG_TYPE, decorator.args[1],
                    `@HostListener second argument must be a string array`);
              }
              args = resolvedArgs;
            }
          }

          listeners[eventName] = `${member.name}(${args.join(',')})`;
        });
      });
  return {attributes, properties, listeners};
}

const QUERY_TYPES = new Set([
  'ContentChild',
  'ContentChildren',
  'ViewChild',
  'ViewChildren',
]);
