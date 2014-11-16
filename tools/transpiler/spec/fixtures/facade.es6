export class MapWrapper {

}

export class ArrayWrapper extends Array {
  constructor() {
    // Returning modified native array instance so Jasmine equality works
    var wrapper = [];
    for (var method in ArrayWrapper.prototype) {
      if (ArrayWrapper.prototype.hasOwnProperty(method)) {
        wrapper[method] = ArrayWrapper.prototype[method];
      }
    }
    return wrapper;
  }
}