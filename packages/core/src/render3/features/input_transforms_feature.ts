/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DirectiveDef} from '../interfaces/definition';

/**
 * Decorates the directive definition with support for input transform functions.
 *
 * If the directive uses inheritance, the feature should be included before the
 * `InheritDefinitionFeature` to ensure that the `inputTransforms` field is populated.
 *
 * @codeGenApi
 */
export function ɵɵInputTransformsFeature<T>(definition: DirectiveDef<T>): void {
  // TODO(crisbeto): remove this from the compilation
}
