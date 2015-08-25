import {StringWrapper} from 'angular2/src/core/facade/lang';

var DASH_CASE_REGEXP = /-([a-z])/g;

export function dashCaseToCamelCase(input: string): string {
  return StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP,
                                        (m) => { return m[1].toUpperCase(); });
}
