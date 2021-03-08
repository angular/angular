/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This file contains types that will be published to npm in library typings files.

/**
 * @publicApi
 */
export type ɵɵDirectiveDeclaration<
    T, Selector extends string, ExportAs extends
        string[], InputMap extends {[key: string]: string},
                                   OutputMap extends {[key: string]: string},
                                                     QueryFields extends string[]> = unknown;

/**
 * @publicApi
 */
export type ɵɵComponentDeclaration < T, Selector extends String, ExportAs extends string[],
                                                                                  InputMap extends {
  [key: string]: string;
}
, OutputMap extends {
  [key: string]: string;
}
, QueryFields extends string[], NgContentSelectors extends string[] > = unknown;

/**
 * @publicApi
 */
export type ɵɵNgModuleDeclaration<T, Declarations, Imports, Exports> = unknown;

/**
 * @publicApi
 */
export type ɵɵPipeDeclaration<T, Name extends string> = unknown;
