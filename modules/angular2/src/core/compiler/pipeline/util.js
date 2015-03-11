import {StringWrapper, RegExpWrapper} from 'angular2/src/facade/lang';

var CAMEL_CASE_REGEXP = RegExpWrapper.create('-([a-z])');

export function dashCaseToCamelCase(input:string) {
  return StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP, (m) => {
    return m[1].toUpperCase();
  });
}
