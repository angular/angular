/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {diPublic} from '../di';
import {DirectiveDefInternal} from '../interfaces/definition';

/**
 * This feature publishes the directive (or component) into the DI system, making it visible to
 * others for injection.
 *
 * @param definition
 */
export function PublicFeature<T>(definition: DirectiveDefInternal<T>) {
  definition.diPublic = diPublic;
}
