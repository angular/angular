import { IS_DART, StringWrapper, isBlank, isPresent, isString, isArray } from 'angular2/src/facade/lang';
var CAMEL_CASE_REGEXP = /([A-Z])/g;
var DASH_CASE_REGEXP = /-([a-z])/g;
var SINGLE_QUOTE_ESCAPE_STRING_RE = /'|\\|\n|\r|\$/g;
var DOUBLE_QUOTE_ESCAPE_STRING_RE = /"|\\|\n|\r|\$/g;
export var MODULE_SUFFIX = IS_DART ? '.dart' : '.js';
export var CONST_VAR = IS_DART ? 'const' : 'var';
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
        return `${codeGenFnHeader(params, fnName)} => ${value}`;
    }
    else {
        return `${codeGenFnHeader(params, fnName)} { return ${value}; }`;
    }
}
export function codeGenFnHeader(params, fnName = '') {
    if (IS_DART) {
        return `${fnName}(${params.join(',')})`;
    }
    else {
        return `function ${fnName}(${params.join(',')})`;
    }
}
export function codeGenToString(expr) {
    if (IS_DART) {
        return `'\${${expr}}'`;
    }
    else {
        // JS automatically converts to string...
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
export class Statement {
    constructor(statement) {
        this.statement = statement;
    }
}
export class Expression {
    constructor(expression, isArray = false) {
        this.expression = expression;
        this.isArray = isArray;
    }
}
export function escapeValue(value) {
    if (value instanceof Expression) {
        return value.expression;
    }
    else if (isString(value)) {
        return escapeSingleQuoteString(value);
    }
    else if (isBlank(value)) {
        return 'null';
    }
    else {
        return `${value}`;
    }
}
export function codeGenArray(data) {
    return `[${data.map(escapeValue).join(',')}]`;
}
export function codeGenFlatArray(values) {
    var result = '([';
    var isFirstArrayEntry = true;
    var concatFn = IS_DART ? '.addAll' : 'concat';
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (value instanceof Expression && value.isArray) {
            result += `]).${concatFn}(${value.expression}).${concatFn}([`;
            isFirstArrayEntry = true;
        }
        else {
            if (!isFirstArrayEntry) {
                result += ',';
            }
            isFirstArrayEntry = false;
            result += escapeValue(value);
        }
    }
    result += '])';
    return result;
}
export function codeGenStringMap(keyValueArray) {
    return `{${keyValueArray.map(codeGenKeyValue).join(',')}}`;
}
function codeGenKeyValue(keyValue) {
    return `${escapeValue(keyValue[0])}:${escapeValue(keyValue[1])}`;
}
export function addAll(source, target) {
    for (var i = 0; i < source.length; i++) {
        target.push(source[i]);
    }
}
export function flattenArray(source, target) {
    if (isPresent(source)) {
        for (var i = 0; i < source.length; i++) {
            var item = source[i];
            if (isArray(item)) {
                flattenArray(item, target);
            }
            else {
                target.push(item);
            }
        }
    }
    return target;
}
