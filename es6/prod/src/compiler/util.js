import { IS_DART, StringWrapper, isBlank } from 'angular2/src/facade/lang';
var CAMEL_CASE_REGEXP = /([A-Z])/g;
var DASH_CASE_REGEXP = /-([a-z])/g;
var SINGLE_QUOTE_ESCAPE_STRING_RE = /'|\\|\n|\r|\$/g;
var DOUBLE_QUOTE_ESCAPE_STRING_RE = /"|\\|\n|\r|\$/g;
export var MODULE_SUFFIX = IS_DART ? '.dart' : '.js';
export function camelCaseToDashCase(input) {
    return StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP, (m) => { return '-' + m[1].toLowerCase(); });
}
export function dashCaseToCamelCase(input) {
    return StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP, (m) => { return m[1].toUpperCase(); });
}
export function escapeSingleQuoteString(input) {
    if (isBlank(input)) {
        return null;
    }
    return `'${escapeString(input, SINGLE_QUOTE_ESCAPE_STRING_RE)}'`;
}
export function escapeDoubleQuoteString(input) {
    if (isBlank(input)) {
        return null;
    }
    return `"${escapeString(input, DOUBLE_QUOTE_ESCAPE_STRING_RE)}"`;
}
function escapeString(input, re) {
    return StringWrapper.replaceAllMapped(input, re, (match) => {
        if (match[0] == '$') {
            return IS_DART ? '\\$' : '$';
        }
        else if (match[0] == '\n') {
            return '\\n';
        }
        else if (match[0] == '\r') {
            return '\\r';
        }
        else {
            return `\\${match[0]}`;
        }
    });
}
export function codeGenExportVariable(name) {
    if (IS_DART) {
        return `const ${name} = `;
    }
    else {
        return `var ${name} = exports['${name}'] = `;
    }
}
export function codeGenConstConstructorCall(name) {
    if (IS_DART) {
        return `const ${name}`;
    }
    else {
        return `new ${name}`;
    }
}
export function codeGenValueFn(params, value, fnName = '') {
    if (IS_DART) {
        return `${fnName}(${params.join(',')}) => ${value}`;
    }
    else {
        return `function ${fnName}(${params.join(',')}) { return ${value}; }`;
    }
}
export function codeGenToString(expr) {
    if (IS_DART) {
        return `'\${${expr}}'`;
    }
    else {
        // JS automatically convets to string...
        return expr;
    }
}
export function splitAtColon(input, defaultValues) {
    var parts = StringWrapper.split(input.trim(), /\s*:\s*/g);
    if (parts.length > 1) {
        return parts;
    }
    else {
        return defaultValues;
    }
}
