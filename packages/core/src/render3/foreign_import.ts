/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ForeignComponent, ForeignRenderFn, RENDER} from '../interface/foreign_component';

/**
 * Returns a {@link ForeignComponent} for use in Angular components.
 *
 * @template TProps The properties of the foreign component.
 * @param render A function that renders a foreign component.
 */
export function foreignImport<TProps>(render: ForeignRenderFn<TProps>): ForeignComponent<TProps> {
  return {[RENDER]: render};
}
