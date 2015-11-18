export { TypeLiteral } from './type_literal';
/**
 * A unique object used for retrieving items from the {@link Injector}.
 *
 * Keys have:
 * - a system-wide unique `id`.
 * - a `token`.
 *
 * `Key` is used internally by {@link Injector} because its system-wide unique `id` allows the
 * injector to store created objects in a more efficient way.
 *
 * `Key` should not be created directly. {@link Injector} creates keys automatically when resolving
 * providers.
 */
export declare class Key {
    token: Object;
    id: number;
    /**
     * Private
     */
    constructor(token: Object, id: number);
    /**
     * Returns a stringified token.
     */
    displayName: string;
    /**
     * Retrieves a `Key` for a token.
     */
    static get(token: Object): Key;
    /**
     * @returns the number of keys registered in the system.
     */
    static numberOfKeys: number;
}
