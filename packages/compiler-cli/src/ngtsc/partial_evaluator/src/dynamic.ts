/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../imports';

export const enum DynamicValueReason {
  DYNAMIC_INPUT,
  DYNAMIC_STRING,
  DYNAMIC_FN_BODY,
  EXTERNAL_REFERENCE,
  UNKNOWN_EXPRESSION_TYPE,
  UNKNOWN_IDENTIFIER,
  UNKNOWN,
}

/**
 * Represents a value which cannot be determined statically.
 */
export class DynamicValue<R> {
  private constructor(
      readonly node: ts.Node, readonly reason: R, private code: DynamicValueReason) {}

  static fromDynamicInput(node: ts.Node, input: DynamicValue<{}>): DynamicValue<DynamicValue<{}>> {
    return new DynamicValue(node, input, DynamicValueReason.DYNAMIC_INPUT);
  }

  static fromDynamicFnBody(node: ts.Node, fn: Reference<ts.Declaration>):
      DynamicValue<Reference<ts.Declaration>> {
    return new DynamicValue(node, fn, DynamicValueReason.DYNAMIC_FN_BODY);
  }

  static fromDynamicString(node: ts.Node): DynamicValue<{}> {
    return new DynamicValue(node, {}, DynamicValueReason.DYNAMIC_STRING);
  }

  static fromExternalReference(node: ts.Node, ref: Reference<ts.Declaration>):
      DynamicValue<Reference<ts.Declaration>> {
    return new DynamicValue(node, ref, DynamicValueReason.EXTERNAL_REFERENCE);
  }

  static fromUnknownExpressionType(node: ts.Node): DynamicValue<{}> {
    return new DynamicValue(node, {}, DynamicValueReason.UNKNOWN_EXPRESSION_TYPE);
  }

  static fromUnknownIdentifier(node: ts.Identifier): DynamicValue<{}> {
    return new DynamicValue(node, {}, DynamicValueReason.UNKNOWN_IDENTIFIER);
  }

  static fromUnknown(node: ts.Node): DynamicValue<{}> {
    return new DynamicValue(node, {}, DynamicValueReason.UNKNOWN);
  }

  isFromDynamicInput(this: DynamicValue<R>): this is DynamicValue<DynamicValue<{}>> {
    return this.code === DynamicValueReason.DYNAMIC_INPUT;
  }

  isFromDynamicFnBody(this: DynamicValue<R>): this is DynamicValue<Reference<ts.Declaration>> {
    return this.code === DynamicValueReason.DYNAMIC_FN_BODY;
  }

  isFromDynamicString(this: DynamicValue<R>): this is DynamicValue<{}> {
    return this.code === DynamicValueReason.DYNAMIC_STRING;
  }

  isFromExternalReference(this: DynamicValue<R>): this is DynamicValue<Reference<ts.Declaration>> {
    return this.code === DynamicValueReason.EXTERNAL_REFERENCE;
  }

  isFromUnknownExpressionType(this: DynamicValue<R>): this is DynamicValue<{}> {
    return this.code === DynamicValueReason.UNKNOWN_EXPRESSION_TYPE;
  }

  isFromUnknownIdentifier(this: DynamicValue<R>): this is DynamicValue<{}> {
    return this.code === DynamicValueReason.UNKNOWN_IDENTIFIER;
  }

  isFromUnknown(this: DynamicValue<R>): this is DynamicValue<{}> {
    return this.code === DynamicValueReason.UNKNOWN;
  }
}
