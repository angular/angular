/**
 * Converts `funcOrValue` to a string which can be used in generated code.
 */
export declare function codify(obj: any): string;
export declare function rawString(str: string): string;
/**
 * Combine the strings of generated code into a single interpolated string.
 * Each element of `vals` is expected to be a string literal or a codegen'd
 * call to a method returning a string.
 */
export declare function combineGeneratedStrings(vals: string[]): string;
