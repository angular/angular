'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var forward_ref_1 = require('./forward_ref');
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
var ReflectiveKey = (function () {
    /**
     * Private
     */
    function ReflectiveKey(token, id) {
        this.token = token;
        this.id = id;
        if (lang_1.isBlank(token)) {
            throw new exceptions_1.BaseException('Token must be defined!');
        }
    }
    Object.defineProperty(ReflectiveKey.prototype, "displayName", {
        /**
         * Returns a stringified token.
         */
        get: function () { return lang_1.stringify(this.token); },
        enumerable: true,
        configurable: true
    });
    /**
     * Retrieves a `Key` for a token.
     */
    ReflectiveKey.get = function (token) {
        return _globalKeyRegistry.get(forward_ref_1.resolveForwardRef(token));
    };
    Object.defineProperty(ReflectiveKey, "numberOfKeys", {
        /**
         * @returns the number of keys registered in the system.
         */
        get: function () { return _globalKeyRegistry.numberOfKeys; },
        enumerable: true,
        configurable: true
    });
    return ReflectiveKey;
}());
exports.ReflectiveKey = ReflectiveKey;
/**
 * @internal
 */
var KeyRegistry = (function () {
    function KeyRegistry() {
        this._allKeys = new Map();
    }
    KeyRegistry.prototype.get = function (token) {
        if (token instanceof ReflectiveKey)
            return token;
        if (this._allKeys.has(token)) {
            return this._allKeys.get(token);
        }
        var newKey = new ReflectiveKey(token, ReflectiveKey.numberOfKeys);
        this._allKeys.set(token, newKey);
        return newKey;
    };
    Object.defineProperty(KeyRegistry.prototype, "numberOfKeys", {
        get: function () { return this._allKeys.size; },
        enumerable: true,
        configurable: true
    });
    return KeyRegistry;
}());
exports.KeyRegistry = KeyRegistry;
var _globalKeyRegistry = new KeyRegistry();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmbGVjdGl2ZV9rZXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9yZWZsZWN0aXZlX2tleS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQXVDLDBCQUEwQixDQUFDLENBQUE7QUFDbEUsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsNEJBQWdDLGVBQWUsQ0FBQyxDQUFBO0FBRWhEOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0g7SUFDRTs7T0FFRztJQUNILHVCQUFtQixLQUFhLEVBQVMsRUFBVTtRQUFoQyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtRQUNqRCxFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sSUFBSSwwQkFBYSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDcEQsQ0FBQztJQUNILENBQUM7SUFLRCxzQkFBSSxzQ0FBVztRQUhmOztXQUVHO2FBQ0gsY0FBNEIsTUFBTSxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFM0Q7O09BRUc7SUFDSSxpQkFBRyxHQUFWLFVBQVcsS0FBYTtRQUN0QixNQUFNLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLCtCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUtELHNCQUFXLDZCQUFZO1FBSHZCOztXQUVHO2FBQ0gsY0FBb0MsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQy9FLG9CQUFDO0FBQUQsQ0FBQyxBQTFCRCxJQTBCQztBQTFCWSxxQkFBYSxnQkEwQnpCLENBQUE7QUFFRDs7R0FFRztBQUNIO0lBQUE7UUFDVSxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUM7SUFldEQsQ0FBQztJQWJDLHlCQUFHLEdBQUgsVUFBSSxLQUFhO1FBQ2YsRUFBRSxDQUFDLENBQUMsS0FBSyxZQUFZLGFBQWEsQ0FBQztZQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFFakQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsc0JBQUkscUNBQVk7YUFBaEIsY0FBNkIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDM0Qsa0JBQUM7QUFBRCxDQUFDLEFBaEJELElBZ0JDO0FBaEJZLG1CQUFXLGNBZ0J2QixDQUFBO0FBRUQsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtzdHJpbmdpZnksIFR5cGUsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuL2ZvcndhcmRfcmVmJztcblxuLyoqXG4gKiBBIHVuaXF1ZSBvYmplY3QgdXNlZCBmb3IgcmV0cmlldmluZyBpdGVtcyBmcm9tIHRoZSB7QGxpbmsgUmVmbGVjdGl2ZUluamVjdG9yfS5cbiAqXG4gKiBLZXlzIGhhdmU6XG4gKiAtIGEgc3lzdGVtLXdpZGUgdW5pcXVlIGBpZGAuXG4gKiAtIGEgYHRva2VuYC5cbiAqXG4gKiBgS2V5YCBpcyB1c2VkIGludGVybmFsbHkgYnkge0BsaW5rIFJlZmxlY3RpdmVJbmplY3Rvcn0gYmVjYXVzZSBpdHMgc3lzdGVtLXdpZGUgdW5pcXVlIGBpZGAgYWxsb3dzXG4gKiB0aGVcbiAqIGluamVjdG9yIHRvIHN0b3JlIGNyZWF0ZWQgb2JqZWN0cyBpbiBhIG1vcmUgZWZmaWNpZW50IHdheS5cbiAqXG4gKiBgS2V5YCBzaG91bGQgbm90IGJlIGNyZWF0ZWQgZGlyZWN0bHkuIHtAbGluayBSZWZsZWN0aXZlSW5qZWN0b3J9IGNyZWF0ZXMga2V5cyBhdXRvbWF0aWNhbGx5IHdoZW5cbiAqIHJlc29sdmluZ1xuICogcHJvdmlkZXJzLlxuICovXG5leHBvcnQgY2xhc3MgUmVmbGVjdGl2ZUtleSB7XG4gIC8qKlxuICAgKiBQcml2YXRlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW46IE9iamVjdCwgcHVibGljIGlkOiBudW1iZXIpIHtcbiAgICBpZiAoaXNCbGFuayh0b2tlbikpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdUb2tlbiBtdXN0IGJlIGRlZmluZWQhJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmdpZmllZCB0b2tlbi5cbiAgICovXG4gIGdldCBkaXNwbGF5TmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gc3RyaW5naWZ5KHRoaXMudG9rZW4pOyB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhIGBLZXlgIGZvciBhIHRva2VuLlxuICAgKi9cbiAgc3RhdGljIGdldCh0b2tlbjogT2JqZWN0KTogUmVmbGVjdGl2ZUtleSB7XG4gICAgcmV0dXJuIF9nbG9iYWxLZXlSZWdpc3RyeS5nZXQocmVzb2x2ZUZvcndhcmRSZWYodG9rZW4pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB0aGUgbnVtYmVyIG9mIGtleXMgcmVnaXN0ZXJlZCBpbiB0aGUgc3lzdGVtLlxuICAgKi9cbiAgc3RhdGljIGdldCBudW1iZXJPZktleXMoKTogbnVtYmVyIHsgcmV0dXJuIF9nbG9iYWxLZXlSZWdpc3RyeS5udW1iZXJPZktleXM7IH1cbn1cblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGNsYXNzIEtleVJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBfYWxsS2V5cyA9IG5ldyBNYXA8T2JqZWN0LCBSZWZsZWN0aXZlS2V5PigpO1xuXG4gIGdldCh0b2tlbjogT2JqZWN0KTogUmVmbGVjdGl2ZUtleSB7XG4gICAgaWYgKHRva2VuIGluc3RhbmNlb2YgUmVmbGVjdGl2ZUtleSkgcmV0dXJuIHRva2VuO1xuXG4gICAgaWYgKHRoaXMuX2FsbEtleXMuaGFzKHRva2VuKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2FsbEtleXMuZ2V0KHRva2VuKTtcbiAgICB9XG5cbiAgICB2YXIgbmV3S2V5ID0gbmV3IFJlZmxlY3RpdmVLZXkodG9rZW4sIFJlZmxlY3RpdmVLZXkubnVtYmVyT2ZLZXlzKTtcbiAgICB0aGlzLl9hbGxLZXlzLnNldCh0b2tlbiwgbmV3S2V5KTtcbiAgICByZXR1cm4gbmV3S2V5O1xuICB9XG5cbiAgZ2V0IG51bWJlck9mS2V5cygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fYWxsS2V5cy5zaXplOyB9XG59XG5cbnZhciBfZ2xvYmFsS2V5UmVnaXN0cnkgPSBuZXcgS2V5UmVnaXN0cnkoKTtcbiJdfQ==