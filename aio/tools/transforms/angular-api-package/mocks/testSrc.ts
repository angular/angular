/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * This is the module description
 */

export * from './importedSrc';

/**
 * This is some random other comment
 */

/**
 * This is MyClass
 */
export class MyClass {
  message: string;

  /**
   * Create a new MyClass
   *
   * @param name The name to say hello to
   */
  constructor(name: string) { this.message = 'hello ' + name; }

  /**
   * Return a greeting message
   */
  greet() { return this.message; }
}

/**
 * An exported function
 */
export const myFn = (val: number) => val * 2;
