// Compiled using typings@0.6.10
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/6697d6f7dadbf5773cb40ecda35a76027e0783b2/es6-shim/es6-shim.d.ts
// Type definitions for es6-shim v0.31.2
// Project: https://github.com/paulmillr/es6-shim
// Definitions by: Ron Buckton <http://github.com/rbuckton>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare type PropertyKey = string | number | symbol;

interface IteratorResult<T> {
    done: boolean;
    value?: T;
}

interface IterableShim<T> {
    /**
      * Shim for an ES6 iterable. Not intended for direct use by user code.
      */
    "_es6-shim iterator_"(): Iterator<T>;
}

interface Iterator<T> {
    next(value?: any): IteratorResult<T>;
    return?(value?: any): IteratorResult<T>;
    throw?(e?: any): IteratorResult<T>;
}

interface IterableIteratorShim<T> extends IterableShim<T>, Iterator<T> {
    /**
      * Shim for an ES6 iterable iterator. Not intended for direct use by user code.
      */
    "_es6-shim iterator_"(): IterableIteratorShim<T>;
}

interface StringConstructor {
    /**
      * Return the String value whose elements are, in order, the elements in the List elements.
      * If length is 0, the empty string is returned.
      */
    fromCodePoint(...codePoints: number[]): string;

    /**
      * String.raw is intended for use as a tag function of a Tagged Template String. When called
      * as such the first argument will be a well formed template call site object and the rest
      * parameter will contain the substitution values.
      * @param template A well-formed template string call site representation.
      * @param substitutions A set of substitution values.
      */
    raw(template: TemplateStringsArray, ...substitutions: any[]): string;
}

interface String {
    /**
      * Returns a nonnegative integer Number less than 1114112 (0x110000) that is the code point
      * value of the UTF-16 encoded code point starting at the string element at position pos in
      * the String resulting from converting this object to a String.
      * If there is no element at that position, the result is undefined.
      * If a valid UTF-16 surrogate pair does not begin at pos, the result is the code unit at pos.
      */
    codePointAt(pos: number): number;

    /**
      * Returns true if searchString appears as a substring of the result of converting this
      * object to a String, at one or more positions that are
      * greater than or equal to position; otherwise, returns false.
      * @param searchString search string
      * @param position If position is undefined, 0 is assumed, so as to search all of the String.
      */
    includes(searchString: string, position?: number): boolean;

    /**
      * Returns true if the sequence of elements of searchString converted to a String is the
      * same as the corresponding elements of this object (converted to a String) starting at
      * endPosition – length(this). Otherwise returns false.
      */
    endsWith(searchString: string, endPosition?: number): boolean;

    /**
      * Returns a String value that is made from count copies appended together. If count is 0,
      * T is the empty String is returned.
      * @param count number of copies to append
      */
    repeat(count: number): string;

    /**
      * Returns true if the sequence of elements of searchString converted to a String is the
      * same as the corresponding elements of this object (converted to a String) starting at
      * position. Otherwise returns false.
      */
    startsWith(searchString: string, position?: number): boolean;

    /**
      * Returns an <a> HTML anchor element and sets the name attribute to the text value
      * @param name
      */
    anchor(name: string): string;

    /** Returns a <big> HTML element */
    big(): string;

    /** Returns a <blink> HTML element */
    blink(): string;

    /** Returns a <b> HTML element */
    bold(): string;

    /** Returns a <tt> HTML element */
    fixed(): string

    /** Returns a <font> HTML element and sets the color attribute value */
    fontcolor(color: string): string

    /** Returns a <font> HTML element and sets the size attribute value */
    fontsize(size: number): string;

    /** Returns a <font> HTML element and sets the size attribute value */
    fontsize(size: string): string;

    /** Returns an <i> HTML element */
    italics(): string;

    /** Returns an <a> HTML element and sets the href attribute value */
    link(url: string): string;

    /** Returns a <small> HTML element */
    small(): string;

    /** Returns a <strike> HTML element */
    strike(): string;

    /** Returns a <sub> HTML element */
    sub(): string;

    /** Returns a <sup> HTML element */
    sup(): string;

    /**
      * Shim for an ES6 iterable. Not intended for direct use by user code.
      */
    "_es6-shim iterator_"(): IterableIteratorShim<string>;
}

interface ArrayConstructor {
    /**
      * Creates an array from an array-like object.
      * @param arrayLike An array-like object to convert to an array.
      * @param mapfn A mapping function to call on every element of the array.
      * @param thisArg Value of 'this' used to invoke the mapfn.
      */
    from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): Array<U>;

    /**
      * Creates an array from an iterable object.
      * @param iterable An iterable object to convert to an array.
      * @param mapfn A mapping function to call on every element of the array.
      * @param thisArg Value of 'this' used to invoke the mapfn.
      */
    from<T, U>(iterable: IterableShim<T>, mapfn: (v: T, k: number) => U, thisArg?: any): Array<U>;

    /**
      * Creates an array from an array-like object.
      * @param arrayLike An array-like object to convert to an array.
      */
    from<T>(arrayLike: ArrayLike<T>): Array<T>;

    /**
      * Creates an array from an iterable object.
      * @param iterable An iterable object to convert to an array.
      */
    from<T>(iterable: IterableShim<T>): Array<T>;

    /**
      * Returns a new array from a set of elements.
      * @param items A set of elements to include in the new array object.
      */
    of<T>(...items: T[]): Array<T>;
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
      * Returns the index of the first element in the array where predicate is true, and undefined
      * otherwise.
      * @param predicate find calls predicate once for each element of the array, in ascending
      * order, until it finds one where predicate returns true. If such an element is found, find
      * immediately returns that element value. Otherwise, find returns undefined.
      * @param thisArg If provided, it will be used as the this value for each invocation of
      * predicate. If it is not provided, undefined is used instead.
      */
    findIndex(predicate: (value: T) => boolean, thisArg?: any): number;

    /**
      * Returns the this object after filling the section identified by start and end with value
      * @param value value to fill array section with
      * @param start index to start filling the array at. If start is negative, it is treated as
      * length+start where length is the length of the array.
      * @param end index to stop filling the array at. If end is negative, it is treated as
      * length+end.
      */
    fill(value: T, start?: number, end?: number): T[];

    /**
      * Returns the this object after copying a section of the array identified by start and end
      * to the same array starting at position target
      * @param target If target is negative, it is treated as length+target where length is the
      * length of the array.
      * @param start If start is negative, it is treated as length+start. If end is negative, it
      * is treated as length+end.
      * @param end If not specified, length of the this object is used as its default value.
      */
    copyWithin(target: number, start: number, end?: number): T[];

    /**
      * Returns an array of key, value pairs for every entry in the array
      */
    entries(): IterableIteratorShim<[number, T]>;

    /**
      * Returns an list of keys in the array
      */
    keys(): IterableIteratorShim<number>;

    /**
      * Returns an list of values in the array
      */
    values(): IterableIteratorShim<T>;

    /**
      * Shim for an ES6 iterable. Not intended for direct use by user code.
      */
    "_es6-shim iterator_"(): IterableIteratorShim<T>;
}

interface NumberConstructor {
    /**
      * The value of Number.EPSILON is the difference between 1 and the smallest value greater than 1
      * that is representable as a Number value, which is approximately:
      * 2.2204460492503130808472633361816 x 10‍−‍16.
      */
    EPSILON: number;

    /**
      * Returns true if passed value is finite.
      * Unlike the global isFininte, Number.isFinite doesn't forcibly convert the parameter to a
      * number. Only finite values of the type number, result in true.
      * @param number A numeric value.
      */
    isFinite(number: number): boolean;

    /**
      * Returns true if the value passed is an integer, false otherwise.
      * @param number A numeric value.
      */
    isInteger(number: number): boolean;

    /**
      * Returns a Boolean value that indicates whether a value is the reserved value NaN (not a
      * number). Unlike the global isNaN(), Number.isNaN() doesn't forcefully convert the parameter
      * to a number. Only values of the type number, that are also NaN, result in true.
      * @param number A numeric value.
      */
    isNaN(number: number): boolean;

    /**
      * Returns true if the value passed is a safe integer.
      * @param number A numeric value.
      */
    isSafeInteger(number: number): boolean;

    /**
      * The value of the largest integer n such that n and n + 1 are both exactly representable as
      * a Number value.
      * The value of Number.MIN_SAFE_INTEGER is 9007199254740991 2^53 − 1.
      */
    MAX_SAFE_INTEGER: number;

    /**
      * The value of the smallest integer n such that n and n − 1 are both exactly representable as
      * a Number value.
      * The value of Number.MIN_SAFE_INTEGER is −9007199254740991 (−(2^53 − 1)).
      */
    MIN_SAFE_INTEGER: number;

    /**
      * Converts a string to a floating-point number.
      * @param string A string that contains a floating-point number.
      */
    parseFloat(string: string): number;

    /**
      * Converts A string to an integer.
      * @param s A string to convert into a number.
      * @param radix A value between 2 and 36 that specifies the base of the number in numString.
      * If this argument is not supplied, strings with a prefix of '0x' are considered hexadecimal.
      * All other strings are considered decimal.
      */
    parseInt(string: string, radix?: number): number;
}

interface ObjectConstructor {
    /**
      * Copy the values of all of the enumerable own properties from one or more source objects to a
      * target object. Returns the target object.
      * @param target The target object to copy to.
      * @param sources One or more source objects to copy properties from.
      */
    assign(target: any, ...sources: any[]): any;

    /**
      * Returns true if the values are the same value, false otherwise.
      * @param value1 The first value.
      * @param value2 The second value.
      */
    is(value1: any, value2: any): boolean;

    /**
      * Sets the prototype of a specified object o to  object proto or null. Returns the object o.
      * @param o The object to change its prototype.
      * @param proto The value of the new prototype or null.
      * @remarks Requires `__proto__` support.
      */
    setPrototypeOf(o: any, proto: any): any;
}

interface RegExp {
    /**
      * Returns a string indicating the flags of the regular expression in question. This field is read-only.
      * The characters in this string are sequenced and concatenated in the following order:
      *
      *    - "g" for global
      *    - "i" for ignoreCase
      *    - "m" for multiline
      *    - "u" for unicode
      *    - "y" for sticky
      *
      * If no flags are set, the value is the empty string.
      */
    flags: string;
}

interface Math {
    /**
      * Returns the number of leading zero bits in the 32-bit binary representation of a number.
      * @param x A numeric expression.
      */
    clz32(x: number): number;

    /**
      * Returns the result of 32-bit multiplication of two numbers.
      * @param x First number
      * @param y Second number
      */
    imul(x: number, y: number): number;

    /**
      * Returns the sign of the x, indicating whether x is positive, negative or zero.
      * @param x The numeric expression to test
      */
    sign(x: number): number;

    /**
      * Returns the base 10 logarithm of a number.
      * @param x A numeric expression.
      */
    log10(x: number): number;

    /**
      * Returns the base 2 logarithm of a number.
      * @param x A numeric expression.
      */
    log2(x: number): number;

    /**
      * Returns the natural logarithm of 1 + x.
      * @param x A numeric expression.
      */
    log1p(x: number): number;

    /**
      * Returns the result of (e^x - 1) of x (e raised to the power of x, where e is the base of
      * the natural logarithms).
      * @param x A numeric expression.
      */
    expm1(x: number): number;

    /**
      * Returns the hyperbolic cosine of a number.
      * @param x A numeric expression that contains an angle measured in radians.
      */
    cosh(x: number): number;

    /**
      * Returns the hyperbolic sine of a number.
      * @param x A numeric expression that contains an angle measured in radians.
      */
    sinh(x: number): number;

    /**
      * Returns the hyperbolic tangent of a number.
      * @param x A numeric expression that contains an angle measured in radians.
      */
    tanh(x: number): number;

    /**
      * Returns the inverse hyperbolic cosine of a number.
      * @param x A numeric expression that contains an angle measured in radians.
      */
    acosh(x: number): number;

    /**
      * Returns the inverse hyperbolic sine of a number.
      * @param x A numeric expression that contains an angle measured in radians.
      */
    asinh(x: number): number;

    /**
      * Returns the inverse hyperbolic tangent of a number.
      * @param x A numeric expression that contains an angle measured in radians.
      */
    atanh(x: number): number;

    /**
      * Returns the square root of the sum of squares of its arguments.
      * @param values Values to compute the square root for.
      *     If no arguments are passed, the result is +0.
      *     If there is only one argument, the result is the absolute value.
      *     If any argument is +Infinity or -Infinity, the result is +Infinity.
      *     If any argument is NaN, the result is NaN.
      *     If all arguments are either +0 or −0, the result is +0.
      */
    hypot(...values: number[]): number;

    /**
      * Returns the integral part of the a numeric expression, x, removing any fractional digits.
      * If x is already an integer, the result is x.
      * @param x A numeric expression.
      */
    trunc(x: number): number;

    /**
      * Returns the nearest single precision float representation of a number.
      * @param x A numeric expression.
      */
    fround(x: number): number;

    /**
      * Returns an implementation-dependent approximation to the cube root of number.
      * @param x A numeric expression.
      */
    cbrt(x: number): number;
}

interface PromiseLike<T> {
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => TResult | PromiseLike<TResult>): PromiseLike<TResult>;
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => void): PromiseLike<TResult>;
}

/**
 * Represents the completion of an asynchronous operation
 */
interface Promise<T> {
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<TResult>;
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => void): Promise<TResult>;

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch(onrejected?: (reason: any) => T | PromiseLike<T>): Promise<T>;
    catch(onrejected?: (reason: any) => void): Promise<T>;
}

interface PromiseConstructor {
    /**
      * A reference to the prototype.
      */
    prototype: Promise<any>;

    /**
     * Creates a new Promise.
     * @param executor A callback used to initialize the promise. This callback is passed two arguments:
     * a resolve callback used resolve the promise with a value or the result of another promise,
     * and a reject callback used to reject the promise with a provided reason or error.
     */
    new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;

    /**
     * Creates a Promise that is resolved with an array of results when all of the provided Promises
     * resolve, or rejected when any Promise is rejected.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    all<T>(values: IterableShim<T | PromiseLike<T>>): Promise<T[]>;

    /**
     * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
     * or rejected.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    race<T>(values: IterableShim<T | PromiseLike<T>>): Promise<T>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject(reason: any): Promise<void>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject<T>(reason: any): Promise<T>;

    /**
      * Creates a new resolved promise for the provided value.
      * @param value A promise.
      * @returns A promise whose internal state matches the provided promise.
      */
    resolve<T>(value: T | PromiseLike<T>): Promise<T>;

    /**
     * Creates a new resolved promise .
     * @returns A resolved promise.
     */
    resolve(): Promise<void>;
}

declare var Promise: PromiseConstructor;

interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V;
    has(key: K): boolean;
    set(key: K, value?: V): Map<K, V>;
    size: number;
    entries(): IterableIteratorShim<[K, V]>;
    keys(): IterableIteratorShim<K>;
    values(): IterableIteratorShim<V>;
}

interface MapConstructor {
    new <K, V>(): Map<K, V>;
    new <K, V>(iterable: IterableShim<[K, V]>): Map<K, V>;
    prototype: Map<any, any>;
}

declare var Map: MapConstructor;

interface Set<T> {
    add(value: T): Set<T>;
    clear(): void;
    delete(value: T): boolean;
    forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    size: number;
    entries(): IterableIteratorShim<[T, T]>;
    keys(): IterableIteratorShim<T>;
    values(): IterableIteratorShim<T>;
}

interface SetConstructor {
    new <T>(): Set<T>;
    new <T>(iterable: IterableShim<T>): Set<T>;
    prototype: Set<any>;
}

declare var Set: SetConstructor;

interface WeakMap<K, V> {
    delete(key: K): boolean;
    get(key: K): V;
    has(key: K): boolean;
    set(key: K, value?: V): WeakMap<K, V>;
}

interface WeakMapConstructor {
    new <K, V>(): WeakMap<K, V>;
    new <K, V>(iterable: IterableShim<[K, V]>): WeakMap<K, V>;
    prototype: WeakMap<any, any>;
}

declare var WeakMap: WeakMapConstructor;

interface WeakSet<T> {
    add(value: T): WeakSet<T>;
    delete(value: T): boolean;
    has(value: T): boolean;
}

interface WeakSetConstructor {
    new <T>(): WeakSet<T>;
    new <T>(iterable: IterableShim<T>): WeakSet<T>;
    prototype: WeakSet<any>;
}

declare var WeakSet: WeakSetConstructor;

declare module Reflect {
    function apply(target: Function, thisArgument: any, argumentsList: ArrayLike<any>): any;
    function construct(target: Function, argumentsList: ArrayLike<any>): any;
    function defineProperty(target: any, propertyKey: PropertyKey, attributes: PropertyDescriptor): boolean;
    function deleteProperty(target: any, propertyKey: PropertyKey): boolean;
    function enumerate(target: any): IterableIteratorShim<any>;
    function get(target: any, propertyKey: PropertyKey, receiver?: any): any;
    function getOwnPropertyDescriptor(target: any, propertyKey: PropertyKey): PropertyDescriptor;
    function getPrototypeOf(target: any): any;
    function has(target: any, propertyKey: PropertyKey): boolean;
    function isExtensible(target: any): boolean;
    function ownKeys(target: any): Array<PropertyKey>;
    function preventExtensions(target: any): boolean;
    function set(target: any, propertyKey: PropertyKey, value: any, receiver?: any): boolean;
    function setPrototypeOf(target: any, proto: any): boolean;
}

declare module "es6-shim" {
    var String: StringConstructor;
    var Array: ArrayConstructor;
    var Number: NumberConstructor;
    var Math: Math;
    var Object: ObjectConstructor;
    var Map: MapConstructor;
    var Set: SetConstructor;
    var WeakMap: WeakMapConstructor;
    var WeakSet: WeakSetConstructor;
    var Promise: PromiseConstructor;
    module Reflect {
        function apply(target: Function, thisArgument: any, argumentsList: ArrayLike<any>): any;
        function construct(target: Function, argumentsList: ArrayLike<any>): any;
        function defineProperty(target: any, propertyKey: PropertyKey, attributes: PropertyDescriptor): boolean;
        function deleteProperty(target: any, propertyKey: PropertyKey): boolean;
        function enumerate(target: any): Iterator<any>;
        function get(target: any, propertyKey: PropertyKey, receiver?: any): any;
        function getOwnPropertyDescriptor(target: any, propertyKey: PropertyKey): PropertyDescriptor;
        function getPrototypeOf(target: any): any;
        function has(target: any, propertyKey: PropertyKey): boolean;
        function isExtensible(target: any): boolean;
        function ownKeys(target: any): Array<PropertyKey>;
        function preventExtensions(target: any): boolean;
        function set(target: any, propertyKey: PropertyKey, value: any, receiver?: any): boolean;
        function setPrototypeOf(target: any, proto: any): boolean;
    }
}