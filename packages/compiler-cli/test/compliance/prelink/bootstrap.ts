/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileFn, doCompile, setCompileFn} from '../mock_compile';

/**
 * A function to compile the given code in two steps:
 *
 * - first compile the code in partial mode
 * - then compile the partially compiled code using the linker
 *
 * This should produce the same output as the full AOT compilation
 */
const linkedCompile: CompileFn = (data, angularFiles, options) => {
  const result = doCompile(data, angularFiles, {...options, compilationMode: 'partial'});
  // TODO: additional post linking
  return result;
};

// Update the function that will do the compiling with this specialised version that
// runs the prelink and postlink parts of AOT compilation, to check it produces the
// same result as a normal full AOT compile.
setCompileFn(linkedCompile);
