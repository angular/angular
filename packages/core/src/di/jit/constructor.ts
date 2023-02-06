/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';

/**
 * Heuristically determine if a `type` has a constructor that should be treated as "fully optional"
 * (that is, invokable without passing arguments).
 *
 * To determine this, the class `.toString()` is used to access the code of the class, and the
 * heuristic looks for the constructor method. If a constructor is found with its first argument
 * having a default value initializer, then the constructor is considered to be fully optional.
 *
 * This is only a heuristic as different downlevelings of classes might break this rudimentary
 * parsing of the code, as might other edge cases in the class code (using the string 'constructor('
 * in other places) or extensive use of other syntax (like destructuring) in the constructor itself.
 */
export function isProbablyFullyOptionalConstructor(type: Type<any>): boolean {
  const code = type.toString();

  // Only accept ECMAScript classes.
  if (!code.startsWith('class ')) {
    return false;
  }

  // Look for the constructor if one exists.
  const ctorPos = code.indexOf('constructor(');
  if (ctorPos === -1) {
    // Without a constructor, either:
    //  - the constructor is inherited from the base class, or
    //  - there's actually no constructor.
    //
    // In either case, we want to fall back to the normal JIT compilation for constructor factories,
    // which will do the right thing in both cases.
    return false;
  }

  const ctor = code.substring(ctorPos + 'constructor('.length);

  // We scan the constructor's first parameter and attempt to determine if it has an optional
  // assignment. This is complicated by the fact that the first parameter could be destructured.
  let destructuringOpeners = 0;
  for (const char of ctor) {
    switch (char) {
      case '{':
      case '[':
        // Some kind of destructuring operation. Keep track of the number of openers as that
        // determines the syntactic context of future characters.
        destructuringOpeners++;
        break;
      case '}':
      case ']':
        destructuringOpeners--;
        if (destructuringOpeners < 0) {
          // Something went wrong - we saw more closing characters than opening characters.
          return false;
        }
        break;
      case ',':
        // Commas are fine inside destructuring operations, but if we encounter a comma outside of
        // destructuring, we've moved on to the second parameter without finding an optional
        // assignment, which means this constructor is not fully optional.
        if (destructuringOpeners === 0) {
          // This comma is outside of destructuring, which means this constructor is not fully
          // optional.
          return false;
        }
        break;
      case '=':
        // Finding an assignment inside of destructuring means that we're making individual fields
        // optional and not the whole first parameter.
        if (destructuringOpeners > 0) {
          return false;
        }

        // Otherwise, this is an optional assignment for the first parameter. Since non-optional
        // parameters cannot follow optional ones, this means the whole constructor is legal to call
        // with no arguments.
        //
        // Note that this is a looser condition than the AOT compiler enforces, since we only
        // require initialization of the first parameter and not all parameters. That is, we could
        // be looking at a signature `constructor(a = X, y?)` which the AOT compiler would not see
        // as "fully optional". This is a limitation of how much syntax we want to "parse" for this
        // heuristic.
        return true;
      case ')':
        // We're leaving the constructor context without finding an optional assignment.
        return false;
    }
  }

  return false;
}
