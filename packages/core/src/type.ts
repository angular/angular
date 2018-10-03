/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @description
 *
 * Represents a type that a Component or other object is instances of.
 *
 * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is be represented by
 * the `MyCustomComponent` constructor function.
 *
 *
 */
export const Type = Function;

export function isType(v: any): v is Type<any> {
  return typeof v === 'function';
}

export interface AbstractType<T> extends Function { prototype: T; }
export interface ConcreteType<T> extends Function { new (...args: any[]): T; }

// See https://github.com/angular/angular/pull/25222#issuecomment-426423317 for why
// we have to use union rather than extends. Using extends is a breaking change because
// we get into situations where we both narrow and restrict types during casting which
// causes TypeScript to fail.
export type Type<T> = AbstractType<T>| ConcreteType<T>;
