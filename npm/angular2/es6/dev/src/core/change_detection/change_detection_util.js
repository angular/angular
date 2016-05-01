import { looseIdentical, isPrimitive } from 'angular2/src/facade/lang';
import { isListLikeIterable, areIterablesEqual } from 'angular2/src/facade/collection';
export { looseIdentical } from 'angular2/src/facade/lang';
export var uninitialized = new Object();
export function devModeEqual(a, b) {
    if (isListLikeIterable(a) && isListLikeIterable(b)) {
        return areIterablesEqual(a, b, devModeEqual);
    }
    else if (!isListLikeIterable(a) && !isPrimitive(a) && !isListLikeIterable(b) &&
        !isPrimitive(b)) {
        return true;
    }
    else {
        return looseIdentical(a, b);
    }
}
/**
 * Indicates that the result of a {@link PipeMetadata} transformation has changed even though the
 * reference
 * has not changed.
 *
 * The wrapped value will be unwrapped by change detection, and the unwrapped value will be stored.
 *
 * Example:
 *
 * ```
 * if (this._latestValue === this._latestReturnedValue) {
 *    return this._latestReturnedValue;
 *  } else {
 *    this._latestReturnedValue = this._latestValue;
 *    return WrappedValue.wrap(this._latestValue); // this will force update
 *  }
 * ```
 */
export class WrappedValue {
    constructor(wrapped) {
        this.wrapped = wrapped;
    }
    static wrap(value) { return new WrappedValue(value); }
}
/**
 * Helper class for unwrapping WrappedValue s
 */
export class ValueUnwrapper {
    constructor() {
        this.hasWrappedValue = false;
    }
    unwrap(value) {
        if (value instanceof WrappedValue) {
            this.hasWrappedValue = true;
            return value.wrapped;
        }
        return value;
    }
    reset() { this.hasWrappedValue = false; }
}
/**
 * Represents a basic change from a previous to a new value.
 */
export class SimpleChange {
    constructor(previousValue, currentValue) {
        this.previousValue = previousValue;
        this.currentValue = currentValue;
    }
    /**
     * Check whether the new value is the first value assigned.
     */
    isFirstChange() { return this.previousValue === uninitialized; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlX2RldGVjdGlvbl91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uX3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBVSxjQUFjLEVBQUUsV0FBVyxFQUFDLE1BQU0sMEJBQTBCO09BQ3RFLEVBRUwsa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNsQixNQUFNLGdDQUFnQztBQUV2QyxTQUFRLGNBQWMsUUFBTywwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLElBQUksYUFBYSxHQUE4QixJQUFJLE1BQU0sRUFBRSxDQUFDO0FBRW5FLDZCQUE2QixDQUFNLEVBQUUsQ0FBTTtJQUN6QyxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFFL0MsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQ25FLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDO0lBRWQsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDOUIsQ0FBQztBQUNILENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkc7QUFDSDtJQUNFLFlBQW1CLE9BQVk7UUFBWixZQUFPLEdBQVAsT0FBTyxDQUFLO0lBQUcsQ0FBQztJQUVuQyxPQUFPLElBQUksQ0FBQyxLQUFVLElBQWtCLE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0UsQ0FBQztBQUVEOztHQUVHO0FBQ0g7SUFBQTtRQUNTLG9CQUFlLEdBQUcsS0FBSyxDQUFDO0lBV2pDLENBQUM7SUFUQyxNQUFNLENBQUMsS0FBVTtRQUNmLEVBQUUsQ0FBQyxDQUFDLEtBQUssWUFBWSxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELEtBQUssS0FBSyxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVEOztHQUVHO0FBQ0g7SUFDRSxZQUFtQixhQUFrQixFQUFTLFlBQWlCO1FBQTVDLGtCQUFhLEdBQWIsYUFBYSxDQUFLO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQUs7SUFBRyxDQUFDO0lBRW5FOztPQUVHO0lBQ0gsYUFBYSxLQUFjLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDM0UsQ0FBQztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rLCBsb29zZUlkZW50aWNhbCwgaXNQcmltaXRpdmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1xuICBTdHJpbmdNYXBXcmFwcGVyLFxuICBpc0xpc3RMaWtlSXRlcmFibGUsXG4gIGFyZUl0ZXJhYmxlc0VxdWFsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmV4cG9ydCB7bG9vc2VJZGVudGljYWx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5leHBvcnQgdmFyIHVuaW5pdGlhbGl6ZWQ6IE9iamVjdCA9IC8qQHRzMmRhcnRfY29uc3QqLyBuZXcgT2JqZWN0KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXZNb2RlRXF1YWwoYTogYW55LCBiOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKGlzTGlzdExpa2VJdGVyYWJsZShhKSAmJiBpc0xpc3RMaWtlSXRlcmFibGUoYikpIHtcbiAgICByZXR1cm4gYXJlSXRlcmFibGVzRXF1YWwoYSwgYiwgZGV2TW9kZUVxdWFsKTtcblxuICB9IGVsc2UgaWYgKCFpc0xpc3RMaWtlSXRlcmFibGUoYSkgJiYgIWlzUHJpbWl0aXZlKGEpICYmICFpc0xpc3RMaWtlSXRlcmFibGUoYikgJiZcbiAgICAgICAgICAgICAhaXNQcmltaXRpdmUoYikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2Uge1xuICAgIHJldHVybiBsb29zZUlkZW50aWNhbChhLCBiKTtcbiAgfVxufVxuXG4vKipcbiAqIEluZGljYXRlcyB0aGF0IHRoZSByZXN1bHQgb2YgYSB7QGxpbmsgUGlwZU1ldGFkYXRhfSB0cmFuc2Zvcm1hdGlvbiBoYXMgY2hhbmdlZCBldmVuIHRob3VnaCB0aGVcbiAqIHJlZmVyZW5jZVxuICogaGFzIG5vdCBjaGFuZ2VkLlxuICpcbiAqIFRoZSB3cmFwcGVkIHZhbHVlIHdpbGwgYmUgdW53cmFwcGVkIGJ5IGNoYW5nZSBkZXRlY3Rpb24sIGFuZCB0aGUgdW53cmFwcGVkIHZhbHVlIHdpbGwgYmUgc3RvcmVkLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBpZiAodGhpcy5fbGF0ZXN0VmFsdWUgPT09IHRoaXMuX2xhdGVzdFJldHVybmVkVmFsdWUpIHtcbiAqICAgIHJldHVybiB0aGlzLl9sYXRlc3RSZXR1cm5lZFZhbHVlO1xuICogIH0gZWxzZSB7XG4gKiAgICB0aGlzLl9sYXRlc3RSZXR1cm5lZFZhbHVlID0gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gKiAgICByZXR1cm4gV3JhcHBlZFZhbHVlLndyYXAodGhpcy5fbGF0ZXN0VmFsdWUpOyAvLyB0aGlzIHdpbGwgZm9yY2UgdXBkYXRlXG4gKiAgfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBXcmFwcGVkVmFsdWUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgd3JhcHBlZDogYW55KSB7fVxuXG4gIHN0YXRpYyB3cmFwKHZhbHVlOiBhbnkpOiBXcmFwcGVkVmFsdWUgeyByZXR1cm4gbmV3IFdyYXBwZWRWYWx1ZSh2YWx1ZSk7IH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIHVud3JhcHBpbmcgV3JhcHBlZFZhbHVlIHNcbiAqL1xuZXhwb3J0IGNsYXNzIFZhbHVlVW53cmFwcGVyIHtcbiAgcHVibGljIGhhc1dyYXBwZWRWYWx1ZSA9IGZhbHNlO1xuXG4gIHVud3JhcCh2YWx1ZTogYW55KTogYW55IHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBXcmFwcGVkVmFsdWUpIHtcbiAgICAgIHRoaXMuaGFzV3JhcHBlZFZhbHVlID0gdHJ1ZTtcbiAgICAgIHJldHVybiB2YWx1ZS53cmFwcGVkO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICByZXNldCgpIHsgdGhpcy5oYXNXcmFwcGVkVmFsdWUgPSBmYWxzZTsgfVxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBiYXNpYyBjaGFuZ2UgZnJvbSBhIHByZXZpb3VzIHRvIGEgbmV3IHZhbHVlLlxuICovXG5leHBvcnQgY2xhc3MgU2ltcGxlQ2hhbmdlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHByZXZpb3VzVmFsdWU6IGFueSwgcHVibGljIGN1cnJlbnRWYWx1ZTogYW55KSB7fVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBuZXcgdmFsdWUgaXMgdGhlIGZpcnN0IHZhbHVlIGFzc2lnbmVkLlxuICAgKi9cbiAgaXNGaXJzdENoYW5nZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucHJldmlvdXNWYWx1ZSA9PT0gdW5pbml0aWFsaXplZDsgfVxufVxuIl19