/**
 * Subset of es6-shim typings.
 * Angular should not require use of ES6 runtime but some API usages are already present.
 * See https://github.com/angular/angular/issues/5242
 * TODO(alexeagle): remove methods below which may not be present in targeted browser
 */

declare type PromiseConstructor = typeof Promise;

interface String {
  /**
   * Returns true if the sequence of elements of searchString converted to a String is the
   * same as the corresponding elements of this object (converted to a String) starting at
   * position. Otherwise returns false.
   */
  startsWith(searchString: string, position?: number): boolean;

  /**
   * Returns true if the sequence of elements of searchString converted to a String is the
   * same as the corresponding elements of this object (converted to a String) starting at
   * endPosition – length(this). Otherwise returns false.
   */
  endsWith(searchString: string, endPosition?: number): boolean;
}
interface Array<T> {
  /**
   * Returns the value of the first element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending
   * order, until it finds one where predicate returns true. If such an element is found, find
   * immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  find(predicate: (value: T, index: number, obj: Array<T>) => boolean, thisArg?: any): T;
  /**
   * Returns the this object after filling the section identified by start and end with value
   * @param value value to fill array section with
   * @param start index to start filling the array at. If start is negative, it is treated as
   * length+start where length is the length of the array.
   * @param end index to stop filling the array at. If end is negative, it is treated as
   * length+end.
   */
  fill(value: T, start?: number, end?: number): T[];
}
interface NumberConstructor {
  /**
   * Returns true if the value passed is an integer, false otherwise.
   * @param number A numeric value.
   */
  isInteger(number: number): boolean;
}
