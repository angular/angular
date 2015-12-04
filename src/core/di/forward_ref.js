'use strict';var lang_1 = require('angular2/src/facade/lang');
/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared,
 * but not yet defined. It is also used when the `token` which we use when creating a query is not
 * yet defined.
 *
 * ### Example ([live demo](http://plnkr.co/edit/bRs0SX2OTQiJzqvjgl8P?p=preview))
 *
 * ```typescript
 * class Door {
 *   lock: Lock;
 *   constructor(@Inject(forwardRef(() => Lock)) lock:Lock) {
 *     this.lock = lock;
 *   }
 * }
 *
 * // Only at this point Lock is defined.
 * class Lock {
 * }
 *
 * var injector = Injector.resolveAndCreate([Door, Lock]);
 * var door = injector.get(Door);
 * expect(door instanceof Door).toBe(true);
 * expect(door.lock instanceof Lock).toBe(true);
 * ```
 */
function forwardRef(forwardRefFn) {
    forwardRefFn.__forward_ref__ = forwardRef;
    forwardRefFn.toString = function () { return lang_1.stringify(this()); };
    return forwardRefFn;
}
exports.forwardRef = forwardRef;
/**
 * Lazily retrieves the reference value from a forwardRef.
 *
 * Acts as the identity function when given a non-forward-ref value.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GU72mJrk1fiodChcmiDR?p=preview))
 *
 * ```typescript
 * var ref = forwardRef(() => "refValue");
 * expect(resolveForwardRef(ref)).toEqual("refValue");
 * expect(resolveForwardRef("regularValue")).toEqual("regularValue");
 * ```
 *
 * See: {@link forwardRef}
 */
function resolveForwardRef(type) {
    if (lang_1.isFunction(type) && type.hasOwnProperty('__forward_ref__') &&
        type.__forward_ref__ === forwardRef) {
        return type();
    }
    else {
        return type;
    }
}
exports.resolveForwardRef = resolveForwardRef;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yd2FyZF9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9mb3J3YXJkX3JlZi50cyJdLCJuYW1lcyI6WyJmb3J3YXJkUmVmIiwicmVzb2x2ZUZvcndhcmRSZWYiXSwibWFwcGluZ3MiOiJBQUFBLHFCQUEwQywwQkFBMEIsQ0FBQyxDQUFBO0FBYXJFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EyQkc7QUFDSCxvQkFBMkIsWUFBMEI7SUFDN0NBLFlBQWFBLENBQUNBLGVBQWVBLEdBQUdBLFVBQVVBLENBQUNBO0lBQzNDQSxZQUFhQSxDQUFDQSxRQUFRQSxHQUFHQSxjQUFhLE1BQU0sQ0FBQyxnQkFBUyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUNBO0lBQ3hFQSxNQUFNQSxDQUFhQSxZQUFhQSxDQUFDQTtBQUNuQ0EsQ0FBQ0E7QUFKZSxrQkFBVSxhQUl6QixDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCwyQkFBa0MsSUFBUztJQUN6Q0MsRUFBRUEsQ0FBQ0EsQ0FBQ0EsaUJBQVVBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLGlCQUFpQkEsQ0FBQ0E7UUFDMURBLElBQUlBLENBQUNBLGVBQWVBLEtBQUtBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3hDQSxNQUFNQSxDQUFnQkEsSUFBS0EsRUFBRUEsQ0FBQ0E7SUFDaENBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ05BLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0FBQ0hBLENBQUNBO0FBUGUseUJBQWlCLG9CQU9oQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtUeXBlLCBzdHJpbmdpZnksIGlzRnVuY3Rpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHRoYXQgYSBmdW5jdGlvbiBwYXNzZWQgaW50byB7QGxpbmsgZm9yd2FyZFJlZn0gaGFzIHRvIGltcGxlbWVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHZhciBmbjpGb3J3YXJkUmVmRm4gPSBmb3J3YXJkUmVmKCgpID0+IExvY2spO1xuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRm9yd2FyZFJlZkZuIHsgKCk6IGFueTsgfVxuXG4vKipcbiAqIEFsbG93cyB0byByZWZlciB0byByZWZlcmVuY2VzIHdoaWNoIGFyZSBub3QgeWV0IGRlZmluZWQuXG4gKlxuICogRm9yIGluc3RhbmNlLCBgZm9yd2FyZFJlZmAgaXMgdXNlZCB3aGVuIHRoZSBgdG9rZW5gIHdoaWNoIHdlIG5lZWQgdG8gcmVmZXIgdG8gZm9yIHRoZSBwdXJwb3NlcyBvZlxuICogREkgaXMgZGVjbGFyZWQsXG4gKiBidXQgbm90IHlldCBkZWZpbmVkLiBJdCBpcyBhbHNvIHVzZWQgd2hlbiB0aGUgYHRva2VuYCB3aGljaCB3ZSB1c2Ugd2hlbiBjcmVhdGluZyBhIHF1ZXJ5IGlzIG5vdFxuICogeWV0IGRlZmluZWQuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2JSczBTWDJPVFFpSnpxdmpnbDhQP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgRG9vciB7XG4gKiAgIGxvY2s6IExvY2s7XG4gKiAgIGNvbnN0cnVjdG9yKEBJbmplY3QoZm9yd2FyZFJlZigoKSA9PiBMb2NrKSkgbG9jazpMb2NrKSB7XG4gKiAgICAgdGhpcy5sb2NrID0gbG9jaztcbiAqICAgfVxuICogfVxuICpcbiAqIC8vIE9ubHkgYXQgdGhpcyBwb2ludCBMb2NrIGlzIGRlZmluZWQuXG4gKiBjbGFzcyBMb2NrIHtcbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtEb29yLCBMb2NrXSk7XG4gKiB2YXIgZG9vciA9IGluamVjdG9yLmdldChEb29yKTtcbiAqIGV4cGVjdChkb29yIGluc3RhbmNlb2YgRG9vcikudG9CZSh0cnVlKTtcbiAqIGV4cGVjdChkb29yLmxvY2sgaW5zdGFuY2VvZiBMb2NrKS50b0JlKHRydWUpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3J3YXJkUmVmKGZvcndhcmRSZWZGbjogRm9yd2FyZFJlZkZuKTogVHlwZSB7XG4gICg8YW55PmZvcndhcmRSZWZGbikuX19mb3J3YXJkX3JlZl9fID0gZm9yd2FyZFJlZjtcbiAgKDxhbnk+Zm9yd2FyZFJlZkZuKS50b1N0cmluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3RyaW5naWZ5KHRoaXMoKSk7IH07XG4gIHJldHVybiAoPFR5cGU+PGFueT5mb3J3YXJkUmVmRm4pO1xufVxuXG4vKipcbiAqIExhemlseSByZXRyaWV2ZXMgdGhlIHJlZmVyZW5jZSB2YWx1ZSBmcm9tIGEgZm9yd2FyZFJlZi5cbiAqXG4gKiBBY3RzIGFzIHRoZSBpZGVudGl0eSBmdW5jdGlvbiB3aGVuIGdpdmVuIGEgbm9uLWZvcndhcmQtcmVmIHZhbHVlLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9HVTcybUpyazFmaW9kQ2hjbWlEUj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHZhciByZWYgPSBmb3J3YXJkUmVmKCgpID0+IFwicmVmVmFsdWVcIik7XG4gKiBleHBlY3QocmVzb2x2ZUZvcndhcmRSZWYocmVmKSkudG9FcXVhbChcInJlZlZhbHVlXCIpO1xuICogZXhwZWN0KHJlc29sdmVGb3J3YXJkUmVmKFwicmVndWxhclZhbHVlXCIpKS50b0VxdWFsKFwicmVndWxhclZhbHVlXCIpO1xuICogYGBgXG4gKlxuICogU2VlOiB7QGxpbmsgZm9yd2FyZFJlZn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVGb3J3YXJkUmVmKHR5cGU6IGFueSk6IGFueSB7XG4gIGlmIChpc0Z1bmN0aW9uKHR5cGUpICYmIHR5cGUuaGFzT3duUHJvcGVydHkoJ19fZm9yd2FyZF9yZWZfXycpICYmXG4gICAgICB0eXBlLl9fZm9yd2FyZF9yZWZfXyA9PT0gZm9yd2FyZFJlZikge1xuICAgIHJldHVybiAoPEZvcndhcmRSZWZGbj50eXBlKSgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0eXBlO1xuICB9XG59XG4iXX0=