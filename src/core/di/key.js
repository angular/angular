'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var type_literal_1 = require('./type_literal');
var forward_ref_1 = require('./forward_ref');
var type_literal_2 = require('./type_literal');
exports.TypeLiteral = type_literal_2.TypeLiteral;
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
var Key = (function () {
    /**
     * Private
     */
    function Key(token, id) {
        this.token = token;
        this.id = id;
        if (lang_1.isBlank(token)) {
            throw new exceptions_1.BaseException('Token must be defined!');
        }
    }
    Object.defineProperty(Key.prototype, "displayName", {
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
    Key.get = function (token) { return _globalKeyRegistry.get(forward_ref_1.resolveForwardRef(token)); };
    Object.defineProperty(Key, "numberOfKeys", {
        /**
         * @returns the number of keys registered in the system.
         */
        get: function () { return _globalKeyRegistry.numberOfKeys; },
        enumerable: true,
        configurable: true
    });
    return Key;
})();
exports.Key = Key;
/**
 * @internal
 */
var KeyRegistry = (function () {
    function KeyRegistry() {
        this._allKeys = new Map();
    }
    KeyRegistry.prototype.get = function (token) {
        if (token instanceof Key)
            return token;
        // TODO: workaround for https://github.com/Microsoft/TypeScript/issues/3123
        var theToken = token;
        if (token instanceof type_literal_1.TypeLiteral) {
            theToken = token.type;
        }
        token = theToken;
        if (this._allKeys.has(token)) {
            return this._allKeys.get(token);
        }
        var newKey = new Key(token, Key.numberOfKeys);
        this._allKeys.set(token, newKey);
        return newKey;
    };
    Object.defineProperty(KeyRegistry.prototype, "numberOfKeys", {
        get: function () { return this._allKeys.size; },
        enumerable: true,
        configurable: true
    });
    return KeyRegistry;
})();
exports.KeyRegistry = KeyRegistry;
var _globalKeyRegistry = new KeyRegistry();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvZGkva2V5LnRzIl0sIm5hbWVzIjpbIktleSIsIktleS5jb25zdHJ1Y3RvciIsIktleS5kaXNwbGF5TmFtZSIsIktleS5nZXQiLCJLZXkubnVtYmVyT2ZLZXlzIiwiS2V5UmVnaXN0cnkiLCJLZXlSZWdpc3RyeS5jb25zdHJ1Y3RvciIsIktleVJlZ2lzdHJ5LmdldCIsIktleVJlZ2lzdHJ5Lm51bWJlck9mS2V5cyJdLCJtYXBwaW5ncyI6IkFBQUEscUJBQThDLDBCQUEwQixDQUFDLENBQUE7QUFDekUsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsNkJBQTBCLGdCQUFnQixDQUFDLENBQUE7QUFDM0MsNEJBQWdDLGVBQWUsQ0FBQyxDQUFBO0FBRWhELDZCQUEwQixnQkFBZ0IsQ0FBQztBQUFuQyxpREFBbUM7QUFFM0M7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0g7SUFDRUE7O09BRUdBO0lBQ0hBLGFBQW1CQSxLQUFhQSxFQUFTQSxFQUFVQTtRQUFoQ0MsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBUUE7UUFBU0EsT0FBRUEsR0FBRkEsRUFBRUEsQ0FBUUE7UUFDakRBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ25CQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0Esd0JBQXdCQSxDQUFDQSxDQUFDQTtRQUNwREEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFLREQsc0JBQUlBLDRCQUFXQTtRQUhmQTs7V0FFR0E7YUFDSEEsY0FBNEJFLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBRTNEQTs7T0FFR0E7SUFDSUEsT0FBR0EsR0FBVkEsVUFBV0EsS0FBYUEsSUFBU0csTUFBTUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxHQUFHQSxDQUFDQSwrQkFBaUJBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBSzNGSCxzQkFBV0EsbUJBQVlBO1FBSHZCQTs7V0FFR0E7YUFDSEEsY0FBb0NJLE1BQU1BLENBQUNBLGtCQUFrQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBSjtJQUMvRUEsVUFBQ0E7QUFBREEsQ0FBQ0EsQUF4QkQsSUF3QkM7QUF4QlksV0FBRyxNQXdCZixDQUFBO0FBRUQ7O0dBRUc7QUFDSDtJQUFBSztRQUNVQyxhQUFRQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFlQSxDQUFDQTtJQXNCNUNBLENBQUNBO0lBcEJDRCx5QkFBR0EsR0FBSEEsVUFBSUEsS0FBYUE7UUFDZkUsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsWUFBWUEsR0FBR0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFFdkNBLDJFQUEyRUE7UUFDM0VBLElBQUlBLFFBQVFBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ3JCQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxZQUFZQSwwQkFBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLFFBQVFBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBO1FBQ3hCQSxDQUFDQTtRQUNEQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQTtRQUVqQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2xDQSxDQUFDQTtRQUVEQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUM5Q0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDakNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUVERixzQkFBSUEscUNBQVlBO2FBQWhCQSxjQUE2QkcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBSDtJQUMzREEsa0JBQUNBO0FBQURBLENBQUNBLEFBdkJELElBdUJDO0FBdkJZLG1CQUFXLGNBdUJ2QixDQUFBO0FBRUQsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtzdHJpbmdpZnksIENPTlNULCBUeXBlLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtUeXBlTGl0ZXJhbH0gZnJvbSAnLi90eXBlX2xpdGVyYWwnO1xuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi9mb3J3YXJkX3JlZic7XG5cbmV4cG9ydCB7VHlwZUxpdGVyYWx9IGZyb20gJy4vdHlwZV9saXRlcmFsJztcblxuLyoqXG4gKiBBIHVuaXF1ZSBvYmplY3QgdXNlZCBmb3IgcmV0cmlldmluZyBpdGVtcyBmcm9tIHRoZSB7QGxpbmsgSW5qZWN0b3J9LlxuICpcbiAqIEtleXMgaGF2ZTpcbiAqIC0gYSBzeXN0ZW0td2lkZSB1bmlxdWUgYGlkYC5cbiAqIC0gYSBgdG9rZW5gLlxuICpcbiAqIGBLZXlgIGlzIHVzZWQgaW50ZXJuYWxseSBieSB7QGxpbmsgSW5qZWN0b3J9IGJlY2F1c2UgaXRzIHN5c3RlbS13aWRlIHVuaXF1ZSBgaWRgIGFsbG93cyB0aGVcbiAqIGluamVjdG9yIHRvIHN0b3JlIGNyZWF0ZWQgb2JqZWN0cyBpbiBhIG1vcmUgZWZmaWNpZW50IHdheS5cbiAqXG4gKiBgS2V5YCBzaG91bGQgbm90IGJlIGNyZWF0ZWQgZGlyZWN0bHkuIHtAbGluayBJbmplY3Rvcn0gY3JlYXRlcyBrZXlzIGF1dG9tYXRpY2FsbHkgd2hlbiByZXNvbHZpbmdcbiAqIHByb3ZpZGVycy5cbiAqL1xuZXhwb3J0IGNsYXNzIEtleSB7XG4gIC8qKlxuICAgKiBQcml2YXRlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW46IE9iamVjdCwgcHVibGljIGlkOiBudW1iZXIpIHtcbiAgICBpZiAoaXNCbGFuayh0b2tlbikpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdUb2tlbiBtdXN0IGJlIGRlZmluZWQhJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmdpZmllZCB0b2tlbi5cbiAgICovXG4gIGdldCBkaXNwbGF5TmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gc3RyaW5naWZ5KHRoaXMudG9rZW4pOyB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhIGBLZXlgIGZvciBhIHRva2VuLlxuICAgKi9cbiAgc3RhdGljIGdldCh0b2tlbjogT2JqZWN0KTogS2V5IHsgcmV0dXJuIF9nbG9iYWxLZXlSZWdpc3RyeS5nZXQocmVzb2x2ZUZvcndhcmRSZWYodG9rZW4pKTsgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB0aGUgbnVtYmVyIG9mIGtleXMgcmVnaXN0ZXJlZCBpbiB0aGUgc3lzdGVtLlxuICAgKi9cbiAgc3RhdGljIGdldCBudW1iZXJPZktleXMoKTogbnVtYmVyIHsgcmV0dXJuIF9nbG9iYWxLZXlSZWdpc3RyeS5udW1iZXJPZktleXM7IH1cbn1cblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGNsYXNzIEtleVJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBfYWxsS2V5cyA9IG5ldyBNYXA8T2JqZWN0LCBLZXk+KCk7XG5cbiAgZ2V0KHRva2VuOiBPYmplY3QpOiBLZXkge1xuICAgIGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleSkgcmV0dXJuIHRva2VuO1xuXG4gICAgLy8gVE9ETzogd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8zMTIzXG4gICAgdmFyIHRoZVRva2VuID0gdG9rZW47XG4gICAgaWYgKHRva2VuIGluc3RhbmNlb2YgVHlwZUxpdGVyYWwpIHtcbiAgICAgIHRoZVRva2VuID0gdG9rZW4udHlwZTtcbiAgICB9XG4gICAgdG9rZW4gPSB0aGVUb2tlbjtcblxuICAgIGlmICh0aGlzLl9hbGxLZXlzLmhhcyh0b2tlbikpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hbGxLZXlzLmdldCh0b2tlbik7XG4gICAgfVxuXG4gICAgdmFyIG5ld0tleSA9IG5ldyBLZXkodG9rZW4sIEtleS5udW1iZXJPZktleXMpO1xuICAgIHRoaXMuX2FsbEtleXMuc2V0KHRva2VuLCBuZXdLZXkpO1xuICAgIHJldHVybiBuZXdLZXk7XG4gIH1cblxuICBnZXQgbnVtYmVyT2ZLZXlzKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9hbGxLZXlzLnNpemU7IH1cbn1cblxudmFyIF9nbG9iYWxLZXlSZWdpc3RyeSA9IG5ldyBLZXlSZWdpc3RyeSgpO1xuIl19