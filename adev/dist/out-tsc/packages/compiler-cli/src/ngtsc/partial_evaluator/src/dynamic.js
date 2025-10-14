/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Represents a value which cannot be determined statically.
 */
export class DynamicValue {
  node;
  reason;
  code;
  constructor(node, reason, code) {
    this.node = node;
    this.reason = reason;
    this.code = code;
  }
  static fromDynamicInput(node, input) {
    return new DynamicValue(node, input, 0 /* DynamicValueReason.DYNAMIC_INPUT */);
  }
  static fromDynamicString(node) {
    return new DynamicValue(node, undefined, 1 /* DynamicValueReason.DYNAMIC_STRING */);
  }
  static fromExternalReference(node, ref) {
    return new DynamicValue(node, ref, 2 /* DynamicValueReason.EXTERNAL_REFERENCE */);
  }
  static fromUnsupportedSyntax(node) {
    return new DynamicValue(node, undefined, 3 /* DynamicValueReason.UNSUPPORTED_SYNTAX */);
  }
  static fromUnknownIdentifier(node) {
    return new DynamicValue(node, undefined, 4 /* DynamicValueReason.UNKNOWN_IDENTIFIER */);
  }
  static fromInvalidExpressionType(node, value) {
    return new DynamicValue(node, value, 5 /* DynamicValueReason.INVALID_EXPRESSION_TYPE */);
  }
  static fromComplexFunctionCall(node, fn) {
    return new DynamicValue(node, fn, 6 /* DynamicValueReason.COMPLEX_FUNCTION_CALL */);
  }
  static fromDynamicType(node) {
    return new DynamicValue(node, undefined, 7 /* DynamicValueReason.DYNAMIC_TYPE */);
  }
  static fromSyntheticInput(node, value) {
    return new DynamicValue(node, value, 8 /* DynamicValueReason.SYNTHETIC_INPUT */);
  }
  static fromUnknown(node) {
    return new DynamicValue(node, undefined, 9 /* DynamicValueReason.UNKNOWN */);
  }
  isFromDynamicInput() {
    return this.code === 0 /* DynamicValueReason.DYNAMIC_INPUT */;
  }
  isFromDynamicString() {
    return this.code === 1 /* DynamicValueReason.DYNAMIC_STRING */;
  }
  isFromExternalReference() {
    return this.code === 2 /* DynamicValueReason.EXTERNAL_REFERENCE */;
  }
  isFromUnsupportedSyntax() {
    return this.code === 3 /* DynamicValueReason.UNSUPPORTED_SYNTAX */;
  }
  isFromUnknownIdentifier() {
    return this.code === 4 /* DynamicValueReason.UNKNOWN_IDENTIFIER */;
  }
  isFromInvalidExpressionType() {
    return this.code === 5 /* DynamicValueReason.INVALID_EXPRESSION_TYPE */;
  }
  isFromComplexFunctionCall() {
    return this.code === 6 /* DynamicValueReason.COMPLEX_FUNCTION_CALL */;
  }
  isFromDynamicType() {
    return this.code === 7 /* DynamicValueReason.DYNAMIC_TYPE */;
  }
  isFromUnknown() {
    return this.code === 9 /* DynamicValueReason.UNKNOWN */;
  }
  accept(visitor) {
    switch (this.code) {
      case 0 /* DynamicValueReason.DYNAMIC_INPUT */:
        return visitor.visitDynamicInput(this);
      case 1 /* DynamicValueReason.DYNAMIC_STRING */:
        return visitor.visitDynamicString(this);
      case 2 /* DynamicValueReason.EXTERNAL_REFERENCE */:
        return visitor.visitExternalReference(this);
      case 3 /* DynamicValueReason.UNSUPPORTED_SYNTAX */:
        return visitor.visitUnsupportedSyntax(this);
      case 4 /* DynamicValueReason.UNKNOWN_IDENTIFIER */:
        return visitor.visitUnknownIdentifier(this);
      case 5 /* DynamicValueReason.INVALID_EXPRESSION_TYPE */:
        return visitor.visitInvalidExpressionType(this);
      case 6 /* DynamicValueReason.COMPLEX_FUNCTION_CALL */:
        return visitor.visitComplexFunctionCall(this);
      case 7 /* DynamicValueReason.DYNAMIC_TYPE */:
        return visitor.visitDynamicType(this);
      case 8 /* DynamicValueReason.SYNTHETIC_INPUT */:
        return visitor.visitSyntheticInput(this);
      case 9 /* DynamicValueReason.UNKNOWN */:
        return visitor.visitUnknown(this);
    }
  }
}
//# sourceMappingURL=dynamic.js.map
