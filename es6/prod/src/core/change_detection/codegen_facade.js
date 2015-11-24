/**
 * Converts `funcOrValue` to a string which can be used in generated code.
 */
export function codify(obj) {
    return JSON.stringify(obj);
}
export function rawString(str) {
    return `'${str}'`;
}
/**
 * Combine the strings of generated code into a single interpolated string.
 * Each element of `vals` is expected to be a string literal or a codegen'd
 * call to a method returning a string.
 */
export function combineGeneratedStrings(vals) {
    return vals.join(' + ');
}
