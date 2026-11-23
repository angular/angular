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
  ForeignGetContextFn,
  ForeignContentAdapterFn,
  RENDER,
  ON_DESTROY,
  GET_CONTEXT,
  CONTENT_ADAPTER,
} from '../interface/foreign_component';

/**
 * Returns a {@link ForeignComponent} for use in Angular components.
 *
 * @param render A function that renders a foreign component.
 * @param onDestroy A function for foreign content to register a destroy callback.
 * @param contentAdapter A function that adapts Angular content to a representation expected by the
 * foreign component.
 * @param getContext An optional function that captures runtime context.
 * @template TProps The properties of the foreign component.
 * @template TContext The context passed to the foreign component.
 */
export function foreignImport<TProps, TContext = unknown>(
  render: ForeignRenderFn<TProps, TContext>,
  onDestroy: ForeignOnDestroyFn,
  contentAdapter: ForeignContentAdapterFn,
  getContext?: ForeignGetContextFn<TContext>,
): ForeignComponent<TProps, TContext> {
  return {
    [RENDER]: render,
    [ON_DESTROY]: onDestroy,
    [CONTENT_ADAPTER]: contentAdapter,
    [GET_CONTEXT]: getContext,
  };
}
