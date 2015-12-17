import {IS_DART, StringWrapper, isBlank} from 'angular2/src/facade/lang';

var CAMEL_CASE_REGEXP = /([A-Z])/g;
var DASH_CASE_REGEXP = /-([a-z])/g;
var SINGLE_QUOTE_ESCAPE_STRING_RE = /'|\\|\n|\r|\$/g;
var DOUBLE_QUOTE_ESCAPE_STRING_RE = /"|\\|\n|\r|\$/g;

export var MODULE_SUFFIX = IS_DART ? '.dart' : '.js';

export function camelCaseToDashCase(input: string): string {
  return StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP,
                                        (m) => { return '-' + m[1].toLowerCase(); });
}

export function dashCaseToCamelCase(input: string): string {
  return StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP,
                                        (m) => { return m[1].toUpperCase(); });
}

export function escapeSingleQuoteString(input: string): string {
  if (isBlank(input)) {
    return null;
  }
  return `'${escapeString(input, SINGLE_QUOTE_ESCAPE_STRING_RE)}'`;
}

export function escapeDoubleQuoteString(input: string): string {
  if (isBlank(input)) {
    return null;
  }
  return `"${escapeString(input, DOUBLE_QUOTE_ESCAPE_STRING_RE)}"`;
}

function escapeString(input: string, re: RegExp): string {
  return StringWrapper.replaceAllMapped(input, re, (match) => {
    if (match[0] == '$') {
      return IS_DART ? '\\$' : '$';
    } else if (match[0] == '\n') {
      return '\\n';
    } else if (match[0] == '\r') {
      return '\\r';
    } else {
      return `\\${match[0]}`;
    }
  });
}

export function codeGenExportVariable(name: string): string {
  if (IS_DART) {
    return `const ${name} = `;
  } else {
    return `var ${name} = exports['${name}'] = `;
  }
}

export function codeGenConstConstructorCall(name: string): string {
  if (IS_DART) {
    return `const ${name}`;
  } else {
    return `new ${name}`;
  }
}

export function codeGenValueFn(params: string[], value: string, fnName: string = ''): string {
  if (IS_DART) {
    return `${fnName}(${params.join(',')}) => ${value}`;
  } else {
    return `function ${fnName}(${params.join(',')}) { return ${value}; }`;
  }
}

export function codeGenToString(expr: string): string {
  if (IS_DART) {
    return `'\${${expr}}'`;
  } else {
    // JS automatically convets to string...
    return expr;
  }
}

export function splitAtColon(input: string, defaultValues: string[]): string[] {
  var parts = StringWrapper.split(input.trim(), /\s*:\s*/g);
  if (parts.length > 1) {
    return parts;
  } else {
    return defaultValues;
  }
}
