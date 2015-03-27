import {StringWrapper, RegExpWrapper} from 'angular2/src/facade/lang';

var DASH_CASE_REGEXP = RegExpWrapper.create('-([a-z])');
var CAMEL_CASE_REGEXP = RegExpWrapper.create('([A-Z])');

export function dashCaseToCamelCase(input:string): string {
  return StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP, (m) => {
    return m[1].toUpperCase();
  });
}

export function camelCaseToDashCase(input:string): string {
  return StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP, (m) => {
    return '-' + m[1].toLowerCase();
  });
}
