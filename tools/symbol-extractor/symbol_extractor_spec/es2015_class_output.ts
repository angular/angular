/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

class HelloWorld {
  greet() {
    console.info('Hello!');
  }
}

// TypeScript generates different output for classes with
// static members.
class WithStaticMembers extends HelloWorld {
  static message = 'literal value';
}
