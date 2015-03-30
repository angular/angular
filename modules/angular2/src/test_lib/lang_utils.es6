export function getTypeOf(instance) {
  return instance.constructor;
}

export function instantiateType(type: Function, params: Array = []) {
  var instance = Object.create(type.prototype);
  instance.constructor.apply(instance, params);
  return instance;
}
