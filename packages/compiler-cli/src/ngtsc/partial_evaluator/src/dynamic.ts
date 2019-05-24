/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../imports';

/**
 * The reason why a value cannot be determined statically.
 */
export const enum DynamicValueReason {
  /**
   * A value could not be determined statically, because it contains a term that could not be
   * determined statically.
   * (E.g. a property assignment or call expression where the lhs is a `DynamicValue`, a template
   * literal with a dynamic expression, an object literal with a spread assignment which could not
   * be determined statically, etc.)
   */
  DYNAMIC_INPUT,

  /**
   * A string could not be statically evaluated.
   * (E.g. a dynamically constructed object property name or a template literal expression that
   * could not be statically resolved to a primitive value.)
   */
  DYNAMIC_STRING,

  /**
   * An external reference could not be resolved to a value which can be evaluated.
   * For example a call expression for a function declared in `.d.ts`, or accessing native globals
   * such as `window`.
   */
  EXTERNAL_REFERENCE,

  /**
   * A type of `ts.Expression` that `StaticInterpreter` doesn't know how to evaluate.
   */
  UNKNOWN_EXPRESSION_TYPE,

  /**
   * A declaration of a `ts.Identifier` could not be found.
   */
  UNKNOWN_IDENTIFIER,

  /**
   * A value could be resolved, but is not an acceptable type for the operation being performed.
   *
   * For example, attempting to call a non-callable expression.
   */
  INVALID_EXPRESSION_TYPE,

  /**
   * A value could not be determined statically for any reason other the above.
   */
  UNKNOWN,
}

/**
 * Represents a value which cannot be determined statically.
 */
export class DynamicValue<R = unknown> {
  private constructor(
      readonly node: ts.Node, readonly reason: R, private code: DynamicValueReason) {}

  static fromDynamicInput(node: ts.Node, input: DynamicValue): DynamicValue<DynamicValue> {
    return new DynamicValue(node, input, DynamicValueReason.DYNAMIC_INPUT);
  }

  static fromDynamicString(node: ts.Node): DynamicValue {
    return new DynamicValue(node, undefined, DynamicValueReason.DYNAMIC_STRING);
  }

  static fromExternalReference(node: ts.Node, ref: Reference<ts.Declaration>):
      DynamicValue<Reference<ts.Declaration>> {
    return new DynamicValue(node, ref, DynamicValueReason.EXTERNAL_REFERENCE);
  }

  static fromUnknownExpressionType(node: ts.Node): DynamicValue {
    return new DynamicValue(node, undefined, DynamicValueReason.UNKNOWN_EXPRESSION_TYPE);
  }

  static fromUnknownIdentifier(node: ts.Identifier): DynamicValue {
    return new DynamicValue(node, undefined, DynamicValueReason.UNKNOWN_IDENTIFIER);
  }

  static fromInvalidExpressionType(node: ts.Node, value: unknown): DynamicValue<unknown> {
    return new DynamicValue(node, value, DynamicValueReason.INVALID_EXPRESSION_TYPE);
  }

  static fromUnknown(node: ts.Node): DynamicValue {
    return new DynamicValue(node, undefined, DynamicValueReason.UNKNOWN);
  }

  isFromDynamicInput(this: DynamicValue<R>): this is DynamicValue<DynamicValue> {
    return this.code === DynamicValueReason.DYNAMIC_INPUT;
  }

  isFromDynamicString(this: DynamicValue<R>): this is DynamicValue {
    return this.code === DynamicValueReason.DYNAMIC_STRING;
  }

  isFromExternalReference(this: DynamicValue<R>): this is DynamicValue<Reference<ts.Declaration>> {
    return this.code === DynamicValueReason.EXTERNAL_REFERENCE;
  }

  isFromUnknownExpressionType(this: DynamicValue<R>): this is DynamicValue {
    return this.code === DynamicValueReason.UNKNOWN_EXPRESSION_TYPE;
  }

  isFromUnknownIdentifier(this: DynamicValue<R>): this is DynamicValue {
    return this.code === DynamicValueReason.UNKNOWN_IDENTIFIER;
  }

  isFromInvalidExpressionType(this: DynamicValue<R>): this is DynamicValue<unknown> {
    return this.code === DynamicValueReason.INVALID_EXPRESSION_TYPE;
  }

  isFromUnknown(this: DynamicValue<R>): this is DynamicValue {
    return this.code === DynamicValueReason.UNKNOWN;
  }
}
