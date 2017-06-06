import { stringify, isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { resolveForwardRef } from './forward_ref';
/**
 * A unique object used for retrieving items from the {@link ReflectiveInjector}.
 *
 * Keys have:
 * - a system-wide unique `id`.
 * - a `token`.
 *
 * `Key` is used internally by {@link ReflectiveInjector} because its system-wide unique `id` allows
 * the
 * injector to store created objects in a more efficient way.
 *
 * `Key` should not be created directly. {@link ReflectiveInjector} creates keys automatically when
 * resolving
 * providers.
 */
export class ReflectiveKey {
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
    static get(token) {
        return _globalKeyRegistry.get(resolveForwardRef(token));
    }
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
        if (token instanceof ReflectiveKey)
            return token;
        if (this._allKeys.has(token)) {
            return this._allKeys.get(token);
        }
        var newKey = new ReflectiveKey(token, ReflectiveKey.numberOfKeys);
        this._allKeys.set(token, newKey);
        return newKey;
    }
    get numberOfKeys() { return this._allKeys.size; }
}
var _globalKeyRegistry = new KeyRegistry();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmbGVjdGl2ZV9rZXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9yZWZsZWN0aXZlX2tleS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFNBQVMsRUFBUSxPQUFPLEVBQUMsTUFBTSwwQkFBMEI7T0FDMUQsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxlQUFlO0FBRS9DOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0g7SUFDRTs7T0FFRztJQUNILFlBQW1CLEtBQWEsRUFBUyxFQUFVO1FBQWhDLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxJQUFJLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3BELENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFJLFdBQVcsS0FBYSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFM0Q7O09BRUc7SUFDSCxPQUFPLEdBQUcsQ0FBQyxLQUFhO1FBQ3RCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxXQUFXLFlBQVksS0FBYSxNQUFNLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRUQ7O0dBRUc7QUFDSDtJQUFBO1FBQ1UsYUFBUSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO0lBZXRELENBQUM7SUFiQyxHQUFHLENBQUMsS0FBYTtRQUNmLEVBQUUsQ0FBQyxDQUFDLEtBQUssWUFBWSxhQUFhLENBQUM7WUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBRWpELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVELElBQUksTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELElBQUksWUFBWSxLQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDM0QsQ0FBQztBQUVELElBQUksa0JBQWtCLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7c3RyaW5naWZ5LCBUeXBlLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi9mb3J3YXJkX3JlZic7XG5cbi8qKlxuICogQSB1bmlxdWUgb2JqZWN0IHVzZWQgZm9yIHJldHJpZXZpbmcgaXRlbXMgZnJvbSB0aGUge0BsaW5rIFJlZmxlY3RpdmVJbmplY3Rvcn0uXG4gKlxuICogS2V5cyBoYXZlOlxuICogLSBhIHN5c3RlbS13aWRlIHVuaXF1ZSBgaWRgLlxuICogLSBhIGB0b2tlbmAuXG4gKlxuICogYEtleWAgaXMgdXNlZCBpbnRlcm5hbGx5IGJ5IHtAbGluayBSZWZsZWN0aXZlSW5qZWN0b3J9IGJlY2F1c2UgaXRzIHN5c3RlbS13aWRlIHVuaXF1ZSBgaWRgIGFsbG93c1xuICogdGhlXG4gKiBpbmplY3RvciB0byBzdG9yZSBjcmVhdGVkIG9iamVjdHMgaW4gYSBtb3JlIGVmZmljaWVudCB3YXkuXG4gKlxuICogYEtleWAgc2hvdWxkIG5vdCBiZSBjcmVhdGVkIGRpcmVjdGx5LiB7QGxpbmsgUmVmbGVjdGl2ZUluamVjdG9yfSBjcmVhdGVzIGtleXMgYXV0b21hdGljYWxseSB3aGVuXG4gKiByZXNvbHZpbmdcbiAqIHByb3ZpZGVycy5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlZmxlY3RpdmVLZXkge1xuICAvKipcbiAgICogUHJpdmF0ZVxuICAgKi9cbiAgY29uc3RydWN0b3IocHVibGljIHRva2VuOiBPYmplY3QsIHB1YmxpYyBpZDogbnVtYmVyKSB7XG4gICAgaWYgKGlzQmxhbmsodG9rZW4pKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignVG9rZW4gbXVzdCBiZSBkZWZpbmVkIScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5naWZpZWQgdG9rZW4uXG4gICAqL1xuICBnZXQgZGlzcGxheU5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIHN0cmluZ2lmeSh0aGlzLnRva2VuKTsgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYSBgS2V5YCBmb3IgYSB0b2tlbi5cbiAgICovXG4gIHN0YXRpYyBnZXQodG9rZW46IE9iamVjdCk6IFJlZmxlY3RpdmVLZXkge1xuICAgIHJldHVybiBfZ2xvYmFsS2V5UmVnaXN0cnkuZ2V0KHJlc29sdmVGb3J3YXJkUmVmKHRva2VuKSk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgdGhlIG51bWJlciBvZiBrZXlzIHJlZ2lzdGVyZWQgaW4gdGhlIHN5c3RlbS5cbiAgICovXG4gIHN0YXRpYyBnZXQgbnVtYmVyT2ZLZXlzKCk6IG51bWJlciB7IHJldHVybiBfZ2xvYmFsS2V5UmVnaXN0cnkubnVtYmVyT2ZLZXlzOyB9XG59XG5cbi8qKlxuICogQGludGVybmFsXG4gKi9cbmV4cG9ydCBjbGFzcyBLZXlSZWdpc3RyeSB7XG4gIHByaXZhdGUgX2FsbEtleXMgPSBuZXcgTWFwPE9iamVjdCwgUmVmbGVjdGl2ZUtleT4oKTtcblxuICBnZXQodG9rZW46IE9iamVjdCk6IFJlZmxlY3RpdmVLZXkge1xuICAgIGlmICh0b2tlbiBpbnN0YW5jZW9mIFJlZmxlY3RpdmVLZXkpIHJldHVybiB0b2tlbjtcblxuICAgIGlmICh0aGlzLl9hbGxLZXlzLmhhcyh0b2tlbikpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hbGxLZXlzLmdldCh0b2tlbik7XG4gICAgfVxuXG4gICAgdmFyIG5ld0tleSA9IG5ldyBSZWZsZWN0aXZlS2V5KHRva2VuLCBSZWZsZWN0aXZlS2V5Lm51bWJlck9mS2V5cyk7XG4gICAgdGhpcy5fYWxsS2V5cy5zZXQodG9rZW4sIG5ld0tleSk7XG4gICAgcmV0dXJuIG5ld0tleTtcbiAgfVxuXG4gIGdldCBudW1iZXJPZktleXMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2FsbEtleXMuc2l6ZTsgfVxufVxuXG52YXIgX2dsb2JhbEtleVJlZ2lzdHJ5ID0gbmV3IEtleVJlZ2lzdHJ5KCk7XG4iXX0=