/**
 * Maps every value to the same value every time.
 * @param {any} value the value to map each incoming value to
 * @returns {Observable} an observable of the passed value that emits everytime the source does
 */
export declare function mapTo<T, R>(value: R): any;
