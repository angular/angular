/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {declarationFunctions} from './partial_linkers/partial_linker_selector';

/**
 * Determines if the provided source file may need to be processed by the linker, i.e. whether it
 * potentially contains any declarations. If true is returned, then the source file should be
 * processed by the linker as it may contain declarations that need to be fully compiled. If false
 * is returned, parsing and processing of the source file can safely be skipped to improve
 * performance.
 *
 * This function may return true even for source files that don't actually contain any declarations
 * that need to be compiled.
 *
 * @param path the absolute path of the source file for which to determine whether linking may be
 * needed.
 * @param source the source file content as a string.
 * @returns whether the source file may contain declarations that need to be linked.
 */
export function needsLinking(path: string, source: string): boolean {
  return declarationFunctions.some(fn => source.includes(fn));
}
