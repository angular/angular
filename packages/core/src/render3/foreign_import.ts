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
  ForeignContentAdapterFn,
  RENDER,
  ON_DESTROY,
  CONTENT_ADAPTER,
} from '../interface/foreign_component';

/**
 * Returns a {@link ForeignComponent} for use in Angular components.
 *
 * @template TProps The properties of the foreign component.
 * @param render A function that renders a foreign component.
 * @param onDestroy A function for foreign content to register a destroy callback.
 * @param contentAdapter A function that adapts Angular content to a representation expected by the
 * foreign component.
 */
export function foreignImport<TProps>(
  render: ForeignRenderFn<TProps>,
  onDestroy: ForeignOnDestroyFn,
  contentAdapter: ForeignContentAdapterFn,
): ForeignComponent<TProps> {
  return {
    [RENDER]: render,
    [ON_DESTROY]: onDestroy,
    [CONTENT_ADAPTER]: contentAdapter,
  };
}
