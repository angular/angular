export var SetterFn = Function;

export class ClosureMap {
  getter(name:string) {
    return new Function('o', 'return o.' + name + ';');
  }

  setter(name:string) {
    return new Function('o', 'v', 'return o.' + name + ' = v;');
  }

  fn(name:string) {
    return new Function('o', 'pos', 'return o.' + name + '.apply(o, pos);');
  }
}
