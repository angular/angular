/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from '../../constant_pool';
import {Interpolation} from '../../expression_parser/ast';
import * as o from '../../output/output_ast';
import {ParseSourceSpan} from '../../parse_util';
import {splitAtColon} from '../../util';
import * as t from '../r3_ast';

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


export function unsupported(this: void|Function, feature: string): never {
  if (this) {
    throw new Error(`Builder ${this.constructor.name} doesn't support ${feature} yet`);
  }
  throw new Error(`Feature ${feature} is not supported yet`);
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

export function conditionallyCreateMapObjectLiteral(
    keys: {[key: string]: string|string[]}, keepDeclared?: boolean): o.Expression|null {
  if (Object.getOwnPropertyNames(keys).length > 0) {
    return mapToExpression(keys, keepDeclared);
  }
  return null;
}

function mapToExpression(
    map: {[key: string]: string|string[]}, keepDeclared?: boolean): o.Expression {
  return o.literalMap(Object.getOwnPropertyNames(map).map(key => {
    // canonical syntax: `dirProp: publicProp`
    // if there is no `:`, use dirProp = elProp
    const value = map[key];
    let declaredName: string;
    let publicName: string;
    let minifiedName: string;
    let needsDeclaredName: boolean;
    if (Array.isArray(value)) {
      [publicName, declaredName] = value;
      minifiedName = key;
      needsDeclaredName = publicName !== declaredName;
    } else {
      [declaredName, publicName] = splitAtColon(key, [key, value]);
      minifiedName = declaredName;
      // Only include the declared name if extracted from the key, i.e. the key contains a colon.
      // Otherwise the declared name should be omitted even if it is different from the public name,
      // as it may have already been minified.
      needsDeclaredName = publicName !== declaredName && key.includes(':');
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
    return query.predicate;
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
      attributesMap[i.name] = '';
    });
    elOrTpl.outputs.forEach(o => {
      attributesMap[o.name] = '';
    });
  }

  return attributesMap;
}

/** Returns a call expression to a chained instruction, e.g. `property(params[0])(params[1])`. */
export function chainedInstruction(
    reference: o.ExternalReference, calls: o.Expression[][], span?: ParseSourceSpan|null) {
  let expression = o.importExpr(reference, null, span) as o.Expression;

  if (calls.length > 0) {
    for (let i = 0; i < calls.length; i++) {
      expression = expression.callFn(calls[i], span);
    }
  } else {
    // Add a blank invocation, in case the `calls` array is empty.
    expression = expression.callFn([], span);
  }

  return expression;
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
