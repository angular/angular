/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassDeclaration, Decorator} from '../../../src/ngtsc/reflection';

/**
 * A simple container that holds the details of a decorated class that has been
 * found in a `DecoratedFile`.
 */
export class DecoratedClass {
  /**
   * Initialize a `DecoratedClass` that was found in a `DecoratedFile`.
   * @param name The name of the class that has been found. This is mostly used
   * for informational purposes.
   * @param declaration The TypeScript AST node where this class is declared. In ES5 code, where a
   * class can be represented by both a variable declaration and a function declaration (inside an
   * IIFE), `declaration` will always refer to the outer variable declaration, which represents the
   * class to the rest of the program.
   * @param decorators The collection of decorators that have been found on this class.
   */
  constructor(
      public name: string, public declaration: ClassDeclaration, public decorators: Decorator[]) {}
}
