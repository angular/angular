import {StringWrapper, isBlank, isJsObject} from 'angular2/src/core/facade/lang';

var CAMEL_CASE_REGEXP = /([A-Z])/g;
var DASH_CASE_REGEXP = /-([a-z])/g;
var SINGLE_QUOTE_ESCAPE_STRING_RE = /'|\\|\n|\$/g;
var DOUBLE_QUOTE_ESCAPE_STRING_RE = /"|\\|\n|\$/g;

export var IS_DART = !isJsObject({});

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
    } else {
      return `\\${match[0]}`;
    }
  });
}

export function codeGenExportVariable(name: string, isConst: boolean = false): string {
  var declaration = IS_DART && isConst ? `const ${name}` : `var ${name}`;
  return IS_DART ? `${declaration} = ` : `${declaration} = exports['${name}'] = `;
}

export function codeGenConcatArray(expression: string): string {
  return `${IS_DART ? '..addAll' : '.concat'}(${expression})`;
}

export function codeGenMapArray(argNames: string[], callback: string): string {
  if (IS_DART) {
    return `.map( (${argNames.join(',')}) => ${callback} ).toList()`;
  } else {
    return `.map(function(${argNames.join(',')}) { return ${callback}; })`;
  }
}

export function codeGenReplaceAll(pattern: string, expression: string): string {
  if (IS_DART) {
    return `.replaceAll('${pattern}', ${expression})`;
  } else {
    return `.replace(/${pattern}/g, ${expression})`;
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
