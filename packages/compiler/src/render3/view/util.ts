/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InputFlags} from '../../core';
import {BindingType} from '../../expression_parser/ast';
import {splitNsName} from '../../ml_parser/tags';
import * as o from '../../output/output_ast';
import {CssSelector} from '../../directive_matching';
import * as t from '../r3_ast';

import {isI18nAttribute} from './i18n/util';

/**
 * Checks whether an object key contains potentially unsafe chars, thus the key should be wrapped in
 * quotes. Note: we do not wrap all keys into quotes, as it may have impact on minification and may
 * not work in some cases when object keys are mangled by a minifier.
 *
 * TODO(FW-1136): this is a temporary solution, we need to come up with a better way of working with
 * inputs that contain potentially unsafe chars.
 */
export const UNSAFE_OBJECT_KEY_NAME_REGEXP = /[-.]/;

/** Name of the temporary to use during data binding */
export const TEMPORARY_NAME = '_t';

/** Name of the context parameter passed into a template function */
export const CONTEXT_NAME = 'ctx';

/** Name of the RenderFlag passed into a template function */
export const RENDER_FLAGS = 'rf';

/**
 * Creates an allocator for a temporary variable.
 *
 * A variable declaration is added to the statements the first time the allocator is invoked.
 */
export function temporaryAllocator(
  pushStatement: (st: o.Statement) => void,
  name: string,
): () => o.ReadVarExpr {
  let temp: o.ReadVarExpr | null = null;
  return () => {
    if (!temp) {
      pushStatement(new o.DeclareVarStmt(TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
      temp = o.variable(name);
    }
    return temp;
  };
}

export function invalid<T>(this: t.Visitor, arg: o.Expression | o.Statement | t.Node): never {
  throw new Error(
    `Invalid state: Visitor ${this.constructor.name} doesn't handle ${arg.constructor.name}`,
  );
}

export function asLiteral(value: any): o.Expression {
  if (Array.isArray(value)) {
    return o.literalArr(value.map(asLiteral));
  }
  return o.literal(value, o.INFERRED_TYPE);
}

/**
 * Serializes inputs and outputs for `defineDirective` and `defineComponent`.
 *
 * This will attempt to generate optimized data structures to minimize memory or
 * file size of fully compiled applications.
 */
export function conditionallyCreateDirectiveBindingLiteral(
  map: Record<
    string,
    | string
    | {
        classPropertyName: string;
        bindingPropertyName: string;
        transformFunction: o.Expression | null;
        isSignal: boolean;
      }
  >,
  forInputs?: boolean,
): o.Expression | null {
  const keys = Object.getOwnPropertyNames(map);

  if (keys.length === 0) {
    return null;
  }

  return o.literalMap(
    keys.map((key) => {
      const value = map[key];
      let declaredName: string;
      let publicName: string;
      let minifiedName: string;
      let expressionValue: o.Expression;

      if (typeof value === 'string') {
        // canonical syntax: `dirProp: publicProp`
        declaredName = key;
        minifiedName = key;
        publicName = value;
        expressionValue = asLiteral(publicName);
      } else {
        minifiedName = key;
        declaredName = value.classPropertyName;
        publicName = value.bindingPropertyName;

        const differentDeclaringName = publicName !== declaredName;
        const hasDecoratorInputTransform = value.transformFunction !== null;
        let flags = InputFlags.None;

        // Build up input flags
        if (value.isSignal) {
          flags |= InputFlags.SignalBased;
        }
        if (hasDecoratorInputTransform) {
          flags |= InputFlags.HasDecoratorInputTransform;
        }

        // Inputs, compared to outputs, will track their declared name (for `ngOnChanges`), support
        // decorator input transform functions, or store flag information if there is any.
        if (
          forInputs &&
          (differentDeclaringName || hasDecoratorInputTransform || flags !== InputFlags.None)
        ) {
          const result = [o.literal(flags), asLiteral(publicName)];

          if (differentDeclaringName || hasDecoratorInputTransform) {
            result.push(asLiteral(declaredName));

            if (hasDecoratorInputTransform) {
              result.push(value.transformFunction!);
            }
          }

          expressionValue = o.literalArr(result);
        } else {
          expressionValue = asLiteral(publicName);
        }
      }

      return {
        key: minifiedName,
        // put quotes around keys that contain potentially unsafe characters
        quoted: UNSAFE_OBJECT_KEY_NAME_REGEXP.test(minifiedName),
        value: expressionValue,
      };
    }),
  );
}

/**
 * A representation for an object literal used during codegen of definition objects. The generic
 * type `T` allows to reference a documented type of the generated structure, such that the
 * property names that are set can be resolved to their documented declaration.
 */
export class DefinitionMap<T = any> {
  values: {key: string; quoted: boolean; value: o.Expression}[] = [];

  set(key: keyof T, value: o.Expression | null): void {
    if (value) {
      const existing = this.values.find((value) => value.key === key);

      if (existing) {
        existing.value = value;
      } else {
        this.values.push({key: key as string, value, quoted: false});
      }
    }
  }

  toLiteralMap(): o.LiteralMapExpr {
    return o.literalMap(this.values);
  }
}

/**
 * Creates a `CssSelector` from an AST node.
 */
export function createCssSelectorFromNode(node: t.Element | t.Template): CssSelector {
  const elementName = node instanceof t.Element ? node.name : 'ng-template';
  const attributes = getAttrsForDirectiveMatching(node);
  const cssSelector = new CssSelector();
  const elementNameNoNs = splitNsName(elementName)[1];

  cssSelector.setElement(elementNameNoNs);

  Object.getOwnPropertyNames(attributes).forEach((name) => {
    const nameNoNs = splitNsName(name)[1];
    const value = attributes[name];

    cssSelector.addAttribute(nameNoNs, value);
    if (name.toLowerCase() === 'class') {
      const classes = value.trim().split(/\s+/);
      classes.forEach((className) => cssSelector.addClassName(className));
    }
  });

  return cssSelector;
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
function getAttrsForDirectiveMatching(elOrTpl: t.Element | t.Template): {[name: string]: string} {
  const attributesMap: {[name: string]: string} = {};

  if (elOrTpl instanceof t.Template && elOrTpl.tagName !== 'ng-template') {
    elOrTpl.templateAttrs.forEach((a) => (attributesMap[a.name] = ''));
  } else {
    elOrTpl.attributes.forEach((a) => {
      if (!isI18nAttribute(a.name)) {
        attributesMap[a.name] = a.value;
      }
    });

    elOrTpl.inputs.forEach((i) => {
      if (i.type === BindingType.Property || i.type === BindingType.TwoWay) {
        attributesMap[i.name] = '';
      }
    });
    elOrTpl.outputs.forEach((o) => {
      attributesMap[o.name] = '';
    });
  }

  return attributesMap;
}
