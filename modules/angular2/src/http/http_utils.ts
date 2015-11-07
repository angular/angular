import {isString} from 'angular2/src/facade/lang';
import {RequestMethods} from './enums';
import {makeTypeError} from 'angular2/src/facade/exceptions';

export function normalizeMethodName(method): RequestMethods {
  if (isString(method)) {
    var originalMethod = method;
    method = method.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase());
    method = RequestMethods[method];
    if (typeof method !== 'number')
      throw makeTypeError(
          `Invalid request method. The method "${originalMethod}" is not supported.`);
  }
  return method;
}

export {isJsObject} from 'angular2/src/facade/lang';
