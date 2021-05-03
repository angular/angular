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
 * Represents only those types in `T` that are object types.
 */
type ObjectType<T> = Extract<T, object>;

/**
 * Represents the value type of an object literal.
 */
type ObjectValueType<T> = T extends Record<string, infer R>? R : never;

/**
 * Represents the value type of an array literal.
 */
type ArrayValueType<T> = T extends Array<infer R>? R : never;

/**
 * Ensures that `This` has its generic type `Actual` conform to the expected generic type in
 * `Expected`, to disallow calling a method if the generic type does not conform.
 */
type ConformsTo<This, Actual, Expected> = Actual extends Expected ? This : never;

/**
 * Ensures that `This` is an `AstValue` whose generic type conforms to `Expected`, to disallow
 * calling a method if the value's type does not conform.
 */
type HasValueType<This, Expected> =
    This extends AstValue<infer Actual, any>? ConformsTo<This, Actual, Expected>: never;

/**
 * Represents only the string keys of type `T`.
 */
type PropertyKey<T> = keyof T&string;

/**
 * This helper class wraps an object expression along with an `AstHost` object, exposing helper
 * methods that make it easier to extract the properties of the object.
 *
 * The generic `T` is used as reference type of the expected structure that is represented by this
 * object. It does not achieve full type-safety for the provided operations in correspondence with
 * `T`; its main goal is to provide references to a documented type and ensure that the properties
 * that are read from the object are present.
 *
 * Unfortunately, the generic types are unable to prevent reading an optional property from the
 * object without first having called `has` to ensure that the property exists. This is one example
 * of where full type-safety is not achieved.
 */
export class AstObject<T extends object, TExpression> {
  /**
   * Create a new `AstObject` from the given `expression` and `host`.
   */
  static parse<T extends object, TExpression>(expression: TExpression, host: AstHost<TExpression>):
      AstObject<T, TExpression> {
    const obj = host.parseObjectLiteral(expression);
    return new AstObject(expression, obj, host);
  }

  private constructor(
      readonly expression: TExpression, private obj: Map<string, TExpression>,
      private host: AstHost<TExpression>) {}

  /**
   * Returns true if the object has a property called `propertyName`.
   */
  has(propertyName: PropertyKey<T>): boolean {
    return this.obj.has(propertyName);
  }

  /**
   * Returns the number value of the property called `propertyName`.
   *
   * Throws an error if there is no such property or the property is not a number.
   */
  getNumber<K extends PropertyKey<T>>(this: ConformsTo<this, T[K], number>, propertyName: K):
      number {
    return this.host.parseNumericLiteral(this.getRequiredProperty(propertyName));
  }

  /**
   * Returns the string value of the property called `propertyName`.
   *
   * Throws an error if there is no such property or the property is not a string.
   */
  getString<K extends PropertyKey<T>>(this: ConformsTo<this, T[K], string>, propertyName: K):
      string {
    return this.host.parseStringLiteral(this.getRequiredProperty(propertyName));
  }

  /**
   * Returns the boolean value of the property called `propertyName`.
   *
   * Throws an error if there is no such property or the property is not a boolean.
   */
  getBoolean<K extends PropertyKey<T>>(this: ConformsTo<this, T[K], boolean>, propertyName: K):
      boolean {
    return this.host.parseBooleanLiteral(this.getRequiredProperty(propertyName)) as any;
  }

  /**
   * Returns the nested `AstObject` parsed from the property called `propertyName`.
   *
   * Throws an error if there is no such property or the property is not an object.
   */
  getObject<K extends PropertyKey<T>>(this: ConformsTo<this, T[K], object>, propertyName: K):
      AstObject<ObjectType<T[K]>, TExpression> {
    const expr = this.getRequiredProperty(propertyName);
    const obj = this.host.parseObjectLiteral(expr);
    return new AstObject(expr, obj, this.host);
  }

  /**
   * Returns an array of `AstValue` objects parsed from the property called `propertyName`.
   *
   * Throws an error if there is no such property or the property is not an array.
   */
  getArray<K extends PropertyKey<T>>(this: ConformsTo<this, T[K], unknown[]>, propertyName: K):
      AstValue<ArrayValueType<T[K]>, TExpression>[] {
    const arr = this.host.parseArrayLiteral(this.getRequiredProperty(propertyName));
    return arr.map(entry => new AstValue(entry, this.host));
  }

  /**
   * Returns a `WrappedNodeExpr` object that wraps the expression at the property called
   * `propertyName`.
   *
   * Throws an error if there is no such property.
   */
  getOpaque(propertyName: PropertyKey<T>): o.WrappedNodeExpr<TExpression> {
    return new o.WrappedNodeExpr(this.getRequiredProperty(propertyName));
  }

  /**
   * Returns the raw `TExpression` value of the property called `propertyName`.
   *
   * Throws an error if there is no such property.
   */
  getNode(propertyName: PropertyKey<T>): TExpression {
    return this.getRequiredProperty(propertyName);
  }

  /**
   * Returns an `AstValue` that wraps the value of the property called `propertyName`.
   *
   * Throws an error if there is no such property.
   */
  getValue<K extends PropertyKey<T>>(propertyName: K): AstValue<T[K], TExpression> {
    return new AstValue(this.getRequiredProperty(propertyName), this.host);
  }

  /**
   * Converts the AstObject to a raw JavaScript object, mapping each property value (as an
   * `AstValue`) to the generic type (`T`) via the `mapper` function.
   */
  toLiteral<V>(mapper: (value: AstValue<ObjectValueType<T>, TExpression>) => V): Record<string, V> {
    const result: Record<string, V> = {};
    for (const [key, expression] of this.obj) {
      result[key] = mapper(new AstValue(expression, this.host));
    }
    return result;
  }

  /**
   * Converts the AstObject to a JavaScript Map, mapping each property value (as an
   * `AstValue`) to the generic type (`T`) via the `mapper` function.
   */
  toMap<V>(mapper: (value: AstValue<ObjectValueType<T>, TExpression>) => V): Map<string, V> {
    const result = new Map<string, V>();
    for (const [key, expression] of this.obj) {
      result.set(key, mapper(new AstValue(expression, this.host)));
    }
    return result;
  }

  private getRequiredProperty(propertyName: PropertyKey<T>): TExpression {
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
 *
 * The generic `T` is used as reference type of the expected type that is represented by this value.
 * It does not achieve full type-safety for the provided operations in correspondence with `T`; its
 * main goal is to provide references to a documented type.
 */
export class AstValue<T, TExpression> {
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
  getNumber(this: HasValueType<this, number>): number {
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
  getString(this: HasValueType<this, string>): string {
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
  getBoolean(this: HasValueType<this, boolean>): boolean {
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
  getObject(this: HasValueType<this, object>): AstObject<ObjectType<T>, TExpression> {
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
  getArray(this: HasValueType<this, unknown[]>): AstValue<ArrayValueType<T>, TExpression>[] {
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
  getFunctionReturnValue<R>(this: HasValueType<this, Function>): AstValue<R, TExpression> {
    return new AstValue(this.host.parseReturnValue(this.expression), this.host);
  }

  isCallExpression(): boolean {
    return this.host.isCallExpression(this.expression);
  }

  getCallee(): AstValue<unknown, TExpression> {
    return new AstValue(this.host.parseCallee(this.expression), this.host);
  }

  getArguments(): AstValue<unknown, TExpression>[] {
    const args = this.host.parseArguments(this.expression);
    return args.map(arg => new AstValue(arg, this.host));
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
