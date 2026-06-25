/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Symbol used to store and retrieve the render function for a foreign component. */
export const RENDER: unique symbol = Symbol('RENDER');

/** Symbol used to store and retrieve the disposal registration function for a foreign component. */
export const ON_DESTROY: unique symbol = Symbol('ON_DESTROY');

/**
 * A function used to render a foreign component in an Angular template.
 *
 * The function accepts the component's properties as its only argument. It should return an array
 * of nodes rendered and owned by the foreign component. It may also return a callback to perform
 * any necessary cleanup when the component is destroyed.
 *
 * @template TProps The properties of the foreign component.
 */
export type ForeignRenderFn<TProps> = (props: TProps) => [Node[], VoidFunction?];

/**
 * A function that allows a foreign component to register a destroy callback.
 *
 * Angular will invoke this function during the creation phase of projected content
 * to provide a cleanup callback. The foreign component is responsible for calling
 * this callback when the container slot is removed or when the foreign component itself
 * is destroyed. This triggers the destruction and lifecycle cleanup of the nested Angular views.
 */
export type ForeignOnDestroyFn = (destroy: VoidFunction) => void;

/**
 * Represents a component from another framework that Angular can import and render.
 *
 * @template TProps The properties of the foreign component.
 */
export interface ForeignComponent<TProps> {
  readonly [RENDER]: ForeignRenderFn<TProps>;
  readonly [ON_DESTROY]: ForeignOnDestroyFn;
}
