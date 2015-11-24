export function getTypeOf(instance) {
    return instance.constructor;
}
export function instantiateType(type, params = []) {
    var instance = Object.create(type.prototype);
    instance.constructor.apply(instance, params);
    return instance;
}
