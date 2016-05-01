export { looseIdentical } from 'angular2/src/facade/lang';
export declare var uninitialized: Object;
export declare function devModeEqual(a: any, b: any): boolean;
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
export declare class WrappedValue {
    wrapped: any;
    constructor(wrapped: any);
    static wrap(value: any): WrappedValue;
}
/**
 * Helper class for unwrapping WrappedValue s
 */
export declare class ValueUnwrapper {
    hasWrappedValue: boolean;
    unwrap(value: any): any;
    reset(): void;
}
/**
 * Represents a basic change from a previous to a new value.
 */
export declare class SimpleChange {
    previousValue: any;
    currentValue: any;
    constructor(previousValue: any, currentValue: any);
    /**
     * Check whether the new value is the first value assigned.
     */
    isFirstChange(): boolean;
}
