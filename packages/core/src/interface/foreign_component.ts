/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Symbol used to store and retrieve the render function for a foreign component. */
export const RENDER: unique symbol = Symbol('RENDER');

/**
 * A function returned by a {@link ForeignRenderFn} to perform cleanup when the
 * component is destroyed.
 */
export type DisposeFn = () => void;

/**
 * A function used to render a foreign component in an Angular template.
 *
 * The function accepts the component's properties as its only argument. It should return an array
 * of nodes rendered and owned by the foreign component. It may also return a {@link DisposeFn} to
 * be called when the component is destroyed.
 *
 * @template TProps The properties of the foreign component.
 */
export type ForeignRenderFn<TProps> = (props: TProps) => [Node[], DisposeFn?];

/**
 * Represents a component from another framework that Angular can import and render.
 *
 * @template TProps The properties of the foreign component.
 */
export interface ForeignComponent<TProps> {
  readonly [RENDER]: ForeignRenderFn<TProps>;
}
