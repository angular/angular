export function implementsOnDestroy(pipe) {
    return pipe.constructor.prototype.onDestroy;
}
