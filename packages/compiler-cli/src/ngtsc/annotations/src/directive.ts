/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, R3DirectiveMetadata, WrappedNodeExpr, compileDirectiveFromMetadata, makeBindingParser} from '@angular/compiler';
import * as ts from 'typescript';

import {ClassMember, ClassMemberKind, Decorator, Import, ReflectionHost} from '../../host';
import {reflectObjectLiteral, staticallyResolve} from '../../metadata';
import {filterToMembersWithDecorator} from '../../metadata/src/reflector';
import {AnalysisOutput, CompileResult, DecoratorHandler} from '../../transform';

import {SelectorScopeRegistry} from './selector_scope';
import {getConstructorDependencies, isAngularCore} from './util';

const EMPTY_OBJECT: {[key: string]: string} = {};

export class DirectiveDecoratorHandler implements DecoratorHandler<R3DirectiveMetadata> {
  constructor(
      private checker: ts.TypeChecker, private reflector: ReflectionHost,
      private scopeRegistry: SelectorScopeRegistry, private isCore: boolean) {}

  detect(decorators: Decorator[]): Decorator|undefined {
    return decorators.find(
        decorator => decorator.name === 'Directive' && (this.isCore || isAngularCore(decorator)));
  }

  analyze(node: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<R3DirectiveMetadata> {
    const analysis =
        extractDirectiveMetadata(node, decorator, this.checker, this.reflector, this.isCore);

    // If the directive has a selector, it should be registered with the `SelectorScopeRegistry` so
    // when this directive appears in an `@NgModule` scope, its selector can be determined.
    if (analysis && analysis.selector !== null) {
      this.scopeRegistry.registerSelector(node, analysis.selector);
    }

    return {analysis};
  }

  compile(node: ts.ClassDeclaration, analysis: R3DirectiveMetadata): CompileResult {
    const pool = new ConstantPool();
    const res = compileDirectiveFromMetadata(analysis, pool, makeBindingParser());
    return {
      name: 'ngDirectiveDef',
      initializer: res.expression,
      statements: pool.statements,
      type: res.type,
    };
  }
}

/**
 * Helper function to extract metadata from a `Directive` or `Component`.
 */
export function extractDirectiveMetadata(
    clazz: ts.ClassDeclaration, decorator: Decorator, checker: ts.TypeChecker,
    reflector: ReflectionHost, isCore: boolean): R3DirectiveMetadata|undefined {
  if (decorator.args === null || decorator.args.length !== 1) {
    throw new Error(`Incorrect number of arguments to @${decorator.name} decorator`);
  }
  const meta = decorator.args[0];
  if (!ts.isObjectLiteralExpression(meta)) {
    throw new Error(`Decorator argument must be literal.`);
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

  // Construct the map of inputs both from the @Directive/@Component
  // decorator, and the decorated
  // fields.
  const inputsFromMeta = parseFieldToPropertyMapping(directive, 'inputs', reflector, checker);
  const inputsFromFields = parseDecoratedFields(
      filterToMembersWithDecorator(decoratedElements, 'Input', '@angular/core'), reflector,
      checker);

  // And outputs.
  const outputsFromMeta = parseFieldToPropertyMapping(directive, 'outputs', reflector, checker);
  const outputsFromFields = parseDecoratedFields(
      filterToMembersWithDecorator(decoratedElements, '@angular/core', 'Output'), reflector,
      checker);

  // Parse the selector.
  let selector = '';
  if (directive.has('selector')) {
    const resolved = staticallyResolve(directive.get('selector') !, reflector, checker);
    if (typeof resolved !== 'string') {
      throw new Error(`Selector must be a string`);
    }
    selector = resolved;
  }

  // Determine if `ngOnChanges` is a lifecycle hook defined on the component.
  const usesOnChanges = members.find(
                            member => member.isStatic && member.kind === ClassMemberKind.Method &&
                                member.name === 'ngOnChanges') !== undefined;

  // Detect if the component inherits from another class
  const usesInheritance = clazz.heritageClauses !== undefined &&
      clazz.heritageClauses.some(hc => hc.token === ts.SyntaxKind.ExtendsKeyword);
  return {
    name: clazz.name !.text,
    deps: getConstructorDependencies(clazz, reflector, isCore),
    host: {
      attributes: {},
      listeners: {},
      properties: {},
    },
    lifecycle: {
        usesOnChanges,
    },
    inputs: {...inputsFromMeta, ...inputsFromFields},
    outputs: {...outputsFromMeta, ...outputsFromFields},
    queries: [], selector,
    type: new WrappedNodeExpr(clazz.name !),
    typeSourceSpan: null !, usesInheritance,
  };
}

function assertIsStringArray(value: any[]): value is string[] {
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== 'string') {
      throw new Error(`Failed to resolve @Directive.inputs[${i}] to a string`);
    }
  }
  return true;
}

/**
 * Interpret property mapping fields on the decorator (e.g. inputs or outputs) and return the
 * correctly shaped metadata object.
 */
function parseFieldToPropertyMapping(
    directive: Map<string, ts.Expression>, field: string, reflector: ReflectionHost,
    checker: ts.TypeChecker): {[field: string]: string} {
  if (!directive.has(field)) {
    return EMPTY_OBJECT;
  }

  // Resolve the field of interest from the directive metadata to a string[].
  const metaValues = staticallyResolve(directive.get(field) !, reflector, checker);
  if (!Array.isArray(metaValues) || !assertIsStringArray(metaValues)) {
    throw new Error(`Failed to resolve @Directive.${field}`);
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
    checker: ts.TypeChecker): {[field: string]: string} {
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
            results[fieldName] = property;
          } else {
            // Too many arguments.
            throw new Error(
                `Decorator must have 0 or 1 arguments, got ${decorator.args.length} argument(s)`);
          }
        });
        return results;
      },
      {} as{[field: string]: string});
}
