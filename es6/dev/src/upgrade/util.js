export function stringify(obj) {
    if (typeof obj == 'function')
        return obj.name || obj.toString();
    return '' + obj;
}
export function onError(e) {
    // TODO: (misko): We seem to not have a stack trace here!
    console.log(e, e.stack);
    throw e;
}
export function controllerKey(name) {
    return '$' + name + 'Controller';
}
//# sourceMappingURL=util.js.map