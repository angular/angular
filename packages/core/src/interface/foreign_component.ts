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

/** Symbol used to store and retrieve the content adapter function for a foreign component. */
export const CONTENT_ADAPTER: unique symbol = Symbol('CONTENT_ADAPTER');

/** Symbol used to store and retrieve the context retrieval function for a foreign component. */
export const GET_CONTEXT: unique symbol = Symbol('GET_CONTEXT');

/**
 * A function used to render a foreign component in an Angular template.
 *
 * The function accepts the component's properties and optional context. It should return an array
 * of nodes rendered and owned by the foreign component. It may also return a callback to perform
 * any necessary cleanup when the component is destroyed.
 *
 * @template TProps The properties of the foreign component.
 * @template TContext The context passed to the foreign component.
 */
export type ForeignRenderFn<TProps, TContext> = (
  props: TProps,
  context?: TContext,
) => [Node[], VoidFunction?];

/**
 * A function that captures the runtime context of a foreign component.
 *
 * @template TContext The captured context type.
 */
export type ForeignGetContextFn<TContext> = () => TContext;

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
 * A function that adapts an Angular content producer callback into a compatible representation for
 * the foreign component.
 */
export type ForeignContentAdapterFn = (producer: () => Node[]) => any;

/**
 * Represents a component from another framework that Angular can import and render.
 *
 * @template TProps The properties of the foreign component.
 * @template TContext The context passed to the foreign component.
 */
export interface ForeignComponent<TProps = {}, TContext = unknown> {
  readonly [RENDER]: ForeignRenderFn<TProps, TContext>;
  readonly [ON_DESTROY]: ForeignOnDestroyFn;
  readonly [CONTENT_ADAPTER]: ForeignContentAdapterFn;
  readonly [GET_CONTEXT]?: ForeignGetContextFn<TContext>;
}
