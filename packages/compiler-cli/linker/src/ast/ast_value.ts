/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '@angular/compiler';
import {FatalLinkerError} from '../fatal_linker_error';
import {AstHost, Range} from './ast_host';

/**
 * This helper class wraps an object expression along with an `AstHost` object, exposing helper
 * methods that make it easier to extract the properties of the object.
 */
export class AstObject<TExpression> {
  /**
   * Create a new `AstObject` from the given `expression` and `host`.
   */
  static parse<TExpression>(expression: TExpression, host: AstHost<TExpression>):
      AstObject<TExpression> {
    const obj = host.parseObjectLiteral(expression);
    return new AstObject<TExpression>(expression, obj, host);
  }

  private constructor(
      readonly expression: TExpression, private obj: Map<string, TExpression>,
      private host: AstHost<TExpression>) {}

  /**
   * Returns true if the object has a property called `propertyName`.
   */
  has(propertyName: string): boolean {
    return this.obj.has(propertyName);
  }

  /**
   * Returns the number value of the property called `propertyName`.
   *
   * Throws an error if there is no such property or the property is not a number.
   */
  getNumber(propertyName: string): number {
    return this.host.parseNumericLiteral(this.getRequiredProperty(propertyName));
  }

  /**
   * Returns the string value of the property called `propertyName`.
   *
   * Throws an error if there is no such property or the property is not a string.
   */
  getString(propertyName: string): string {
    return this.host.parseStringLiteral(this.getRequiredProperty(propertyName));
  }

  /**
   * Returns the boolean value of the property called `propertyName`.
   *
   * Throws an error if there is no such property or the property is not a boolean.
   */
  getBoolean(propertyName: string): boolean {
    return this.host.parseBooleanLiteral(this.getRequiredProperty(propertyName));
  }

  /**
   * Returns the nested `AstObject` parsed from the property called `propertyName`.
   *
   * Throws an error if there is no such property or the property is not an object.
   */
  getObject(propertyName: string): AstObject<TExpression> {
    const expr = this.getRequiredProperty(propertyName);
    const obj = this.host.parseObjectLiteral(expr);
    return new AstObject(expr, obj, this.host);
  }

  /**
   * Returns an array of `AstValue` objects parsed from the property called `propertyName`.
   *
   * Throws an error if there is no such property or the property is not an array.
   */
  getArray(propertyName: string): AstValue<TExpression>[] {
    const arr = this.host.parseArrayLiteral(this.getRequiredProperty(propertyName));
    return arr.map(entry => new AstValue(entry, this.host));
  }

  /**
   * Returns a `WrappedNodeExpr` object that wraps the expression at the property called
   * `propertyName`.
   *
   * Throws an error if there is no such property.
   */
  getOpaque(propertyName: string): o.WrappedNodeExpr<TExpression> {
    return new o.WrappedNodeExpr(this.getRequiredProperty(propertyName));
  }

  /**
   * Returns the raw `TExpression` value of the property called `propertyName`.
   *
   * Throws an error if there is no such property.
   */
  getNode(propertyName: string): TExpression {
    return this.getRequiredProperty(propertyName);
  }

  /**
   * Returns an `AstValue` that wraps the value of the property called `propertyName`.
   *
   * Throws an error if there is no such property.
   */
  getValue(propertyName: string): AstValue<TExpression> {
    return new AstValue(this.getRequiredProperty(propertyName), this.host);
  }

  /**
   * Converts the AstObject to a raw JavaScript object, mapping each property value (as an
   * `AstValue`) to the generic type (`T`) via the `mapper` function.
   */
  toLiteral<T>(mapper: (value: AstValue<TExpression>) => T): {[key: string]: T} {
    const result: {[key: string]: T} = {};
    for (const [key, expression] of this.obj) {
      result[key] = mapper(new AstValue(expression, this.host));
    }
    return result;
  }

  /**
   * Converts the AstObject to a JavaScript Map, mapping each property value (as an
   * `AstValue`) to the generic type (`T`) via the `mapper` function.
   */
  toMap<T>(mapper: (value: AstValue<TExpression>) => T): Map<string, T> {
    const result = new Map<string, T>();
    for (const [key, expression] of this.obj) {
      result.set(key, mapper(new AstValue(expression, this.host)));
    }
    return result;
  }

  private getRequiredProperty(propertyName: string): TExpression {
    if (!this.obj.has(propertyName)) {
      throw new FatalLinkerError(
          this.expression, `Expected property '${propertyName}' to be present.`);
    }
    return this.obj.get(propertyName)!;
  }
}

/**
 * This helper class wraps an `expression`, exposing methods that use the `host` to give
 * access to the underlying value of the wrapped expression.
 */
export class AstValue<TExpression> {
  constructor(readonly expression: TExpression, private host: AstHost<TExpression>) {}

  /**
   * Get the name of the symbol represented by the given expression node, or `null` if it is not a
   * symbol.
   */
  getSymbolName(): string|null {
    return this.host.getSymbolName(this.expression);
  }

  /**
   * Is this value a number?
   */
  isNumber(): boolean {
    return this.host.isNumericLiteral(this.expression);
  }

  /**
   * Parse the number from this value, or error if it is not a number.
   */
  getNumber(): number {
    return this.host.parseNumericLiteral(this.expression);
  }

  /**
   * Is this value a string?
   */
  isString(): boolean {
    return this.host.isStringLiteral(this.expression);
  }

  /**
   * Parse the string from this value, or error if it is not a string.
   */
  getString(): string {
    return this.host.parseStringLiteral(this.expression);
  }

  /**
   * Is this value a boolean?
   */
  isBoolean(): boolean {
    return this.host.isBooleanLiteral(this.expression);
  }

  /**
   * Parse the boolean from this value, or error if it is not a boolean.
   */
  getBoolean(): boolean {
    return this.host.parseBooleanLiteral(this.expression);
  }

  /**
   * Is this value an object literal?
   */
  isObject(): boolean {
    return this.host.isObjectLiteral(this.expression);
  }

  /**
   * Parse this value into an `AstObject`, or error if it is not an object literal.
   */
  getObject(): AstObject<TExpression> {
    return AstObject.parse(this.expression, this.host);
  }

  /**
   * Is this value an array literal?
   */
  isArray(): boolean {
    return this.host.isArrayLiteral(this.expression);
  }

  /**
   * Parse this value into an array of `AstValue` objects, or error if it is not an array literal.
   */
  getArray(): AstValue<TExpression>[] {
    const arr = this.host.parseArrayLiteral(this.expression);
    return arr.map(entry => new AstValue(entry, this.host));
  }

  /**
   * Is this value a function expression?
   */
  isFunction(): boolean {
    return this.host.isFunctionExpression(this.expression);
  }

  /**
   * Extract the return value as an `AstValue` from this value as a function expression, or error if
   * it is not a function expression.
   */
  getFunctionReturnValue(): AstValue<TExpression> {
    return new AstValue(this.host.parseReturnValue(this.expression), this.host);
  }

  /**
   * Return the `TExpression` of this value wrapped in a `WrappedNodeExpr`.
   */
  getOpaque(): o.WrappedNodeExpr<TExpression> {
    return new o.WrappedNodeExpr(this.expression);
  }

  /**
   * Get the range of the location of this value in the original source.
   */
  getRange(): Range {
    return this.host.getRange(this.expression);
  }
}
