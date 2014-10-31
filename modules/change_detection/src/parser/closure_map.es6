export var SetterFn = Function;

export class ClosureMap {
  getter(name:string) {
    return new Function('o', 'return o.' + name + ';');
  }
}
