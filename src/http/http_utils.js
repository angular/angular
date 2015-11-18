'use strict';var lang_1 = require('angular2/src/facade/lang');
var enums_1 = require('./enums');
var exceptions_1 = require('angular2/src/facade/exceptions');
function normalizeMethodName(method) {
    if (lang_1.isString(method)) {
        var originalMethod = method;
        method = method.replace(/(\w)(\w*)/g, function (g0, g1, g2) { return g1.toUpperCase() + g2.toLowerCase(); });
        method = enums_1.RequestMethods[method];
        if (typeof method !== 'number')
            throw exceptions_1.makeTypeError("Invalid request method. The method \"" + originalMethod + "\" is not supported.");
    }
    return method;
}
exports.normalizeMethodName = normalizeMethodName;
var lang_2 = require('angular2/src/facade/lang');
exports.isJsObject = lang_2.isJsObject;
//# sourceMappingURL=http_utils.js.map