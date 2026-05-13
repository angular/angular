/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ForeignComponent} from '../../interface/foreign_component';

/**
 * Creation phase instruction to render a foreign component.
 *
 * @param index The index of the container in the data array.
 * @param foreignComponent The matched foreign component.
 * @param props Aggregate properties and static attributes.
 * @codeGenApi
 */
export function ɵɵforeignComponent<TProps>(
  index: number,
  foreignComponent: ForeignComponent<TProps>,
  props?: TProps,
): void {
  // No-op for now!
}
