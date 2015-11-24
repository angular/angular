import { stringify, isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { TypeLiteral } from './type_literal';
import { resolveForwardRef } from './forward_ref';
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
export class Key {
    /**
     * Private
     */
    constructor(token, id) {
        this.token = token;
        this.id = id;
        if (isBlank(token)) {
            throw new BaseException('Token must be defined!');
        }
    }
    /**
     * Returns a stringified token.
     */
    get displayName() { return stringify(this.token); }
    /**
     * Retrieves a `Key` for a token.
     */
    static get(token) { return _globalKeyRegistry.get(resolveForwardRef(token)); }
    /**
     * @returns the number of keys registered in the system.
     */
    static get numberOfKeys() { return _globalKeyRegistry.numberOfKeys; }
}
/**
 * @internal
 */
export class KeyRegistry {
    constructor() {
        this._allKeys = new Map();
    }
    get(token) {
        if (token instanceof Key)
            return token;
        // TODO: workaround for https://github.com/Microsoft/TypeScript/issues/3123
        var theToken = token;
        if (token instanceof TypeLiteral) {
            theToken = token.type;
        }
        token = theToken;
        if (this._allKeys.has(token)) {
            return this._allKeys.get(token);
        }
        var newKey = new Key(token, Key.numberOfKeys);
        this._allKeys.set(token, newKey);
        return newKey;
    }
    get numberOfKeys() { return this._allKeys.size; }
}
var _globalKeyRegistry = new KeyRegistry();
