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
