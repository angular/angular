'use strict';function stringify(obj) {
    if (typeof obj == 'function')
        return obj.name || obj.toString();
    return '' + obj;
}
exports.stringify = stringify;
function onError(e) {
    // TODO: (misko): We seem to not have a stack trace here!
    console.log(e, e.stack);
    throw e;
}
exports.onError = onError;
function controllerKey(name) {
    return '$' + name + 'Controller';
}
exports.controllerKey = controllerKey;
//# sourceMappingURL=util.js.map