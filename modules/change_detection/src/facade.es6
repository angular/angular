export var SetterFn = Function;

export class FieldGetterFactory {
  getter(object, name:string) {
    return new Function('o', 'return o["' + name + '"]');
  }
}
