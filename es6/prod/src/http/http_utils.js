import { isString } from 'angular2/src/facade/lang';
import { RequestMethod } from './enums';
import { makeTypeError } from 'angular2/src/facade/exceptions';
export function normalizeMethodName(method) {
    if (isString(method)) {
        var originalMethod = method;
        method = method.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase());
        method = RequestMethod[method];
        if (typeof method !== 'number')
            throw makeTypeError(`Invalid request method. The method "${originalMethod}" is not supported.`);
    }
    return method;
}
export const isSuccess = (status) => (status >= 200 && status < 300);
export function getResponseURL(xhr) {
    if ('responseURL' in xhr) {
        return xhr.responseURL;
    }
    if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
        return xhr.getResponseHeader('X-Request-URL');
    }
    return;
}
export { isJsObject } from 'angular2/src/facade/lang';
