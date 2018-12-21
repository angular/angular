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
   * (E.g. a call expression for a function declared in `.d.ts`.)
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
   * A value could not be determined statically for any reason other the above.
   */
  UNKNOWN,
}

/**
 * Represents a value which cannot be determined statically.
 */
export class DynamicValue<R = {}> {
  private constructor(
      readonly node: ts.Node, readonly reason: R, private code: DynamicValueReason) {}

  static fromDynamicInput(node: ts.Node, input: DynamicValue): DynamicValue<DynamicValue> {
    return new DynamicValue(node, input, DynamicValueReason.DYNAMIC_INPUT);
  }

  static fromDynamicString(node: ts.Node): DynamicValue {
    return new DynamicValue(node, {}, DynamicValueReason.DYNAMIC_STRING);
  }

  static fromExternalReference(node: ts.Node, ref: Reference<ts.Declaration>):
      DynamicValue<Reference<ts.Declaration>> {
    return new DynamicValue(node, ref, DynamicValueReason.EXTERNAL_REFERENCE);
  }

  static fromUnknownExpressionType(node: ts.Node): DynamicValue {
    return new DynamicValue(node, {}, DynamicValueReason.UNKNOWN_EXPRESSION_TYPE);
  }

  static fromUnknownIdentifier(node: ts.Identifier): DynamicValue {
    return new DynamicValue(node, {}, DynamicValueReason.UNKNOWN_IDENTIFIER);
  }

  static fromUnknown(node: ts.Node): DynamicValue {
    return new DynamicValue(node, {}, DynamicValueReason.UNKNOWN);
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

  isFromUnknown(this: DynamicValue<R>): this is DynamicValue {
    return this.code === DynamicValueReason.UNKNOWN;
  }
}
