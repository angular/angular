/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ForeignComponent,
  ForeignRenderFn,
  ForeignOnDestroyFn,
  RENDER,
  ON_DESTROY,
} from '../interface/foreign_component';

/**
 * Returns a {@link ForeignComponent} for use in Angular components.
 *
 * @template TProps The properties of the foreign component.
 * @param render A function that renders a foreign component.
 * @param onDestroy A function for foreign content to register a destroy callback.
 */
export function foreignImport<TProps>(
  render: ForeignRenderFn<TProps>,
  onDestroy: ForeignOnDestroyFn,
): ForeignComponent<TProps> {
  return {
    [RENDER]: render,
    [ON_DESTROY]: onDestroy,
  };
}
