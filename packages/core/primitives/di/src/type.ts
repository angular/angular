/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @description
 *
 * Represents a type that a Component or other object is instances of.
 *
 * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is represented by
 * the `MyCustomComponent` constructor function.
 *
 * @publicApi
 */
export const Type = Function;

export function isType(v: any): v is Type<any> {
  return typeof v === 'function';
}

/**
 * @description
 *
 * Represents an abstract class `T`, if applied to a concrete class it would stop being
 * instantiable.
 *
 * @publicApi
 */
export interface AbstractType<T> extends Function {
  prototype: T;
}

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

/**
 * Returns a writable type version of type.
 *
 * USAGE:
 * Given:
 * ```ts
 * interface Person {readonly name: string}
 * ```
 *
 * We would like to get a read/write version of `Person`.
 * ```ts
 * const WritablePerson = Writable<Person>;
 * ```
 *
 * The result is that you can do:
 *
 * ```ts
 * const readonlyPerson: Person = {name: 'Marry'};
 * readonlyPerson.name = 'John'; // TypeError
 * (readonlyPerson as WritablePerson).name = 'John'; // OK
 *
 * // Error: Correctly detects that `Person` did not have `age` property.
 * (readonlyPerson as WritablePerson).age = 30;
 * ```
 */
export type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};
