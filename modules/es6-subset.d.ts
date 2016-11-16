/**
 * Subset of lib.es2015.core.d.ts typings.
 * Angular should not require use of ES6 runtime but some API usages are already present.
 * See https://github.com/angular/angular/issues/5242
 * TODO(alexeagle): remove methods below which may not be present in targeted browser
 */

interface String {
    /**
      * Returns true if the sequence of elements of searchString converted to a String is the
      * same as the corresponding elements of this object (converted to a String) starting at
      * position. Otherwise returns false.
      */
    startsWith(searchString: string, position?: number): boolean;
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
    find(predicate: (value: T, index: number, obj: Array<T>) => boolean, thisArg?: any): T | undefined;
}

interface Function {
    /**
      * Returns the name of the function. Function names are read-only and can not be changed.
      */
    readonly name: string;
}
