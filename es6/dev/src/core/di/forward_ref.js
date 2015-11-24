import { stringify, isFunction } from 'angular2/src/facade/lang';
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
export function forwardRef(forwardRefFn) {
    forwardRefFn.__forward_ref__ = forwardRef;
    forwardRefFn.toString = function () { return stringify(this()); };
    return forwardRefFn;
}
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
export function resolveForwardRef(type) {
    if (isFunction(type) && type.hasOwnProperty('__forward_ref__') &&
        type.__forward_ref__ === forwardRef) {
        return type();
    }
    else {
        return type;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yd2FyZF9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9mb3J3YXJkX3JlZi50cyJdLCJuYW1lcyI6WyJmb3J3YXJkUmVmIiwicmVzb2x2ZUZvcndhcmRSZWYiXSwibWFwcGluZ3MiOiJPQUFPLEVBQU8sU0FBUyxFQUFFLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtBQWFwRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMkJHO0FBQ0gsMkJBQTJCLFlBQTBCO0lBQzdDQSxZQUFhQSxDQUFDQSxlQUFlQSxHQUFHQSxVQUFVQSxDQUFDQTtJQUMzQ0EsWUFBYUEsQ0FBQ0EsUUFBUUEsR0FBR0EsY0FBYSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUNBO0lBQ3hFQSxNQUFNQSxDQUFhQSxZQUFhQSxDQUFDQTtBQUNuQ0EsQ0FBQ0E7QUFFRDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNILGtDQUFrQyxJQUFTO0lBQ3pDQyxFQUFFQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxpQkFBaUJBLENBQUNBO1FBQzFEQSxJQUFJQSxDQUFDQSxlQUFlQSxLQUFLQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN4Q0EsTUFBTUEsQ0FBZ0JBLElBQUtBLEVBQUVBLENBQUNBO0lBQ2hDQSxDQUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtBQUNIQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VHlwZSwgc3RyaW5naWZ5LCBpc0Z1bmN0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIEFuIGludGVyZmFjZSB0aGF0IGEgZnVuY3Rpb24gcGFzc2VkIGludG8ge0BsaW5rIGZvcndhcmRSZWZ9IGhhcyB0byBpbXBsZW1lbnQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB2YXIgZm46Rm9yd2FyZFJlZkZuID0gZm9yd2FyZFJlZigoKSA9PiBMb2NrKTtcbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZvcndhcmRSZWZGbiB7ICgpOiBhbnk7IH1cblxuLyoqXG4gKiBBbGxvd3MgdG8gcmVmZXIgdG8gcmVmZXJlbmNlcyB3aGljaCBhcmUgbm90IHlldCBkZWZpbmVkLlxuICpcbiAqIEZvciBpbnN0YW5jZSwgYGZvcndhcmRSZWZgIGlzIHVzZWQgd2hlbiB0aGUgYHRva2VuYCB3aGljaCB3ZSBuZWVkIHRvIHJlZmVyIHRvIGZvciB0aGUgcHVycG9zZXMgb2ZcbiAqIERJIGlzIGRlY2xhcmVkLFxuICogYnV0IG5vdCB5ZXQgZGVmaW5lZC4gSXQgaXMgYWxzbyB1c2VkIHdoZW4gdGhlIGB0b2tlbmAgd2hpY2ggd2UgdXNlIHdoZW4gY3JlYXRpbmcgYSBxdWVyeSBpcyBub3RcbiAqIHlldCBkZWZpbmVkLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9iUnMwU1gyT1RRaUp6cXZqZ2w4UD9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIERvb3Ige1xuICogICBsb2NrOiBMb2NrO1xuICogICBjb25zdHJ1Y3RvcihASW5qZWN0KGZvcndhcmRSZWYoKCkgPT4gTG9jaykpIGxvY2s6TG9jaykge1xuICogICAgIHRoaXMubG9jayA9IGxvY2s7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiAvLyBPbmx5IGF0IHRoaXMgcG9pbnQgTG9jayBpcyBkZWZpbmVkLlxuICogY2xhc3MgTG9jayB7XG4gKiB9XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbRG9vciwgTG9ja10pO1xuICogdmFyIGRvb3IgPSBpbmplY3Rvci5nZXQoRG9vcik7XG4gKiBleHBlY3QoZG9vciBpbnN0YW5jZW9mIERvb3IpLnRvQmUodHJ1ZSk7XG4gKiBleHBlY3QoZG9vci5sb2NrIGluc3RhbmNlb2YgTG9jaykudG9CZSh0cnVlKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yd2FyZFJlZihmb3J3YXJkUmVmRm46IEZvcndhcmRSZWZGbik6IFR5cGUge1xuICAoPGFueT5mb3J3YXJkUmVmRm4pLl9fZm9yd2FyZF9yZWZfXyA9IGZvcndhcmRSZWY7XG4gICg8YW55PmZvcndhcmRSZWZGbikudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHN0cmluZ2lmeSh0aGlzKCkpOyB9O1xuICByZXR1cm4gKDxUeXBlPjxhbnk+Zm9yd2FyZFJlZkZuKTtcbn1cblxuLyoqXG4gKiBMYXppbHkgcmV0cmlldmVzIHRoZSByZWZlcmVuY2UgdmFsdWUgZnJvbSBhIGZvcndhcmRSZWYuXG4gKlxuICogQWN0cyBhcyB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gd2hlbiBnaXZlbiBhIG5vbi1mb3J3YXJkLXJlZiB2YWx1ZS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvR1U3Mm1KcmsxZmlvZENoY21pRFI/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB2YXIgcmVmID0gZm9yd2FyZFJlZigoKSA9PiBcInJlZlZhbHVlXCIpO1xuICogZXhwZWN0KHJlc29sdmVGb3J3YXJkUmVmKHJlZikpLnRvRXF1YWwoXCJyZWZWYWx1ZVwiKTtcbiAqIGV4cGVjdChyZXNvbHZlRm9yd2FyZFJlZihcInJlZ3VsYXJWYWx1ZVwiKSkudG9FcXVhbChcInJlZ3VsYXJWYWx1ZVwiKTtcbiAqIGBgYFxuICpcbiAqIFNlZToge0BsaW5rIGZvcndhcmRSZWZ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRm9yd2FyZFJlZih0eXBlOiBhbnkpOiBhbnkge1xuICBpZiAoaXNGdW5jdGlvbih0eXBlKSAmJiB0eXBlLmhhc093blByb3BlcnR5KCdfX2ZvcndhcmRfcmVmX18nKSAmJlxuICAgICAgdHlwZS5fX2ZvcndhcmRfcmVmX18gPT09IGZvcndhcmRSZWYpIHtcbiAgICByZXR1cm4gKDxGb3J3YXJkUmVmRm4+dHlwZSkoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdHlwZTtcbiAgfVxufVxuIl19