/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A replacement for @Injectable to be used in the compiler, so that
 * we don't try to evaluate the metadata in the compiler during AoT.
 * This decorator is enough to make the compiler work with the ReflectiveInjector though.
 * @Annotation
 */
export function CompilerInjectable(): (data: any) => any {
  return (x) => x;
}
