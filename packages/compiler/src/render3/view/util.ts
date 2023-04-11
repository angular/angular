/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from '../../constant_pool';
import {BindingType, Interpolation} from '../../expression_parser/ast';
import * as o from '../../output/output_ast';
import {ParseSourceSpan} from '../../parse_util';
import * as t from '../r3_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {ForwardRefHandling} from '../util';

import {R3QueryMetadata} from './api';
import {isI18nAttribute} from './i18n/util';


/**
 * Checks whether an object key contains potentially unsafe chars, thus the key should be wrapped in
 * quotes. Note: we do not wrap all keys into quotes, as it may have impact on minification and may
 * bot work in some cases when object keys are mangled by minifier.
 *
 * TODO(FW-1136): this is a temporary solution, we need to come up with a better way of working with
 * inputs that contain potentially unsafe chars.
 */
const UNSAFE_OBJECT_KEY_NAME_REGEXP = /[-.]/;

/** Name of the temporary to use during data binding */
export const TEMPORARY_NAME = '_t';

/** Name of the context parameter passed into a template function */
export const CONTEXT_NAME = 'ctx';

/** Name of the RenderFlag passed into a template function */
export const RENDER_FLAGS = 'rf';

/** The prefix reference variables */
export const REFERENCE_PREFIX = '_r';

/** The name of the implicit context reference */
export const IMPLICIT_REFERENCE = '$implicit';

/** Non bindable attribute name **/
export const NON_BINDABLE_ATTR = 'ngNonBindable';

/** Name for the variable keeping track of the context returned by `ɵɵrestoreView`. */
export const RESTORED_VIEW_CONTEXT_NAME = 'restoredCtx';

/**
 * Maximum length of a single instruction chain. Because our output AST uses recursion, we're
 * limited in how many expressions we can nest before we reach the call stack limit. This
 * length is set very conservatively in order to reduce the chance of problems.
 */
const MAX_CHAIN_LENGTH = 500;

/** Instructions that support chaining. */
const CHAINABLE_INSTRUCTIONS = new Set([
  R3.element,
  R3.elementStart,
  R3.elementEnd,
  R3.elementContainer,
  R3.elementContainerStart,
  R3.elementContainerEnd,
  R3.i18nExp,
  R3.listener,
  R3.classProp,
  R3.syntheticHostListener,
  R3.hostProperty,
  R3.syntheticHostProperty,
  R3.property,
  R3.propertyInterpolate1,
  R3.propertyInterpolate2,
  R3.propertyInterpolate3,
  R3.propertyInterpolate4,
  R3.propertyInterpolate5,
  R3.propertyInterpolate6,
  R3.propertyInterpolate7,
  R3.propertyInterpolate8,
  R3.propertyInterpolateV,
  R3.attribute,
  R3.attributeInterpolate1,
  R3.attributeInterpolate2,
  R3.attributeInterpolate3,
  R3.attributeInterpolate4,
  R3.attributeInterpolate5,
  R3.attributeInterpolate6,
  R3.attributeInterpolate7,
  R3.attributeInterpolate8,
  R3.attributeInterpolateV,
  R3.styleProp,
  R3.stylePropInterpolate1,
  R3.stylePropInterpolate2,
  R3.stylePropInterpolate3,
  R3.stylePropInterpolate4,
  R3.stylePropInterpolate5,
  R3.stylePropInterpolate6,
  R3.stylePropInterpolate7,
  R3.stylePropInterpolate8,
  R3.stylePropInterpolateV,
  R3.textInterpolate,
  R3.textInterpolate1,
  R3.textInterpolate2,
  R3.textInterpolate3,
  R3.textInterpolate4,
  R3.textInterpolate5,
  R3.textInterpolate6,
  R3.textInterpolate7,
  R3.textInterpolate8,
  R3.textInterpolateV,
]);

/**
 * Possible types that can be used to generate the parameters of an instruction call.
 * If the parameters are a function, the function will be invoked at the time the instruction
 * is generated.
 */
export type InstructionParams = (o.Expression|o.Expression[])|(() => (o.Expression|o.Expression[]));

/** Necessary information to generate a call to an instruction function. */
export interface Instruction {
  span: ParseSourceSpan|null;
  reference: o.ExternalReference;
  paramsOrFn?: InstructionParams;
}

/** Generates a call to a single instruction. */
export function invokeInstruction(
    span: ParseSourceSpan|null, reference: o.ExternalReference,
    params: o.Expression[]): o.Expression {
  return o.importExpr(reference, null, span).callFn(params, span);
}

/**
 * Creates an allocator for a temporary variable.
 *
 * A variable declaration is added to the statements the first time the allocator is invoked.
 */
export function temporaryAllocator(statements: o.Statement[], name: string): () => o.ReadVarExpr {
  let temp: o.ReadVarExpr|null = null;
  return () => {
    if (!temp) {
      statements.push(new o.DeclareVarStmt(TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
      temp = o.variable(name);
    }
    return temp;
  };
}


export function invalid<T>(this: t.Visitor, arg: o.Expression|o.Statement|t.Node): never {
  throw new Error(
      `Invalid state: Visitor ${this.constructor.name} doesn't handle ${arg.constructor.name}`);
}

export function asLiteral(value: any): o.Expression {
  if (Array.isArray(value)) {
    return o.literalArr(value.map(asLiteral));
  }
  return o.literal(value, o.INFERRED_TYPE);
}

export function conditionallyCreateDirectiveBindingLiteral(
    map: Record<string, string|{
      classPropertyName: string;
      bindingPropertyName: string;
    }>, keepDeclared?: boolean): o.Expression|null {
  const keys = Object.getOwnPropertyNames(map);

  if (keys.length === 0) {
    return null;
  }

  return o.literalMap(keys.map(key => {
    const value = map[key];
    let declaredName: string;
    let publicName: string;
    let minifiedName: string;
    let needsDeclaredName: boolean;
    if (typeof value === 'string') {
      // canonical syntax: `dirProp: publicProp`
      declaredName = key;
      minifiedName = key;
      publicName = value;
      needsDeclaredName = false;
    } else {
      minifiedName = key;
      declaredName = value.classPropertyName;
      publicName = value.bindingPropertyName;
      needsDeclaredName = publicName !== declaredName;
    }
    return {
      key: minifiedName,
      // put quotes around keys that contain potentially unsafe characters
      quoted: UNSAFE_OBJECT_KEY_NAME_REGEXP.test(minifiedName),
      value: (keepDeclared && needsDeclaredName) ?
          o.literalArr([asLiteral(publicName), asLiteral(declaredName)]) :
          asLiteral(publicName)
    };
  }));
}

/**
 *  Remove trailing null nodes as they are implied.
 */
export function trimTrailingNulls(parameters: o.Expression[]): o.Expression[] {
  while (o.isNull(parameters[parameters.length - 1])) {
    parameters.pop();
  }
  return parameters;
}

export function getQueryPredicate(
    query: R3QueryMetadata, constantPool: ConstantPool): o.Expression {
  if (Array.isArray(query.predicate)) {
    let predicate: o.Expression[] = [];
    query.predicate.forEach((selector: string): void => {
      // Each item in predicates array may contain strings with comma-separated refs
      // (for ex. 'ref, ref1, ..., refN'), thus we extract individual refs and store them
      // as separate array entities
      const selectors = selector.split(',').map(token => o.literal(token.trim()));
      predicate.push(...selectors);
    });
    return constantPool.getConstLiteral(o.literalArr(predicate), true);
  } else {
    // The original predicate may have been wrapped in a `forwardRef()` call.
    switch (query.predicate.forwardRef) {
      case ForwardRefHandling.None:
      case ForwardRefHandling.Unwrapped:
        return query.predicate.expression;
      case ForwardRefHandling.Wrapped:
        return o.importExpr(R3.resolveForwardRef).callFn([query.predicate.expression]);
    }
  }
}

/**
 * A representation for an object literal used during codegen of definition objects. The generic
 * type `T` allows to reference a documented type of the generated structure, such that the
 * property names that are set can be resolved to their documented declaration.
 */
export class DefinitionMap<T = any> {
  values: {key: string, quoted: boolean, value: o.Expression}[] = [];

  set(key: keyof T, value: o.Expression|null): void {
    if (value) {
      this.values.push({key: key as string, value, quoted: false});
    }
  }

  toLiteralMap(): o.LiteralMapExpr {
    return o.literalMap(this.values);
  }
}

/**
 * Extract a map of properties to values for a given element or template node, which can be used
 * by the directive matching machinery.
 *
 * @param elOrTpl the element or template in question
 * @return an object set up for directive matching. For attributes on the element/template, this
 * object maps a property name to its (static) value. For any bindings, this map simply maps the
 * property name to an empty string.
 */
export function getAttrsForDirectiveMatching(elOrTpl: t.Element|
                                             t.Template): {[name: string]: string} {
  const attributesMap: {[name: string]: string} = {};


  if (elOrTpl instanceof t.Template && elOrTpl.tagName !== 'ng-template') {
    elOrTpl.templateAttrs.forEach(a => attributesMap[a.name] = '');
  } else {
    elOrTpl.attributes.forEach(a => {
      if (!isI18nAttribute(a.name)) {
        attributesMap[a.name] = a.value;
      }
    });

    elOrTpl.inputs.forEach(i => {
      if (i.type === BindingType.Property) {
        attributesMap[i.name] = '';
      }
    });
    elOrTpl.outputs.forEach(o => {
      attributesMap[o.name] = '';
    });
  }

  return attributesMap;
}

/**
 * Gets the number of arguments expected to be passed to a generated instruction in the case of
 * interpolation instructions.
 * @param interpolation An interpolation ast
 */
export function getInterpolationArgsLength(interpolation: Interpolation) {
  const {expressions, strings} = interpolation;
  if (expressions.length === 1 && strings.length === 2 && strings[0] === '' && strings[1] === '') {
    // If the interpolation has one interpolated value, but the prefix and suffix are both empty
    // strings, we only pass one argument, to a special instruction like `propertyInterpolate` or
    // `textInterpolate`.
    return 1;
  } else {
    return expressions.length + strings.length;
  }
}

/**
 * Generates the final instruction call statements based on the passed in configuration.
 * Will try to chain instructions as much as possible, if chaining is supported.
 */
export function getInstructionStatements(instructions: Instruction[]): o.Statement[] {
  const statements: o.Statement[] = [];
  let pendingExpression: o.Expression|null = null;
  let pendingExpressionType: o.ExternalReference|null = null;
  let chainLength = 0;

  for (const current of instructions) {
    const resolvedParams =
        (typeof current.paramsOrFn === 'function' ? current.paramsOrFn() : current.paramsOrFn) ??
        [];
    const params = Array.isArray(resolvedParams) ? resolvedParams : [resolvedParams];

    // If the current instruction is the same as the previous one
    // and it can be chained, add another call to the chain.
    if (chainLength < MAX_CHAIN_LENGTH && pendingExpressionType === current.reference &&
        CHAINABLE_INSTRUCTIONS.has(pendingExpressionType)) {
      // We'll always have a pending expression when there's a pending expression type.
      pendingExpression = pendingExpression!.callFn(params, pendingExpression!.sourceSpan);
      chainLength++;
    } else {
      if (pendingExpression !== null) {
        statements.push(pendingExpression.toStmt());
      }
      pendingExpression = invokeInstruction(current.span, current.reference, params);
      pendingExpressionType = current.reference;
      chainLength = 0;
    }
  }

  // Since the current instruction adds the previous one to the statements,
  // we may be left with the final one at the end that is still pending.
  if (pendingExpression !== null) {
    statements.push(pendingExpression.toStmt());
  }

  return statements;
}
