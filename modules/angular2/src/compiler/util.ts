import {StringWrapper, isBlank} from 'angular2/src/core/facade/lang';

var CAMEL_CASE_REGEXP = /([A-Z])/g;
var DASH_CASE_REGEXP = /-([a-z])/g;
var SINGLE_QUOTE_ESCAPE_STRING_RE = /'|\\|\n/g;
var DOUBLE_QUOTE_ESCAPE_STRING_RE = /"|\\|\n/g;

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
    if (match[0] == '\n') {
      return '\\n';
    } else {
      return `\\${match[0]}`;
    }
  });
}
