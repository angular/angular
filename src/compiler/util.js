'use strict';var lang_1 = require('angular2/src/facade/lang');
var CAMEL_CASE_REGEXP = /([A-Z])/g;
var DASH_CASE_REGEXP = /-([a-z])/g;
var SINGLE_QUOTE_ESCAPE_STRING_RE = /'|\\|\n|\$/g;
var DOUBLE_QUOTE_ESCAPE_STRING_RE = /"|\\|\n|\$/g;
exports.MODULE_SUFFIX = lang_1.IS_DART ? '.dart' : '.js';
function camelCaseToDashCase(input) {
    return lang_1.StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP, function (m) { return '-' + m[1].toLowerCase(); });
}
exports.camelCaseToDashCase = camelCaseToDashCase;
function dashCaseToCamelCase(input) {
    return lang_1.StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP, function (m) { return m[1].toUpperCase(); });
}
exports.dashCaseToCamelCase = dashCaseToCamelCase;
function escapeSingleQuoteString(input) {
    if (lang_1.isBlank(input)) {
        return null;
    }
    return "'" + escapeString(input, SINGLE_QUOTE_ESCAPE_STRING_RE) + "'";
}
exports.escapeSingleQuoteString = escapeSingleQuoteString;
function escapeDoubleQuoteString(input) {
    if (lang_1.isBlank(input)) {
        return null;
    }
    return "\"" + escapeString(input, DOUBLE_QUOTE_ESCAPE_STRING_RE) + "\"";
}
exports.escapeDoubleQuoteString = escapeDoubleQuoteString;
function escapeString(input, re) {
    return lang_1.StringWrapper.replaceAllMapped(input, re, function (match) {
        if (match[0] == '$') {
            return lang_1.IS_DART ? '\\$' : '$';
        }
        else if (match[0] == '\n') {
            return '\\n';
        }
        else {
            return "\\" + match[0];
        }
    });
}
function codeGenExportVariable(name) {
    if (lang_1.IS_DART) {
        return "const " + name + " = ";
    }
    else {
        return "var " + name + " = exports['" + name + "'] = ";
    }
}
exports.codeGenExportVariable = codeGenExportVariable;
function codeGenConstConstructorCall(name) {
    if (lang_1.IS_DART) {
        return "const " + name;
    }
    else {
        return "new " + name;
    }
}
exports.codeGenConstConstructorCall = codeGenConstConstructorCall;
function codeGenValueFn(params, value, fnName) {
    if (fnName === void 0) { fnName = ''; }
    if (lang_1.IS_DART) {
        return fnName + "(" + params.join(',') + ") => " + value;
    }
    else {
        return "function " + fnName + "(" + params.join(',') + ") { return " + value + "; }";
    }
}
exports.codeGenValueFn = codeGenValueFn;
function codeGenToString(expr) {
    if (lang_1.IS_DART) {
        return "'${" + expr + "}'";
    }
    else {
        // JS automatically convets to string...
        return expr;
    }
}
exports.codeGenToString = codeGenToString;
function splitAtColon(input, defaultValues) {
    var parts = lang_1.StringWrapper.split(input.trim(), /\s*:\s*/g);
    if (parts.length > 1) {
        return parts;
    }
    else {
        return defaultValues;
    }
}
exports.splitAtColon = splitAtColon;
//# sourceMappingURL=util.js.map