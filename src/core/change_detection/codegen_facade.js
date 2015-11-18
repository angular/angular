'use strict';/**
 * Converts `funcOrValue` to a string which can be used in generated code.
 */
function codify(obj) {
    return JSON.stringify(obj);
}
exports.codify = codify;
function rawString(str) {
    return "'" + str + "'";
}
exports.rawString = rawString;
/**
 * Combine the strings of generated code into a single interpolated string.
 * Each element of `vals` is expected to be a string literal or a codegen'd
 * call to a method returning a string.
 */
function combineGeneratedStrings(vals) {
    return vals.join(' + ');
}
exports.combineGeneratedStrings = combineGeneratedStrings;
//# sourceMappingURL=codegen_facade.js.map